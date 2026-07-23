"""
session_repository.py
=====================
Data access layer for User and Session entities.

Follows the Repository Pattern — all database queries for users and sessions
are centralized here, keeping business logic free of SQL concerns.
"""

import uuid
from datetime import datetime
from typing import Optional, List

from sqlalchemy.orm import Session as DbSession

from db.models import User, Session


class SessionRepository:
    """CRUD operations for users and cooking sessions."""

    def __init__(self, db: DbSession):
        self.db = db

    # ── Users ─────────────────────────────────────────────

    def create_user(self, username: str) -> User:
        """Create a new user and return the User object."""
        user = User(
            user_id=str(uuid.uuid4()),
            username=username,
            created_at=datetime.utcnow(),
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_user(self, user_id: uuid.UUID) -> Optional[User]:
        """Get a user by their UUID."""
        return self.db.query(User).filter(User.user_id == user_id).first()

    def list_users(self) -> List[User]:
        """List all users."""
        return self.db.query(User).order_by(User.created_at.desc()).all()

    # ── Sessions ──────────────────────────────────────────

    def create_session(self, user_id: uuid.UUID) -> Session:
        """Create a new cooking session for a user."""
        session = Session(
            session_id=str(uuid.uuid4()),
            user_id=user_id,
            created_at=datetime.utcnow(),
            last_active=datetime.utcnow(),
        )
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return session

    def get_session(self, session_id: uuid.UUID) -> Optional[Session]:
        """Get a session by its UUID."""
        return self.db.query(Session).filter(Session.session_id == session_id).first()

    def update_last_active(self, session_id: uuid.UUID) -> None:
        """Update the last_active timestamp for a session."""
        self.db.query(Session).filter(
            Session.session_id == session_id
        ).update({"last_active": datetime.utcnow()})
        self.db.commit()

    def list_sessions(self, user_id: uuid.UUID) -> List[Session]:
        """List all sessions for a user, most recent first."""
        return (
            self.db.query(Session)
            .filter(Session.user_id == user_id)
            .order_by(Session.created_at.desc())
            .all()
        )
