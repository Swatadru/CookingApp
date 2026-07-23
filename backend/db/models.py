"""
models.py
=========
SQLAlchemy ORM models for all database tables.

Compatible with both PostgreSQL and SQLite:
  - Uses String(36) for UUIDs when running on SQLite
  - Uses JSON instead of JSONB for cross-database compatibility

Tables:
    - users               — User identity
    - sessions            — Cooking sessions
    - recipe_drafts       — Versioned recipe snapshots
    - recipe_history      — Undo/Redo action stack
    - contradiction_logs  — Contradiction detection results
    - allergen_profiles   — User allergen preferences
    - substitution_logs   — Ingredient substitution registry
    - recipe_predictions  — Validity score prediction logs
"""

import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, Integer, Float, Boolean, Text,
    DateTime, ForeignKey, Index, JSON,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


# ═══════════════════════════════════════════════════════════
# User & Session Management
# ═══════════════════════════════════════════════════════════

class User(Base):
    """Registered user of Sous-Chef AI."""
    __tablename__ = "users"

    user_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.username} ({self.user_id})>"


class Session(Base):
    """A cooking session tied to a user."""
    __tablename__ = "sessions"

    session_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.user_id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_active = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="sessions")
    drafts = relationship("RecipeDraft", back_populates="session", cascade="all, delete-orphan")
    history = relationship("RecipeHistory", back_populates="session", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Session {self.session_id}>"


class RecipeDraft(Base):
    """
    A versioned snapshot of a recipe within a session.
    Each modification creates a new draft with an incremented version_no.
    """
    __tablename__ = "recipe_drafts"

    draft_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("sessions.session_id"), nullable=False)
    version_no = Column(Integer, nullable=False, default=1)
    recipe_data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    session = relationship("Session", back_populates="drafts")

    def __repr__(self):
        return f"<RecipeDraft session={self.session_id} v{self.version_no}>"


class RecipeHistory(Base):
    """
    Undo/Redo history stack.
    Each recipe modification pushes an entry with the old and new state.
    """
    __tablename__ = "recipe_history"

    history_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("sessions.session_id"), nullable=False)
    action_type = Column(String(50), nullable=False)  # e.g. ADD_SPICE, REMOVE_GARLIC, UNDO, REDO
    old_recipe = Column(JSON, nullable=True)
    new_recipe = Column(JSON, nullable=True)
    is_undone = Column(Boolean, default=False)  # True when this action has been undone
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    session = relationship("Session", back_populates="history")

    def __repr__(self):
        return f"<RecipeHistory {self.action_type} session={self.session_id}>"


# ═══════════════════════════════════════════════════════════
# Contradiction Detection
# ═══════════════════════════════════════════════════════════

class ContradictionLog(Base):
    """Logs contradiction detection results for each recipe validation."""
    __tablename__ = "contradiction_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(36), nullable=True)
    recipe_data = Column(JSON, nullable=True)
    contradictions_found = Column(Integer, default=0)
    errors = Column(JSON, nullable=True)  # List of contradiction dicts
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<ContradictionLog id={self.id} found={self.contradictions_found}>"


# ═══════════════════════════════════════════════════════════
# Cultural Allergen Swapper
# ═══════════════════════════════════════════════════════════

class AllergenProfile(Base):
    """Stores a user's allergen and dietary preferences."""
    __tablename__ = "allergen_profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(36), ForeignKey("users.user_id"), nullable=False)
    allergies = Column(JSON, default=list)    # e.g. ["dairy", "nuts"]
    diet_type = Column(String(100), nullable=True)  # e.g. "vegan", "keto"
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<AllergenProfile user={self.user_id} allergies={self.allergies}>"


class SubstitutionLog(Base):
    """Logs ingredient substitutions made during a session."""
    __tablename__ = "substitution_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(36), nullable=True)
    original_ingredient = Column(String(200), nullable=False)
    substitute = Column(String(200), nullable=False)
    reason = Column(String(100), nullable=True)  # e.g. "dairy allergy"
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<SubstitutionLog '{self.original_ingredient}' → '{self.substitute}'>"


# ═══════════════════════════════════════════════════════════
# Recipe Validity Classifier
# ═══════════════════════════════════════════════════════════

class RecipePrediction(Base):
    """Logs validity/cookability score predictions."""
    __tablename__ = "recipe_predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(36), nullable=True)
    recipe_data = Column(JSON, nullable=True)
    predicted_score = Column(Float, nullable=False)
    status = Column(String(20), nullable=False)  # VALID / MARGINAL / REJECTED
    breakdown = Column(JSON, nullable=True)      # Feature-level score breakdown
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<RecipePrediction score={self.predicted_score} status={self.status}>"

# ═══════════════════════════════════════════════════════════
# Recipe Dataset (Recipe Book)
# ═══════════════════════════════════════════════════════════

class Recipe(Base):
    """Stores recipes loaded from the dataset."""
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(500), nullable=False)
    ingredients = Column(JSON, nullable=False)  # List of strings
    directions = Column(JSON, nullable=False)   # List of strings
    link = Column(String(1000), nullable=True)
    source = Column(String(200), nullable=True)
    ner = Column(JSON, nullable=True)           # List of extracted entities
    image = Column(String(1000), nullable=True) # Remote URL or local path
    cuisine = Column(String(200), nullable=True)
    category = Column(String(200), nullable=True)
    prep_time = Column(String(100), nullable=True)
    calories = Column(Float, nullable=True)
    protein = Column(Float, nullable=True)
    fat = Column(Float, nullable=True)
    carbs = Column(Float, nullable=True)
    rating = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Recipe id={self.id} title={self.title[:30]}>"
