"""
scoring_router.py
=================
Phase 8 — API endpoint for Recipe Validity / Cookability Scoring.

Endpoint:
    POST /api/recipe/score — Score a recipe (runs full validation pipeline)
"""

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db.engine import get_db
from db.models import RecipePrediction

router = APIRouter(prefix="/api/recipe", tags=["Scoring"])

# Lazy-load singleton services to prevent import deadlocks
_classifier = None
_chemistry = None
_contradiction = None

def _get_services():
    global _classifier, _chemistry, _contradiction
    if _classifier is None:
        _classifier = ValidityClassifier()
        _chemistry = ChemistryValidator()
        _contradiction = ContradictionDetector()
    return _classifier, _chemistry, _contradiction



# ── Request Schemas ───────────────────────────────────────

class ScoreRecipeRequest(BaseModel):
    recipe_data: Dict[str, Any]
    cuisine_result: Optional[Dict[str, Any]] = None
    user_preferences: Optional[Dict[str, Any]] = None
    session_id: Optional[str] = None


# ── Endpoints ─────────────────────────────────────────────

@router.post("/score")
def score_recipe(
    req: ScoreRecipeRequest,
    db: Session = Depends(get_db),
):
    """
    Score a recipe for cookability / validity.

    Runs the full validation pipeline:
        1. Chemistry Validator (Phase 4) → ingredient compatibility
        2. Contradiction Detector (Phase 6) → logical consistency
        3. Validity Classifier (Phase 8) → final cookability score

    Returns a score 0–100 with status (VALID / MARGINAL / REJECTED)
    and a detailed breakdown of all sub-scores.
    """
    ingredients = req.recipe_data.get("ingredients", [])
    steps = req.recipe_data.get("steps", req.recipe_data.get("instructions", []))

    clf, chem, contra = _get_services()

    # ── Run Phase 4: Chemistry Validation ─────────────
    chemistry_result = chem.validate_recipe(ingredients)

    # ── Run Phase 6: Contradiction Detection ──────────
    contradiction_result = contra.detect(req.recipe_data)

    # ── Run Phase 8: Validity Scoring ─────────────────
    score_result = clf.score_recipe(
        recipe_data=req.recipe_data,
        chemistry_result=chemistry_result,
        contradiction_result=contradiction_result,
        cuisine_result=req.cuisine_result,
        user_preferences=req.user_preferences,
    )

    # ── Log to Database ───────────────────────────────
    import uuid
    prediction = RecipePrediction(
        session_id=uuid.UUID(req.session_id) if req.session_id else None,
        recipe_data=req.recipe_data,
        predicted_score=score_result["score"],
        status=score_result["status"],
        breakdown=score_result["breakdown"],
    )
    db.add(prediction)
    db.commit()

    # ── Build Response ────────────────────────────────
    return {
        "status": "scored",
        "data": {
            "score": score_result["score"],
            "status": score_result["status"],
            "recommendation": score_result["recommendation"],
            "model_used": score_result["model_used"],
            "breakdown": score_result["breakdown"],
            "chemistry_violations": chemistry_result,
            "contradiction_result": {
                "logic_score": contradiction_result["logic_score"],
                "is_valid": contradiction_result["is_valid"],
                "contradictions": contradiction_result["contradictions"],
            },
        },
    }
