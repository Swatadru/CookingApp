"""
recipe_router.py
================
Phase 5 — API endpoints for Recipe Draft management and Undo/Redo.

Endpoints:
    POST /api/recipes/save                — Save/update a recipe draft
    GET  /api/recipes/{session_id}        — Get current recipe for a session
    GET  /api/recipes/{session_id}/history — Get full version history
    POST /api/recipes/{session_id}/undo   — Undo last modification
    POST /api/recipes/{session_id}/redo   — Redo last undone modification
"""

import uuid
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db.engine import get_db
from services.memory_manager import MemoryManager

router = APIRouter(prefix="/api/recipes", tags=["Recipes"])


# ── Request Schemas ───────────────────────────────────────

class SaveRecipeRequest(BaseModel):
    session_id: str
    recipe_data: Dict[str, Any]
    action_type: str = "MODIFY"


# ── Endpoints ─────────────────────────────────────────────

@router.post("/save")
def save_recipe(req: SaveRecipeRequest, db: Session = Depends(get_db)):
    """
    Save or update a recipe draft.

    Creates a new version and records the previous state for undo.
    """
    manager = MemoryManager(db)
    try:
        sid = uuid.UUID(req.session_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid session ID format")

    result = manager.save_recipe(sid, req.recipe_data, req.action_type)
    return {"status": "saved", "data": result}


@router.get("/{session_id}")
def get_current_recipe(session_id: str, db: Session = Depends(get_db)):
    """Get the latest recipe draft for a session."""
    manager = MemoryManager(db)
    try:
        sid = uuid.UUID(session_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid session ID format")

    result = manager.get_current_recipe(sid)
    if not result:
        raise HTTPException(status_code=404, detail="No recipe found for this session")
    return {"data": result}


@router.get("/{session_id}/history")
def get_recipe_history(session_id: str, db: Session = Depends(get_db)):
    """Get the full version history for a session."""
    manager = MemoryManager(db)
    try:
        sid = uuid.UUID(session_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid session ID format")

    versions = manager.get_recipe_history(sid)
    return {
        "session_id": session_id,
        "total_versions": len(versions),
        "versions": versions,
    }


@router.post("/{session_id}/undo")
def undo_recipe(session_id: str, db: Session = Depends(get_db)):
    """
    Undo the last recipe modification.

    Restores the previous recipe state and creates a new version
    with the restored content.
    """
    manager = MemoryManager(db)
    try:
        sid = uuid.UUID(session_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid session ID format")

    result = manager.undo(sid)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return {"status": "undone", "data": result}


@router.post("/{session_id}/redo")
def redo_recipe(session_id: str, db: Session = Depends(get_db)):
    """
    Redo the last undone modification.

    Re-applies the previously undone recipe state.
    """
    manager = MemoryManager(db)
    try:
        sid = uuid.UUID(session_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid session ID format")

    result = manager.redo(sid)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return {"status": "redone", "data": result}
