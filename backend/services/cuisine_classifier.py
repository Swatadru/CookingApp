"""
cuisine_classifier.py
=====================
Cuisine Classification Service — XGBoost + TF-IDF inference engine.

Architecture:
    1. Loads pre-trained XGBoost model, TF-IDF vectorizer, and label encoder.
    2. Vectorizes ingredient text into the trained TF-IDF feature space.
    3. Predicts cuisine class probabilities using XGBoost softprob output.
    4. Returns top-K predictions with confidence scores and thresholding.

Design:
    - Class-based for FastAPI dependency injection.
    - Loads model artifacts once at startup.
    - Handles OOV ingredients gracefully (sparse vectors with zero features).
    - Configurable confidence thresholds for filtering low-quality predictions.

Usage:
    classifier = CuisineClassifier()
    result = classifier.predict(["chicken", "garlic", "ginger", "soy sauce"])
    # → {"cuisine": "Chinese", "confidence": 0.87, "top_predictions": [...]}

    result = classifier.predict_from_text("paneer tikka masala with naan")
    # → {"cuisine": "Indian", "confidence": 0.94, ...}
"""

import logging
import warnings
from pathlib import Path
from typing import Any, Dict, List, Optional

import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder

warnings.filterwarnings("ignore", category=UserWarning)

logger = logging.getLogger(__name__)


# =========================================================
# PATHS
# =========================================================

_SERVICE_DIR = Path(__file__).parent
_MODELS_DIR = _SERVICE_DIR.parent / "models"


# =========================================================
# CuisineClassifier Service
# =========================================================

class CuisineClassifier:
    """
    Cuisine classification service using a pre-trained XGBoost model
    with TF-IDF vectorized ingredient features.

    Loads model artifacts from disk at initialization and provides
    fast inference with probability-ranked predictions.

    Attributes:
        model: Trained XGBoost classifier.
        vectorizer: Fitted TF-IDF vectorizer (same feature space as training).
        label_encoder: Maps between cuisine names and numeric labels.
        training_meta: Training metadata (accuracy, class distribution, etc.).
        _model_loaded: Whether all artifacts loaded successfully.

    Example:
        >>> clf = CuisineClassifier()
        >>> result = clf.predict(["chicken", "garlic", "soy sauce", "ginger"])
        >>> print(result["cuisine"], result["confidence"])
        Chinese 0.87
    """

    def __init__(
        self,
        models_dir: Optional[Path] = None,
        confidence_threshold: float = 0.3,
    ) -> None:
        """
        Initialize the classifier by loading pre-trained model artifacts.

        Args:
            models_dir: Path to directory containing model .pkl files.
                        Defaults to backend/models/.
            confidence_threshold: Minimum confidence to consider a prediction
                                  valid. Below this, the result is flagged as
                                  "uncertain".
        """
        self.models_dir = models_dir or _MODELS_DIR
        self.confidence_threshold = confidence_threshold

        self.model: Optional[Any] = None
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.label_encoder: Optional[LabelEncoder] = None
        self.training_meta: Optional[Dict[str, Any]] = None
        self._model_loaded: bool = False

        self._load_model()

    def _load_model(self) -> None:
        """Load all model artifacts from disk."""
        model_path = self.models_dir / "cuisine_classifier.pkl"
        vectorizer_path = self.models_dir / "cuisine_vectorizer.pkl"
        encoder_path = self.models_dir / "cuisine_label_encoder.pkl"
        meta_path = self.models_dir / "cuisine_training_meta.pkl"

        required = [model_path, vectorizer_path, encoder_path]

        if not all(p.exists() for p in required):
            missing = [p.name for p in required if not p.exists()]
            logger.warning(
                "Missing model artifacts: %s. "
                "Run `python training/train_cuisine_classifier.py` first.",
                missing,
            )
            self._model_loaded = False
            return

        logger.info("Loading cuisine classifier from %s ...", self.models_dir)

        self.model = joblib.load(model_path)
        self.vectorizer = joblib.load(vectorizer_path)
        self.label_encoder = joblib.load(encoder_path)

        # Training meta is optional
        if meta_path.exists():
            self.training_meta = joblib.load(meta_path)
            logger.info(
                "Training accuracy: %.4f, Classes: %d",
                self.training_meta.get("accuracy", 0),
                self.training_meta.get("num_classes", 0),
            )

        self._model_loaded = True

        logger.info(
            "Classifier loaded: %d cuisine classes — %s",
            len(self.label_encoder.classes_),
            list(self.label_encoder.classes_),
        )

    @property
    def is_ready(self) -> bool:
        """Whether the model is loaded and ready for inference."""
        return self._model_loaded

    @property
    def cuisine_classes(self) -> List[str]:
        """List of all cuisine classes the model can predict."""
        if self.label_encoder is not None:
            return list(self.label_encoder.classes_)
        return []

    @property
    def num_classes(self) -> int:
        """Number of cuisine classes."""
        return len(self.cuisine_classes)

    @property
    def model_accuracy(self) -> Optional[float]:
        """Training accuracy of the loaded model (if metadata available)."""
        if self.training_meta is not None:
            return self.training_meta.get("accuracy")
        return None

    def predict(
        self,
        ingredients: List[str],
        top_k: int = 5,
    ) -> Dict[str, Any]:
        """
        Predict cuisine from a list of ingredient strings.

        Args:
            ingredients: List of ingredient names (e.g., ["chicken", "soy sauce"]).
            top_k: Number of top cuisine predictions to return.

        Returns:
            Dict containing:
                - cuisine: Top predicted cuisine name.
                - confidence: Probability of the top prediction (0–1).
                - is_confident: Whether confidence exceeds the threshold.
                - top_predictions: List of top-K dicts with cuisine and probability.
                - input_ingredients: The input ingredients used.
                - vocabulary_overlap: How many input tokens matched the TF-IDF vocab.
        """
        if not self._model_loaded:
            return self._error_response("Model not loaded.")

        if not ingredients:
            return self._error_response("No ingredients provided.")

        # Normalize and join ingredients into a single text string
        # (matches training data format)
        ingredient_text = " ".join(
            ing.lower().strip() for ing in ingredients if ing.strip()
        )

        return self._predict_text(ingredient_text, ingredients, top_k)

    def predict_from_text(
        self,
        text: str,
        top_k: int = 5,
    ) -> Dict[str, Any]:
        """
        Predict cuisine from free-form ingredient text.

        Accepts a comma-separated or space-separated string of ingredients,
        or a natural language description.

        Args:
            text: Free-form text describing ingredients or a dish.
            top_k: Number of top cuisine predictions to return.

        Returns:
            Same format as predict().
        """
        if not self._model_loaded:
            return self._error_response("Model not loaded.")

        if not text or not text.strip():
            return self._error_response("No text provided.")

        cleaned = text.lower().strip()
        # Split on commas if present, otherwise use as-is
        if "," in cleaned:
            ingredients = [ing.strip() for ing in cleaned.split(",") if ing.strip()]
        else:
            ingredients = [cleaned]

        ingredient_text = " ".join(ingredients)

        return self._predict_text(ingredient_text, ingredients, top_k)

    def predict_batch(
        self,
        ingredient_lists: List[List[str]],
        top_k: int = 3,
    ) -> List[Dict[str, Any]]:
        """
        Predict cuisine for multiple recipes in a single batch.

        More efficient than calling predict() in a loop because it
        vectorizes all inputs at once.

        Args:
            ingredient_lists: List of ingredient lists, one per recipe.
            top_k: Number of top predictions per recipe.

        Returns:
            List of prediction dicts, one per input recipe.
        """
        if not self._model_loaded:
            return [self._error_response("Model not loaded.")] * len(ingredient_lists)

        if not ingredient_lists:
            return []

        # Build text corpus from all ingredient lists
        texts: List[str] = []
        for ingredients in ingredient_lists:
            text = " ".join(ing.lower().strip() for ing in ingredients if ing.strip())
            texts.append(text)

        # Batch vectorize
        X_vec = self.vectorizer.transform(texts)

        # Batch predict probabilities
        probas = self.model.predict_proba(X_vec)

        # Build results
        results: List[Dict[str, Any]] = []
        for i, (proba, ingredients) in enumerate(zip(probas, ingredient_lists)):
            result = self._build_result(proba, texts[i], ingredients, top_k)
            results.append(result)

        return results

    def _predict_text(
        self,
        ingredient_text: str,
        original_ingredients: List[str],
        top_k: int,
    ) -> Dict[str, Any]:
        """
        Internal prediction from pre-cleaned ingredient text.

        Args:
            ingredient_text: Joined, lowercased ingredient string.
            original_ingredients: Original ingredient list for metadata.
            top_k: Number of top predictions.

        Returns:
            Prediction result dict.
        """
        # Vectorize
        X_vec = self.vectorizer.transform([ingredient_text])

        # Check vocabulary overlap
        vocab_overlap = X_vec.nnz
        total_tokens = len(ingredient_text.split())

        if vocab_overlap == 0:
            logger.info(
                "No vocabulary overlap for input: '%s'. "
                "All tokens are OOV — prediction will be unreliable.",
                ingredient_text[:100],
            )

        # Predict probabilities
        probas = self.model.predict_proba(X_vec)[0]

        result = self._build_result(probas, ingredient_text, original_ingredients, top_k)

        # Add vocabulary overlap info
        result["vocabulary_overlap"] = {
            "matched_features": int(vocab_overlap),
            "input_tokens": total_tokens,
            "coverage": round(vocab_overlap / max(total_tokens, 1), 4),
        }

        return result

    def _build_result(
        self,
        probas: np.ndarray,
        ingredient_text: str,
        original_ingredients: List[str],
        top_k: int,
    ) -> Dict[str, Any]:
        """
        Build a structured result dict from probability predictions.

        Args:
            probas: Array of class probabilities from XGBoost.
            ingredient_text: The vectorized text.
            original_ingredients: Original ingredient list.
            top_k: Number of top predictions.

        Returns:
            Structured prediction result.
        """
        # Get top-K indices sorted by probability
        effective_k = min(top_k, len(probas))
        top_indices = np.argsort(probas)[::-1][:effective_k]

        # Build top predictions
        top_predictions: List[Dict[str, Any]] = []
        for idx in top_indices:
            cuisine_name = self.label_encoder.inverse_transform([idx])[0]
            prob = float(probas[idx])
            top_predictions.append({
                "cuisine": cuisine_name,
                "confidence": round(prob, 4),
            })

        # Top-1 prediction
        top_cuisine = top_predictions[0]["cuisine"]
        top_confidence = top_predictions[0]["confidence"]

        return {
            "cuisine": top_cuisine,
            "confidence": top_confidence,
            "is_confident": top_confidence >= self.confidence_threshold,
            "top_predictions": top_predictions,
            "input_ingredients": original_ingredients,
        }

    def _error_response(self, message: str) -> Dict[str, Any]:
        """
        Build a standardized error response.

        Args:
            message: Human-readable error description.

        Returns:
            Error dict with null predictions.
        """
        return {
            "cuisine": None,
            "confidence": 0.0,
            "is_confident": False,
            "top_predictions": [],
            "input_ingredients": [],
            "error": message,
        }

    def __repr__(self) -> str:
        status = "ready" if self._model_loaded else "not loaded"
        classes = self.num_classes
        acc = f"{self.model_accuracy:.4f}" if self.model_accuracy else "N/A"
        return f"<CuisineClassifier status={status} classes={classes} accuracy={acc}>"


# =========================================================
# Standalone Test
# =========================================================

if __name__ == "__main__":
    import sys
    import json

    sys.stdout.reconfigure(encoding="utf-8")

    logging.basicConfig(level=logging.INFO)

    print("Initializing CuisineClassifier...")
    clf = CuisineClassifier()
    print(clf)
    print()

    if not clf.is_ready:
        print("ERROR: Model not loaded. Run train_cuisine_classifier.py first.")
        sys.exit(1)

    # ---- Test Suite ----
    test_cases = [
        {
            "name": "Indian (South)",
            "ingredients": ["1 cup paneer", "1 tsp turmeric", "2 tsp cumin", "1 tbsp coriander", "1 tsp garam masala", "2 tbsp ghee"],
        },
        {
            "name": "Chinese",
            "ingredients": ["2 tbsp soy sauce", "1 inch ginger", "1 tbsp sesame oil", "2 cups rice", "200 grams tofu", "1 scallion"],
        },
        {
            "name": "Italian",
            "ingredients": ["500g pasta", "2 tbsp olive oil", "3 cloves garlic", "1/2 cup parmesan", "fresh basil", "2 cups tomato sauce"],
        },
        {
            "name": "Thai",
            "ingredients": ["1 cup coconut milk", "1 stalk lemongrass", "2 tbsp fish sauce", "3 red chilies", "1 lime juice", "thai basil"],
        },
        {
            "name": "Mexican",
            "ingredients": ["4 corn tortillas", "1 cup black beans", "1/2 cup salsa", "1 avocado", "1 jalapeño", "lime"],
        },
        {
            "name": "Western",
            "ingredients": ["2 tbsp butter", "1/2 cup heavy cream", "2 shallots", "1/4 cup white wine", "fresh thyme", "1 tsp dijon mustard"],
        },
        {
            "name": "OOV Edge Case",
            "ingredients": ["1 cup xylitol", "2 cups kefir", "100g tempeh"],
        },
        {
            "name": "Free-text",
            "text": "paneer tikka masala with naan and raita",
        },
    ]

    for i, tc in enumerate(test_cases, 1):
        name = tc["name"]
        print(f"\n{'=' * 60}")
        print(f"Test {i}: {name}")
        print("-" * 60)

        if "text" in tc:
            result = clf.predict_from_text(tc["text"])
            print(f"  Input (text): \"{tc['text']}\"")
        else:
            result = clf.predict(tc["ingredients"])
            print(f"  Input: {tc['ingredients']}")

        print(f"  Predicted:  {result['cuisine']}")
        print(f"  Confidence: {result['confidence']}")
        print(f"  Confident?  {'✓' if result['is_confident'] else '✗'}")
        print(f"  Top-3:")
        for p in result["top_predictions"][:3]:
            bar = "█" * int(p["confidence"] * 30)
            print(f"    {p['cuisine']:20s} {p['confidence']:.4f}  {bar}")

        if "vocabulary_overlap" in result:
            vo = result["vocabulary_overlap"]
            print(f"  Vocab overlap: {vo['matched_features']}/{vo['input_tokens']} tokens ({vo['coverage']:.0%})")

    # ---- Batch Test ----
    print(f"\n{'=' * 60}")
    print("Batch Prediction Test (3 recipes)")
    print("-" * 60)

    batch_input = [
        ["chicken", "yogurt", "tandoori masala", "ginger"],
        ["pasta", "mozzarella", "oregano", "tomato sauce"],
        ["rice", "soy sauce", "tofu", "sesame"],
    ]

    batch_results = clf.predict_batch(batch_input, top_k=2)

    for i, (ingredients, result) in enumerate(zip(batch_input, batch_results), 1):
        print(f"  Recipe {i}: {ingredients}")
        print(f"    → {result['cuisine']} ({result['confidence']:.4f})")

    print(f"\n{'=' * 60}")
    print("All tests complete.")
