"""
allergen_router.py
==================
Phase 7 — API endpoints for Allergen Scanning and Ingredient Swapping.

Endpoints:
    POST /api/allergens/scan — Scan a recipe for allergens
    POST /api/allergens/swap — Swap allergenic ingredients with safe alternatives
"""

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db.engine import get_db
from db.models import SubstitutionLog
from services.allergen_swapper import AllergenSwapper

router = APIRouter(prefix="/api/allergens", tags=["Allergens"])

# Singleton swapper
_swapper = AllergenSwapper()


# ── Request Schemas ───────────────────────────────────────

class AllergenScanRequest(BaseModel):
    ingredients: List[str]
    allergies: List[str]
    diet_type: Optional[str] = None

class AllergenSwapRequest(BaseModel):
    ingredients: List[str]
    allergies: List[str]
    cuisine: Optional[str] = None
    diet_type: Optional[str] = None
    session_id: Optional[str] = None


# ── Endpoints ─────────────────────────────────────────────

@router.post("/scan")
def scan_allergens(req: AllergenScanRequest):
    """
    Scan a list of ingredients for allergens based on user preferences.

    Returns a list of detected allergens without making any changes.
    """
    hits = _swapper.scan_allergens(
        ingredients=req.ingredients,
        allergies=req.allergies,
        diet_type=req.diet_type,
    )
    return {
        "status": "scanned",
        "allergens_found": len(hits),
        "data": [h.to_dict() for h in hits],
    }


@router.post("/swap")
def swap_ingredients(
    req: AllergenSwapRequest,
    db: Session = Depends(get_db),
):
    """
    Swap allergenic ingredients with cuisine-appropriate safe alternatives.

    Returns the modified ingredient list with all swaps logged.
    """
    result = _swapper.swap_ingredients(
        ingredients=req.ingredients,
        allergies=req.allergies,
        cuisine=req.cuisine,
        diet_type=req.diet_type,
    )

    # Log swaps to database
    import uuid
    session_id = uuid.UUID(req.session_id) if req.session_id else None

    for swap in result["swaps_made"]:
        log = SubstitutionLog(
            session_id=session_id,
            original_ingredient=swap["original"],
            substitute=swap["substitute"],
            reason=swap["reason"],
        )
        db.add(log)

    if result["swaps_made"]:
        db.commit()

    return {
        "status": "swapped",
        "data": result,
    }
