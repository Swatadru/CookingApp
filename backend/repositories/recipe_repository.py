"""
recipe_repository.py
====================
Data access layer for Recipe Drafts.

Each recipe modification creates a new draft with an auto-incremented version
number, enabling full version history and rollback capability.
"""

import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any

from sqlalchemy.orm import Session as DbSession
from sqlalchemy import func

from db.models import RecipeDraft


class RecipeRepository:
    """CRUD operations for versioned recipe drafts."""

    def __init__(self, db: DbSession):
        self.db = db

    def save_draft(
        self,
        session_id: uuid.UUID,
        recipe_data: Dict[str, Any],
    ) -> RecipeDraft:
        """
        Save a new recipe draft with auto-incremented version number.

        Args:
            session_id: The cooking session this draft belongs to.
            recipe_data: The full recipe as a JSON-serializable dict.

        Returns:
            The newly created RecipeDraft.
        """
        # Determine the next version number
        current_max = (
            self.db.query(func.max(RecipeDraft.version_no))
            .filter(RecipeDraft.session_id == session_id)
            .scalar()
        )
        next_version = (current_max or 0) + 1

        draft = RecipeDraft(
            draft_id=str(uuid.uuid4()),
            session_id=session_id,
            version_no=next_version,
            recipe_data=recipe_data,
            created_at=datetime.utcnow(),
        )
        self.db.add(draft)
        self.db.commit()
        self.db.refresh(draft)
        return draft

    def get_latest_draft(self, session_id: uuid.UUID) -> Optional[RecipeDraft]:
        """Get the most recent recipe draft for a session."""
        return (
            self.db.query(RecipeDraft)
            .filter(RecipeDraft.session_id == session_id)
            .order_by(RecipeDraft.version_no.desc())
            .first()
        )

    def get_draft_by_version(
        self,
        session_id: uuid.UUID,
        version_no: int,
    ) -> Optional[RecipeDraft]:
        """Get a specific version of a recipe draft."""
        return (
            self.db.query(RecipeDraft)
            .filter(
                RecipeDraft.session_id == session_id,
                RecipeDraft.version_no == version_no,
            )
            .first()
        )

    def list_drafts(self, session_id: uuid.UUID) -> List[RecipeDraft]:
        """List all drafts for a session, newest first."""
        return (
            self.db.query(RecipeDraft)
            .filter(RecipeDraft.session_id == session_id)
            .order_by(RecipeDraft.version_no.desc())
            .all()
        )

    def get_version_count(self, session_id: uuid.UUID) -> int:
        """Get the total number of draft versions for a session."""
        return (
            self.db.query(func.count(RecipeDraft.draft_id))
            .filter(RecipeDraft.session_id == session_id)
            .scalar() or 0
        )
