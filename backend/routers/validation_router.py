"""
validation_router.py
====================
Phase 6 — API endpoint for Contradiction Detection.

Endpoint:
    POST /api/validate/contradictions — Validate a recipe for logical contradictions
"""

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db.engine import get_db
from db.models import ContradictionLog
from services.contradiction_detector import ContradictionDetector

router = APIRouter(prefix="/api/validate", tags=["Validation"])

# Singleton detector
_detector = ContradictionDetector()


# ── Request / Response Schemas ────────────────────────────

class ContradictionRequest(BaseModel):
    recipe_data: Dict[str, Any]
    session_id: Optional[str] = None


# ── Endpoints ─────────────────────────────────────────────

@router.post("/contradictions")
def validate_contradictions(
    req: ContradictionRequest,
    db: Session = Depends(get_db),
):
    """
    Validate a recipe for logical contradictions.

    Checks if recipe instructions require equipment or ingredients
    that are missing from the recipe.

    Example contradictions:
        - "Fry the chicken" but no oil in ingredients
        - "Bake at 180°C" but no oven-compatible context
        - "Boil pasta" but no water listed
    """
    result = _detector.detect(req.recipe_data)

    # Log to database
    import uuid
    log = ContradictionLog(
        session_id=uuid.UUID(req.session_id) if req.session_id else None,
        recipe_data=req.recipe_data,
        contradictions_found=result["error_count"] + result["warning_count"],
        errors=result["contradictions"],
    )
    db.add(log)
    db.commit()

    return {
        "status": "validated",
        "data": result,
    }
