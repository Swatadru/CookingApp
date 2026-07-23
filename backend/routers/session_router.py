"""
session_router.py
=================
Phase 5 — API endpoints for User and Session management.

Endpoints:
    POST /api/users              — Create a new user
    GET  /api/users              — List all users
    POST /api/sessions           — Create a new cooking session
    GET  /api/sessions/{id}      — Get session details
    GET  /api/sessions/user/{id} — List sessions for a user
"""

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db.engine import get_db
from services.memory_manager import MemoryManager

router = APIRouter(prefix="/api", tags=["Sessions"])


# ── Request / Response Schemas ────────────────────────────

class CreateUserRequest(BaseModel):
    username: str

class CreateSessionRequest(BaseModel):
    user_id: str


# ── Endpoints ─────────────────────────────────────────────

@router.post("/users")
def create_user(req: CreateUserRequest, db: Session = Depends(get_db)):
    """Create a new user."""
    manager = MemoryManager(db)
    result = manager.create_user(req.username)
    return {"status": "created", "data": result}


@router.get("/users")
def list_users(db: Session = Depends(get_db)):
    """List all users."""
    from repositories.session_repository import SessionRepository
    repo = SessionRepository(db)
    users = repo.list_users()
    return {
        "users": [
            {
                "user_id": str(u.user_id),
                "username": u.username,
                "created_at": u.created_at.isoformat(),
            }
            for u in users
        ]
    }


@router.post("/sessions")
def create_session(req: CreateSessionRequest, db: Session = Depends(get_db)):
    """Create a new cooking session for a user."""
    manager = MemoryManager(db)
    try:
        user_id = uuid.UUID(req.user_id)
        result = manager.start_session(user_id)
        return {"status": "created", "data": result}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/sessions/{session_id}")
def get_session(session_id: str, db: Session = Depends(get_db)):
    """Get session details including current recipe state."""
    manager = MemoryManager(db)
    try:
        sid = uuid.UUID(session_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid session ID format")

    result = manager.get_session_info(sid)
    if not result:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"data": result}


@router.get("/sessions/user/{user_id}")
def list_user_sessions(user_id: str, db: Session = Depends(get_db)):
    """List all sessions for a user."""
    from repositories.session_repository import SessionRepository
    try:
        uid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    repo = SessionRepository(db)
    sessions = repo.list_sessions(uid)
    return {
        "sessions": [
            {
                "session_id": str(s.session_id),
                "created_at": s.created_at.isoformat(),
                "last_active": s.last_active.isoformat() if s.last_active else None,
            }
            for s in sessions
        ]
    }
