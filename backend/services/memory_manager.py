"""
memory_manager.py
=================
Phase 5 — Dynamic State Memory Orchestration Service.

Coordinates the session, recipe, and history repositories to provide
a high-level API for recipe modification, undo, and redo.

This is the service that solves GPT's stateless nature — it tracks the
full conversation context and recipe evolution within a session.

Usage:
    manager = MemoryManager(db)
    manager.modify_recipe(session_id, "ADD_SPICE", new_recipe_data)
    old_recipe = manager.undo(session_id)
    re_recipe = manager.redo(session_id)
"""

import uuid
import logging
from typing import Optional, Dict, Any, List

from sqlalchemy.orm import Session as DbSession

from repositories.session_repository import SessionRepository
from repositories.recipe_repository import RecipeRepository
from repositories.history_repository import HistoryRepository

logger = logging.getLogger(__name__)


class MemoryManager:
    """
    Orchestrates Dynamic State Memory for a cooking session.

    Manages:
        - Session lifecycle
        - Recipe draft versioning
        - Undo/Redo history stack
        - Conversation context preservation
    """

    def __init__(self, db: DbSession):
        self.db = db
        self.sessions = SessionRepository(db)
        self.recipes = RecipeRepository(db)
        self.history = HistoryRepository(db)

    # ── Session Management ────────────────────────────────

    def create_user(self, username: str) -> Dict[str, Any]:
        """Create a new user."""
        user = self.sessions.create_user(username)
        return {
            "user_id": str(user.user_id),
            "username": user.username,
            "created_at": user.created_at.isoformat(),
        }

    def start_session(self, user_id: uuid.UUID) -> Dict[str, Any]:
        """Start a new cooking session for a user."""
        user = self.sessions.get_user(user_id)
        if not user:
            raise ValueError(f"User {user_id} not found")

        session = self.sessions.create_session(user_id)
        logger.info("Started session %s for user %s", session.session_id, user_id)
        return {
            "session_id": str(session.session_id),
            "user_id": str(session.user_id),
            "created_at": session.created_at.isoformat(),
        }

    def get_session_info(self, session_id: uuid.UUID) -> Optional[Dict[str, Any]]:
        """Get session details including current recipe state."""
        session = self.sessions.get_session(session_id)
        if not session:
            return None

        latest_draft = self.recipes.get_latest_draft(session_id)
        version_count = self.recipes.get_version_count(session_id)

        return {
            "session_id": str(session.session_id),
            "user_id": str(session.user_id),
            "created_at": session.created_at.isoformat(),
            "last_active": session.last_active.isoformat() if session.last_active else None,
            "current_recipe": latest_draft.recipe_data if latest_draft else None,
            "current_version": latest_draft.version_no if latest_draft else 0,
            "total_versions": version_count,
        }

    # ── Recipe Modification ───────────────────────────────

    def save_recipe(
        self,
        session_id: uuid.UUID,
        recipe_data: Dict[str, Any],
        action_type: str = "INITIAL_SAVE",
    ) -> Dict[str, Any]:
        """
        Save a recipe, creating a new version and recording history.

        If this is the first save (no existing draft), it creates V1
        without recording history. Subsequent saves record the old
        state for undo capability.

        Args:
            session_id: The cooking session.
            recipe_data: The full recipe as a dict.
            action_type: Description of the modification.

        Returns:
            Dict with draft info and version number.
        """
        # Touch the session timestamp
        self.sessions.update_last_active(session_id)

        # Get the current state before modification
        current_draft = self.recipes.get_latest_draft(session_id)
        old_recipe = current_draft.recipe_data if current_draft else None

        # Save the new draft (auto-increments version)
        new_draft = self.recipes.save_draft(session_id, recipe_data)

        # Record history (skip for the very first save — nothing to undo)
        if old_recipe is not None:
            self.history.push_action(
                session_id=session_id,
                action_type=action_type,
                old_recipe=old_recipe,
                new_recipe=recipe_data,
            )

        logger.info(
            "Saved recipe V%d for session %s (action: %s)",
            new_draft.version_no, session_id, action_type,
        )

        return {
            "draft_id": str(new_draft.draft_id),
            "session_id": str(session_id),
            "version_no": new_draft.version_no,
            "recipe_data": new_draft.recipe_data,
            "action_type": action_type,
        }

    def get_current_recipe(self, session_id: uuid.UUID) -> Optional[Dict[str, Any]]:
        """Get the latest recipe draft for a session."""
        draft = self.recipes.get_latest_draft(session_id)
        if not draft:
            return None
        return {
            "version_no": draft.version_no,
            "recipe_data": draft.recipe_data,
            "created_at": draft.created_at.isoformat(),
        }

    def get_recipe_history(self, session_id: uuid.UUID) -> List[Dict[str, Any]]:
        """Get the full version history for a session."""
        drafts = self.recipes.list_drafts(session_id)
        return [
            {
                "version_no": d.version_no,
                "recipe_data": d.recipe_data,
                "created_at": d.created_at.isoformat(),
            }
            for d in drafts
        ]

    # ── Undo / Redo ───────────────────────────────────────

    def undo(self, session_id: uuid.UUID) -> Dict[str, Any]:
        """
        Undo the last recipe modification.

        Pops the most recent action from the history stack and restores
        the old_recipe state as a new draft version.

        Returns:
            Dict with the restored recipe, or error if nothing to undo.
        """
        entry = self.history.pop_undo(session_id)
        if not entry:
            return {"error": "Nothing to undo", "recipe_data": None}

        # Save the old state as the new current version
        restored_draft = self.recipes.save_draft(session_id, entry.old_recipe)

        logger.info(
            "Undo: restored V%d for session %s (undid %s)",
            restored_draft.version_no, session_id, entry.action_type,
        )

        return {
            "action": "UNDO",
            "undone_action": entry.action_type,
            "version_no": restored_draft.version_no,
            "recipe_data": restored_draft.recipe_data,
        }

    def redo(self, session_id: uuid.UUID) -> Dict[str, Any]:
        """
        Redo the last undone modification.

        Gets the most recently undone action and re-applies the
        new_recipe state as a new draft version.

        Returns:
            Dict with the re-applied recipe, or error if nothing to redo.
        """
        entry = self.history.get_redo_entry(session_id)
        if not entry:
            return {"error": "Nothing to redo", "recipe_data": None}

        # Save the new state as the current version
        redone_draft = self.recipes.save_draft(session_id, entry.new_recipe)

        logger.info(
            "Redo: applied V%d for session %s (redid %s)",
            redone_draft.version_no, session_id, entry.action_type,
        )

        return {
            "action": "REDO",
            "redone_action": entry.action_type,
            "version_no": redone_draft.version_no,
            "recipe_data": redone_draft.recipe_data,
        }
