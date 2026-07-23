"""
cuisine_classifier_router.py
=============================
API endpoint for Cuisine Classification using the XGBoost ML model.

Endpoint:
    POST /api/classify — Predict cuisine from a list of ingredients
"""

from typing import List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["Cuisine Classification"])

# Lazy-load the classifier to avoid slow startup if model files are missing
_classifier = None


def _get_classifier():
    """Lazy-load the CuisineClassifier singleton."""
    global _classifier
    if _classifier is None:
        try:
            from services.cuisine_classifier import CuisineClassifier
            _classifier = CuisineClassifier()
        except Exception as e:
            print(f"Warning: CuisineClassifier not available: {e}")
            _classifier = "unavailable"
    return _classifier


# ── Request Schema ────────────────────────────────────────

class ClassifyRequest(BaseModel):
    ingredients: List[str]


# ── Endpoint ──────────────────────────────────────────────

@router.post("/classify")
def classify_cuisine(req: ClassifyRequest):
    """
    Predict the cuisine type from a list of ingredients.

    Uses an XGBoost classifier trained on ingredient vectors
    to predict the most likely culinary origin.

    Returns the predicted cuisine and probability distribution
    across all cuisine categories.
    """
    classifier = _get_classifier()

    if classifier == "unavailable":
        # Rule-based fallback when ML model is not loaded
        return _rule_based_classify(req.ingredients)

    try:
        result = classifier.predict(req.ingredients)
        return {
            "predicted_cuisine": result.get("cuisine", "Unknown"),
            "probabilities": result.get("probabilities", {}),
            "model": "XGBoost-v4",
        }
    except Exception as e:
        # Fallback to rule-based if prediction fails
        return _rule_based_classify(req.ingredients)


def _rule_based_classify(ingredients: List[str]) -> dict:
    """
    Simple rule-based cuisine classification fallback.
    Used when the XGBoost model is not available.
    """
    ing_str = " ".join(ingredients).lower()

    cuisine_rules = [
        (["curry", "garam", "turmeric", "paneer", "masala", "cumin", "coriander", "cardamom"],
         "INDIAN", {"INDIAN": 0.88, "THAI": 0.07, "CHINESE": 0.05}),
        (["soy", "ginger", "sesame", "tofu", "wok", "noodle", "rice vinegar", "hoisin"],
         "CHINESE", {"CHINESE": 0.82, "THAI": 0.12, "JAPANESE": 0.06}),
        (["miso", "dashi", "wasabi", "nori", "sake", "mirin", "sushi"],
         "JAPANESE", {"JAPANESE": 0.90, "CHINESE": 0.06, "KOREAN": 0.04}),
        (["lemongrass", "fish sauce", "thai basil", "galangal", "coconut milk", "chili"],
         "THAI", {"THAI": 0.85, "VIETNAMESE": 0.10, "INDIAN": 0.05}),
        (["tortilla", "jalapeño", "cilantro", "avocado", "chipotle", "taco", "salsa"],
         "MEXICAN", {"MEXICAN": 0.88, "SPANISH": 0.08, "AMERICAN": 0.04}),
        (["olive oil", "basil", "mozzarella", "parmesan", "pasta", "risotto", "prosciutto"],
         "ITALIAN", {"ITALIAN": 0.86, "FRENCH": 0.09, "SPANISH": 0.05}),
        (["butter", "cream", "wine", "shallot", "tarragon", "cognac", "beurre"],
         "FRENCH", {"FRENCH": 0.84, "ITALIAN": 0.10, "SPANISH": 0.06}),
        (["kimchi", "gochujang", "bulgogi", "doenjang", "perilla"],
         "KOREAN", {"KOREAN": 0.90, "JAPANESE": 0.06, "CHINESE": 0.04}),
    ]

    for keywords, cuisine, probs in cuisine_rules:
        if any(kw in ing_str for kw in keywords):
            return {
                "predicted_cuisine": cuisine,
                "probabilities": probs,
                "model": "rule-based-fallback",
            }

    # Default fallback
    return {
        "predicted_cuisine": "MEDITERRANEAN / ITALIAN",
        "probabilities": {"ITALIAN": 0.78, "FRENCH": 0.14, "SPANISH": 0.08},
        "model": "rule-based-fallback",
    }
