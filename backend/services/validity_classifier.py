"""
validity_classifier.py
======================
Phase 8 — Recipe Validity / Cookability Classifier.

Scores generated recipes on a scale of 0–100 based on:
    - Ingredient compatibility (from Chemistry Validator, Phase 4)
    - Logical consistency (from Contradiction Detector, Phase 6)
    - Recipe completeness (ingredient count, step count, step detail)
    - Cuisine consistency (from Cuisine Classifier, Phase 3)
    - User preference alignment

Uses a trained XGBoost Regressor for predictions when available,
with a deterministic rule-based fallback.

Scoring thresholds:
    - score >= 80  → VALID (serve to user)
    - 60 <= score < 80 → MARGINAL (serve with warning)
    - score < 60   → REJECTED (do not serve)

Usage:
    classifier = ValidityClassifier()
    result = classifier.score_recipe(recipe_data, chemistry_result, contradiction_result, cuisine_result)
    # → {"score": 91, "status": "VALID", "breakdown": {...}}
"""

import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

import numpy as np

logger = logging.getLogger(__name__)

_MODELS_DIR = Path(__file__).resolve().parent.parent / "models"


class ValidityClassifier:
    """
    Scores recipe quality/cookability using XGBoost or rule-based fallback.

    Loads a pre-trained XGBoost model from disk if available.
    Falls back to deterministic weighted scoring if the model is missing.
    """

    # ── Scoring Weights (used in both model features and fallback) ──
    WEIGHTS = {
        "chemistry":    0.30,   # Ingredient compatibility
        "logic":        0.25,   # Step consistency / contradictions
        "completeness": 0.20,   # Recipe completeness
        "cuisine":      0.15,   # Cuisine classification confidence
        "preference":   0.10,   # User preference alignment
    }

    def __init__(self, models_dir: Optional[Path] = None):
        self.models_dir = models_dir or _MODELS_DIR
        self.model = None
        self._model_loaded = False
        self._load_model()

    def _load_model(self) -> None:
        """Try to load the trained XGBoost model."""
        model_path = self.models_dir / "validity_model.pkl"

        if not model_path.exists():
            logger.warning(
                "Validity model not found at %s. "
                "Using rule-based fallback scoring. "
                "Run `python training/train_validity_model.py` to train.",
                model_path,
            )
            return

        try:
            import joblib
            self.model = joblib.load(model_path)
            self._model_loaded = True
            logger.info("Validity classifier loaded from %s", model_path)
        except Exception as e:
            logger.error("Failed to load validity model: %s", e)

    @property
    def is_ready(self) -> bool:
        """Whether the ML model is loaded (fallback always works)."""
        return self._model_loaded

    def score_recipe(
        self,
        recipe_data: Dict[str, Any],
        chemistry_result: Optional[Dict[str, Any]] = None,
        contradiction_result: Optional[Dict[str, Any]] = None,
        cuisine_result: Optional[Dict[str, Any]] = None,
        user_preferences: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Score a recipe for cookability / validity.

        Args:
            recipe_data: The recipe dict with "ingredients" and "steps"/"instructions".
            chemistry_result: Output from ChemistryValidator.validate_recipe().
            contradiction_result: Output from ContradictionDetector.detect().
            cuisine_result: Output from CuisineClassifier.predict().
            user_preferences: Optional user preferences for alignment scoring.

        Returns:
            Dict with:
                - score: 0–100 cookability score
                - status: "VALID" / "MARGINAL" / "REJECTED"
                - breakdown: Per-category score breakdown
                - recommendation: Human-readable recommendation
        """
        # ── Extract Features ──────────────────────────────
        features = self._extract_features(
            recipe_data, chemistry_result, contradiction_result,
            cuisine_result, user_preferences,
        )

        # ── Score (ML or fallback) ────────────────────────
        if self._model_loaded:
            score = self._predict_with_model(features)
        else:
            score = self._rule_based_score(features)

        # Clamp to 0–100
        score = max(0.0, min(100.0, round(score, 1)))

        # Determine status
        if score >= 80:
            status = "VALID"
            recommendation = "Recipe is high quality and ready to serve."
        elif score >= 60:
            status = "MARGINAL"
            recommendation = "Recipe has some issues. Consider reviewing before serving."
        else:
            status = "REJECTED"
            recommendation = "Recipe quality is below threshold. Regeneration recommended."

        return {
            "score": score,
            "status": status,
            "breakdown": features,
            "recommendation": recommendation,
            "model_used": "xgboost" if self._model_loaded else "rule-based",
        }

    def _extract_features(
        self,
        recipe_data: Dict[str, Any],
        chemistry_result: Optional[Dict[str, Any]],
        contradiction_result: Optional[Dict[str, Any]],
        cuisine_result: Optional[Dict[str, Any]],
        user_preferences: Optional[Dict[str, Any]],
    ) -> Dict[str, float]:
        """
        Extract all scoring features from the input data.

        Returns a dict of feature_name → score (0–100 each).
        """
        ingredients = recipe_data.get("ingredients", [])
        steps = recipe_data.get("steps", recipe_data.get("instructions", []))
        if isinstance(steps, str):
            steps = [s.strip() for s in steps.split(".") if s.strip()]

        # ── Chemistry Score ───────────────────────────────
        if chemistry_result:
            violations = chemistry_result if isinstance(chemistry_result, list) else []
            error_count = sum(1 for v in violations if v.get("severity") == "error")
            warning_count = sum(1 for v in violations if v.get("severity") == "warning")
            chemistry_score = max(0, 100 - (error_count * 25) - (warning_count * 10))
        else:
            chemistry_score = 85.0  # Default if not run

        # ── Logic Score ───────────────────────────────────
        if contradiction_result:
            logic_score = float(contradiction_result.get("logic_score", 85))
        else:
            logic_score = 85.0

        # ── Completeness Score ────────────────────────────
        completeness_score = self._compute_completeness(ingredients, steps)

        # ── Cuisine Confidence ────────────────────────────
        if cuisine_result:
            confidence = cuisine_result.get("confidence", 0)
            cuisine_score = min(100, confidence * 100)
        else:
            cuisine_score = 70.0

        # ── Preference Score ──────────────────────────────
        preference_score = self._compute_preference_alignment(
            recipe_data, user_preferences
        )

        return {
            "chemistry_score": round(chemistry_score, 1),
            "logic_score": round(logic_score, 1),
            "completeness_score": round(completeness_score, 1),
            "cuisine_score": round(cuisine_score, 1),
            "preference_score": round(preference_score, 1),
            # Raw features (useful for model training)
            "ingredient_count": len(ingredients),
            "step_count": len(steps),
            "avg_step_length": round(
                np.mean([len(s.split()) for s in steps]) if steps else 0, 1
            ),
        }

    def _compute_completeness(
        self,
        ingredients: List[str],
        steps: List[str],
    ) -> float:
        """
        Score recipe completeness based on structural metrics.

        A complete recipe should have:
            - At least 3 ingredients (max credit at 5+)
            - At least 2 steps (max credit at 4+)
            - Steps with reasonable detail (avg 5+ words per step)
            - Has a protein or main ingredient
        """
        score = 0.0

        # Ingredient count (0–30 points)
        ing_count = len(ingredients)
        if ing_count >= 5:
            score += 30
        elif ing_count >= 3:
            score += 20
        elif ing_count >= 1:
            score += 10

        # Step count (0–30 points)
        step_count = len(steps)
        if step_count >= 4:
            score += 30
        elif step_count >= 2:
            score += 20
        elif step_count >= 1:
            score += 10

        # Step detail — average words per step (0–25 points)
        if steps:
            avg_words = np.mean([len(s.split()) for s in steps])
            if avg_words >= 10:
                score += 25
            elif avg_words >= 5:
                score += 15
            elif avg_words >= 3:
                score += 10

        # Has meaningful content (0–15 points)
        all_text = " ".join(ingredients + steps).lower()
        has_protein = any(p in all_text for p in [
            "chicken", "beef", "pork", "fish", "tofu", "eggs", "shrimp",
            "lamb", "turkey", "paneer", "lentil", "bean", "chickpea",
        ])
        has_carb = any(c in all_text for c in [
            "rice", "pasta", "bread", "noodle", "potato", "flour", "tortilla",
        ])
        if has_protein:
            score += 8
        if has_carb:
            score += 7

        return min(100, score)

    def _compute_preference_alignment(
        self,
        recipe_data: Dict[str, Any],
        preferences: Optional[Dict[str, Any]],
    ) -> float:
        """
        Score how well the recipe aligns with user preferences.
        Returns 75 (neutral) if no preferences provided.
        """
        if not preferences:
            return 75.0

        score = 100.0
        ingredients_text = " ".join(
            recipe_data.get("ingredients", [])
        ).lower()

        # Check allergen violations
        allergies = preferences.get("allergies", [])
        for allergy in allergies:
            if allergy.lower() in ingredients_text:
                score -= 30

        return max(0, score)

    def _predict_with_model(self, features: Dict[str, float]) -> float:
        """Predict cookability score using the trained XGBoost model."""
        # Build feature vector in the same order as training
        feature_vector = np.array([[
            features["chemistry_score"],
            features["logic_score"],
            features["completeness_score"],
            features["cuisine_score"],
            features["preference_score"],
            features["ingredient_count"],
            features["step_count"],
            features["avg_step_length"],
        ]])

        prediction = self.model.predict(feature_vector)[0]
        return float(prediction)

    def _rule_based_score(self, features: Dict[str, float]) -> float:
        """
        Deterministic fallback scoring using weighted average.
        Used when the XGBoost model is not available.
        """
        weighted_score = (
            features["chemistry_score"] * self.WEIGHTS["chemistry"]
            + features["logic_score"] * self.WEIGHTS["logic"]
            + features["completeness_score"] * self.WEIGHTS["completeness"]
            + features["cuisine_score"] * self.WEIGHTS["cuisine"]
            + features["preference_score"] * self.WEIGHTS["preference"]
        )
        return weighted_score


if __name__ == "__main__":
    import json
    import sys

    sys.stdout.reconfigure(encoding="utf-8")
    logging.basicConfig(level=logging.INFO)

    classifier = ValidityClassifier()

    print(f"Model loaded: {'✅ XGBoost' if classifier.is_ready else '🔄 Rule-based fallback'}\n")

    test_cases = [
        {
            "name": "1. High quality recipe",
            "recipe": {
                "ingredients": ["chicken breast", "olive oil", "garlic", "lemon", "salt", "pepper", "rosemary"],
                "steps": [
                    "Preheat the oven to 200°C.",
                    "Season the chicken with salt, pepper, and rosemary.",
                    "Heat olive oil in an oven-safe skillet over medium heat.",
                    "Sear the chicken for 3 minutes per side.",
                    "Squeeze lemon over the chicken and transfer to the oven.",
                    "Bake for 20 minutes until internal temp reaches 75°C.",
                ],
            },
            "chemistry": [],
            "contradiction": {"logic_score": 100, "is_valid": True},
            "cuisine": {"cuisine": "Western", "confidence": 0.82},
        },
        {
            "name": "2. Low quality (incomplete, contradictions)",
            "recipe": {
                "ingredients": ["chicken"],
                "steps": ["Cook it."],
            },
            "chemistry": [{"severity": "error", "rule": "test"}],
            "contradiction": {"logic_score": 40, "is_valid": False},
            "cuisine": {"cuisine": "Unknown", "confidence": 0.2},
        },
        {
            "name": "3. Medium quality",
            "recipe": {
                "ingredients": ["rice", "soy sauce", "vegetables", "sesame oil"],
                "steps": [
                    "Cook rice according to package instructions.",
                    "Stir fry vegetables in sesame oil.",
                    "Add soy sauce and serve.",
                ],
            },
            "chemistry": [],
            "contradiction": {"logic_score": 80, "is_valid": True},
            "cuisine": {"cuisine": "Chinese", "confidence": 0.65},
        },
    ]

    for tc in test_cases:
        print(f"--- {tc['name']} ---")
        result = classifier.score_recipe(
            recipe_data=tc["recipe"],
            chemistry_result=tc["chemistry"],
            contradiction_result=tc["contradiction"],
            cuisine_result=tc["cuisine"],
        )
        status_icon = {"VALID": "✅", "MARGINAL": "⚠️", "REJECTED": "❌"}
        print(f"Score: {result['score']} {status_icon[result['status']]} {result['status']}")
        print(f"Model: {result['model_used']}")
        print(f"Breakdown:")
        for key in ["chemistry_score", "logic_score", "completeness_score", "cuisine_score", "preference_score"]:
            print(f"  {key}: {result['breakdown'][key]}")
        print(f"Recommendation: {result['recommendation']}")
        print()
