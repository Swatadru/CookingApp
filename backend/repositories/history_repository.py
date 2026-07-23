"""
history_repository.py
=====================
Data access layer for the Undo/Redo history stack.

Each recipe modification pushes an entry with old_recipe and new_recipe.
Undo marks the entry as undone and restores old_recipe.
Redo re-applies the most recently undone action.
"""

import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any

from sqlalchemy.orm import Session as DbSession

from db.models import RecipeHistory


class HistoryRepository:
    """CRUD operations for the undo/redo history stack."""

    def __init__(self, db: DbSession):
        self.db = db

    def push_action(
        self,
        session_id: uuid.UUID,
        action_type: str,
        old_recipe: Optional[Dict[str, Any]],
        new_recipe: Dict[str, Any],
    ) -> RecipeHistory:
        """
        Push a new action onto the history stack.

        When a new action is pushed, any previously undone actions are
        discarded (standard undo/redo behavior — you can't redo after
        making a new change).

        Args:
            session_id: The cooking session.
            action_type: Description of the action (e.g. "ADD_SPICE", "CHANGE_CUISINE").
            old_recipe: The recipe state before the action.
            new_recipe: The recipe state after the action.

        Returns:
            The newly created history entry.
        """
        # Discard any undone entries (can't redo after a new action)
        self.db.query(RecipeHistory).filter(
            RecipeHistory.session_id == session_id,
            RecipeHistory.is_undone == True,
        ).delete()

        entry = RecipeHistory(
            history_id=str(uuid.uuid4()),
            session_id=session_id,
            action_type=action_type,
            old_recipe=old_recipe,
            new_recipe=new_recipe,
            is_undone=False,
            created_at=datetime.utcnow(),
        )
        self.db.add(entry)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def pop_undo(self, session_id: uuid.UUID) -> Optional[RecipeHistory]:
        """
        Get the most recent non-undone action for undo.

        Marks the entry as undone (is_undone=True) so it can be redo'd later.

        Returns:
            The history entry to undo, or None if nothing to undo.
        """
        entry = (
            self.db.query(RecipeHistory)
            .filter(
                RecipeHistory.session_id == session_id,
                RecipeHistory.is_undone == False,
            )
            .order_by(RecipeHistory.created_at.desc())
            .first()
        )

        if entry:
            entry.is_undone = True
            self.db.commit()
            self.db.refresh(entry)

        return entry

    def get_redo_entry(self, session_id: uuid.UUID) -> Optional[RecipeHistory]:
        """
        Get the most recently undone action for redo.

        Marks the entry as active again (is_undone=False).

        Returns:
            The history entry to redo, or None if nothing to redo.
        """
        entry = (
            self.db.query(RecipeHistory)
            .filter(
                RecipeHistory.session_id == session_id,
                RecipeHistory.is_undone == True,
            )
            .order_by(RecipeHistory.created_at.asc())
            .first()
        )

        if entry:
            entry.is_undone = False
            self.db.commit()
            self.db.refresh(entry)

        return entry

    def get_history(self, session_id: uuid.UUID) -> List[RecipeHistory]:
        """Get the full history for a session, newest first."""
        return (
            self.db.query(RecipeHistory)
            .filter(RecipeHistory.session_id == session_id)
            .order_by(RecipeHistory.created_at.desc())
            .all()
        )

    def clear_history(self, session_id: uuid.UUID) -> int:
        """Clear all history entries for a session. Returns count deleted."""
        count = (
            self.db.query(RecipeHistory)
            .filter(RecipeHistory.session_id == session_id)
            .delete()
        )
        self.db.commit()
        return count
