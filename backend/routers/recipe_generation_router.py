from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from services.chemistry_validator import ChemistryValidator
from services.contradiction_detector import ContradictionDetector
from services.validity_classifier import ValidityClassifier

router = APIRouter(prefix="/api/generate", tags=["generation"])

# Lazy-load validators to prevent import lock deadlocks (especially with XGBoost/joblib)
chem_validator = None
logic_detector = None
validity_scorer = None

def _get_validators():
    global chem_validator, logic_detector, validity_scorer
    if chem_validator is None:
        try:
            chem_validator = ChemistryValidator()
            logic_detector = ContradictionDetector()
            validity_scorer = ValidityClassifier()
        except Exception as e:
            print(f"Warning: Failed to initialize validators in generation router: {e}")
            chem_validator = "unavailable"
    return chem_validator, logic_detector, validity_scorer

class RecipeData(BaseModel):
    ingredients: List[str]
    steps: List[str]

class ValidationRequest(BaseModel):
    recipe: RecipeData
    cuisine_result: Optional[Dict[str, Any]] = None
    user_preferences: Optional[Dict[str, Any]] = None

@router.post("/validate")
def validate_recipe(request: ValidationRequest):
    """
    Run a generated recipe through the guardrail pipeline (Phases 4, 6, 8).
    """
    c_val, l_det, v_score = _get_validators()
    if c_val == "unavailable" or not c_val or not l_det or not v_score:
        raise HTTPException(status_code=503, detail="Validators not loaded properly.")

    recipe_dict = request.recipe.dict()

    # Phase 4: Chemistry Validation
    chem_result = c_val.validate_recipe(recipe_dict.get("ingredients", []))

    # Phase 6: Contradiction Detection
    logic_result = l_det.detect(recipe_dict)

    # Phase 8: Final Validity Score
    final_score = v_score.score_recipe(
        recipe_data=recipe_dict,
        chemistry_result=chem_result,
        contradiction_result=logic_result,
        cuisine_result=request.cuisine_result,
        user_preferences=request.user_preferences
    )

    return {
        "chemistry": chem_result,
        "logic": logic_result,
        "final_validity": final_score
    }
