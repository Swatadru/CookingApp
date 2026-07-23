"""
train_validity_model.py
=======================
Phase 8 — Train the XGBoost Cookability Classifier.

Generates synthetic training data from the existing recipe database by
computing features (ingredient count, step count, chemistry score, etc.)
and generating synthetic cookability labels using a weighted formula.

Then trains an XGBoost Regressor and saves it to models/validity_model.pkl.

Usage:
    python training/train_validity_model.py

The training process:
    1. Load recipes from database/recipe_database.json (sampled for speed)
    2. For each recipe, extract features:
       - ingredient_count, step_count, avg_step_length
       - chemistry_score (from ChemistryValidator)
       - logic_score (from ContradictionDetector)
       - cuisine_confidence (from CuisineClassifier)
       - completeness_score (rule-based)
    3. Generate synthetic labels using weighted combination
    4. Add noise to make the model learn non-trivial patterns
    5. Train XGBoost Regressor
    6. Evaluate on held-out test set
    7. Save model to models/validity_model.pkl
"""

import sys
import json
import logging
import warnings
from pathlib import Path

import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from xgboost import XGBRegressor

# Add parent dir to path so we can import services
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from services.chemistry_validator import ChemistryValidator
from services.contradiction_detector import ContradictionDetector

warnings.filterwarnings("ignore")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# ── Paths ─────────────────────────────────────────────────
_BACKEND_DIR = Path(__file__).resolve().parent.parent
_DATABASE_PATH = _BACKEND_DIR / "database" / "recipe_database.json"
_MODEL_OUTPUT = _BACKEND_DIR / "models" / "validity_model.pkl"

# ── Config ────────────────────────────────────────────────
SAMPLE_SIZE = 15_000       # Number of recipes to sample for training
TEST_SPLIT = 0.2           # 20% held out for evaluation
RANDOM_SEED = 42
NOISE_STD = 5.0            # Std dev of Gaussian noise added to synthetic labels


def load_recipes(sample_size: int) -> list:
    """Load and sample recipes directly from the live PostgreSQL database."""
    from db.engine import engine
    from sqlalchemy import text
    import json
    
    logger.info("Loading recipes from live PostgreSQL database...")
    recipes = []
    
    with engine.connect() as conn:
        # We sample randomly by ordering by RANDOM()
        result = conn.execute(text(f"SELECT title, ingredients, directions FROM recipes ORDER BY RANDOM() LIMIT {sample_size}"))
        for row in result:
            try:
                # Handle stringified JSON from the database
                ingredients = json.loads(row[1]) if isinstance(row[1], str) else row[1]
                directions = json.loads(row[2]) if isinstance(row[2], str) else row[2]
                
                recipes.append({
                    "title": row[0],
                    "ingredients": ingredients,
                    "steps": directions
                })
            except Exception:
                continue
                
    logger.info("Sampled %d recipes for training from live database", len(recipes))
    return recipes



def extract_features(
    recipe: dict,
    chemistry_validator: ChemistryValidator,
    contradiction_detector: ContradictionDetector,
) -> dict:
    """
    Extract feature vector from a single recipe.

    Returns None if the recipe is malformed.
    """
    # Get ingredients
    ingredients = recipe.get("ingredients", recipe.get("NER", []))
    if isinstance(ingredients, str):
        ingredients = [i.strip() for i in ingredients.split(",") if i.strip()]

    # Get steps
    steps = recipe.get("steps", recipe.get("instructions", recipe.get("directions", [])))
    if isinstance(steps, str):
        steps = [s.strip() for s in steps.split(".") if s.strip()]

    if not ingredients or not steps:
        return None

    # ── Basic Features ────────────────────────────────
    ingredient_count = len(ingredients)
    step_count = len(steps)
    step_lengths = [len(s.split()) for s in steps]
    avg_step_length = float(np.mean(step_lengths)) if step_lengths else 0

    # ── Chemistry Score ───────────────────────────────
    try:
        violations = chemistry_validator.validate_recipe(ingredients)
        error_count = sum(1 for v in violations if v.get("severity") == "error")
        warning_count = sum(1 for v in violations if v.get("severity") == "warning")
        chemistry_score = max(0, 100 - (error_count * 25) - (warning_count * 10))
    except Exception:
        chemistry_score = 85.0

    # ── Logic Score ───────────────────────────────────
    try:
        recipe_for_detector = {"ingredients": ingredients, "steps": steps}
        contradiction_result = contradiction_detector.detect(recipe_for_detector)
        logic_score = float(contradiction_result.get("logic_score", 85))
    except Exception:
        logic_score = 85.0

    # ── Completeness Score ────────────────────────────
    completeness = 0
    if ingredient_count >= 5:
        completeness += 30
    elif ingredient_count >= 3:
        completeness += 20
    elif ingredient_count >= 1:
        completeness += 10

    if step_count >= 4:
        completeness += 30
    elif step_count >= 2:
        completeness += 20
    elif step_count >= 1:
        completeness += 10

    if avg_step_length >= 10:
        completeness += 25
    elif avg_step_length >= 5:
        completeness += 15
    elif avg_step_length >= 3:
        completeness += 10

    all_text = " ".join(ingredients + steps).lower()
    has_protein = any(p in all_text for p in [
        "chicken", "beef", "pork", "fish", "tofu", "eggs", "shrimp",
        "lamb", "turkey", "paneer", "lentil", "bean",
    ])
    has_carb = any(c in all_text for c in [
        "rice", "pasta", "bread", "noodle", "potato", "flour",
    ])
    if has_protein:
        completeness += 8
    if has_carb:
        completeness += 7
    completeness = min(100, completeness)

    # ── Cuisine Confidence (approximate without model) ──
    # Use heuristic: more ingredients = higher confidence
    cuisine_score = min(100, 50 + ingredient_count * 5)

    # ── Preference Score (neutral for training) ───────
    preference_score = 75.0

    return {
        "chemistry_score": chemistry_score,
        "logic_score": logic_score,
        "completeness_score": float(completeness),
        "cuisine_score": float(cuisine_score),
        "preference_score": preference_score,
        "ingredient_count": ingredient_count,
        "step_count": step_count,
        "avg_step_length": round(avg_step_length, 2),
    }


def generate_synthetic_label(features: dict) -> float:
    """
    Generate a synthetic cookability score using the weighted formula.
    Adds Gaussian noise to create non-trivial patterns for the model.
    """
    base_score = (
        features["chemistry_score"] * 0.30
        + features["logic_score"] * 0.25
        + features["completeness_score"] * 0.20
        + features["cuisine_score"] * 0.15
        + features["preference_score"] * 0.10
    )

    # Add controlled noise
    noise = np.random.normal(0, NOISE_STD)
    score = base_score + noise

    # Clamp to [0, 100]
    return float(np.clip(score, 0, 100))


def main():
    """Main training pipeline."""
    print("=" * 60)
    print("Phase 8: Training Recipe Validity Classifier")
    print("=" * 60)

    # ── 1. Load Data ──────────────────────────────────
    recipes = load_recipes(SAMPLE_SIZE)
    if not recipes:
        logger.error("No recipes loaded. Exiting.")
        sys.exit(1)

    # ── 2. Initialize Validators ──────────────────────
    logger.info("Initializing validators...")
    chemistry = ChemistryValidator()
    contradiction = ContradictionDetector()

    # ── 3. Extract Features ───────────────────────────
    logger.info("Extracting features from %d recipes...", len(recipes))
    feature_rows = []
    labels = []

    for i, recipe in enumerate(recipes):
        if (i + 1) % 1000 == 0:
            logger.info("  Processed %d / %d recipes", i + 1, len(recipes))

        features = extract_features(recipe, chemistry, contradiction)
        if features is None:
            continue

        label = generate_synthetic_label(features)
        feature_rows.append(features)
        labels.append(label)

    logger.info("Extracted features from %d valid recipes", len(feature_rows))

    if len(feature_rows) < 100:
        logger.error("Too few valid recipes (%d). Need at least 100.", len(feature_rows))
        sys.exit(1)

    # ── 4. Build DataFrame ────────────────────────────
    df = pd.DataFrame(feature_rows)
    df["label"] = labels

    # Feature columns (same order as ValidityClassifier._predict_with_model)
    feature_cols = [
        "chemistry_score", "logic_score", "completeness_score",
        "cuisine_score", "preference_score",
        "ingredient_count", "step_count", "avg_step_length",
    ]

    X = df[feature_cols].values
    y = df["label"].values

    logger.info("Feature matrix shape: %s", X.shape)
    logger.info("Label stats: mean=%.1f, std=%.1f, min=%.1f, max=%.1f",
                y.mean(), y.std(), y.min(), y.max())

    # ── 5. Train/Test Split ───────────────────────────
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SPLIT, random_state=RANDOM_SEED,
    )
    logger.info("Train: %d samples, Test: %d samples", len(X_train), len(X_test))

    # ── 6. Train XGBoost ──────────────────────────────
    logger.info("Training XGBoost Regressor...")
    model = XGBRegressor(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        reg_alpha=0.1,
        reg_lambda=1.0,
        random_state=RANDOM_SEED,
        objective="reg:squarederror",
    )

    model.fit(
        X_train, y_train,
        eval_set=[(X_test, y_test)],
        verbose=False,
    )

    # ── 7. Evaluate ───────────────────────────────────
    from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

    y_pred = model.predict(X_test)

    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)

    print(f"\n{'─' * 40}")
    print(f"Evaluation Results:")
    print(f"  MAE:  {mae:.2f}")
    print(f"  RMSE: {rmse:.2f}")
    print(f"  R²:   {r2:.4f}")
    print(f"{'─' * 40}")

    # Feature importances
    importances = model.feature_importances_
    print("\nFeature Importances:")
    for col, imp in sorted(zip(feature_cols, importances), key=lambda x: -x[1]):
        bar = "█" * int(imp * 50)
        print(f"  {col:25s} {imp:.4f}  {bar}")

    # ── 8. Save Model ─────────────────────────────────
    _MODEL_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, _MODEL_OUTPUT)
    logger.info("Model saved to %s", _MODEL_OUTPUT)

    # Save training metadata
    meta = {
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "r2": round(r2, 4),
        "feature_columns": feature_cols,
        "feature_importances": {
            col: round(float(imp), 4)
            for col, imp in zip(feature_cols, importances)
        },
    }
    meta_path = _MODEL_OUTPUT.with_suffix(".meta.json")
    with open(meta_path, "w") as f:
        json.dump(meta, f, indent=2)
    logger.info("Training metadata saved to %s", meta_path)

    print(f"\n✅ Training complete! Model saved to {_MODEL_OUTPUT}")
    print(f"   Metadata saved to {meta_path}")


if __name__ == "__main__":
    import sys
    sys.stdout.reconfigure(encoding="utf-8")
    main()
