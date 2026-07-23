"""
config.py
=========
Central configuration for the Sous-Chef AI backend.

Loads settings from environment variables / .env file using pydantic-settings.
Automatically falls back to SQLite if PostgreSQL is unavailable.
"""

from pathlib import Path
from pydantic_settings import BaseSettings

# Resolve the backend root directory (where this file lives)
_BACKEND_DIR = Path(__file__).resolve().parent

# SQLite fallback path (used when PostgreSQL is unavailable)
_SQLITE_PATH = _BACKEND_DIR / "db" / "sous_chef.db"
_SQLITE_URL = f"sqlite:///{_SQLITE_PATH.as_posix()}"


class Settings(BaseSettings):
    """Application settings loaded from environment."""

    # ── Database ──────────────────────────────────────────────
    # Try PostgreSQL
    DATABASE_URL: str = "postgresql://postgres:12102004@localhost:5432/recipe_generator"

    # ── Paths ─────────────────────────────────────────────────
    MODELS_DIR: Path = _BACKEND_DIR / "models"
    DATABASE_DIR: Path = _BACKEND_DIR / "database"
    NUTRITION_LOOKUP_PATH: Path = _BACKEND_DIR / "database" / "nutrition_lookup.json"

    # ── T5 Model Paths ────────────────────────────────────────
    TRAINED_MODEL_DIR: Path = _BACKEND_DIR / "models" / "trained_recipe_model"

    # ── App ───────────────────────────────────────────────────
    APP_TITLE: str = "Sous-Chef AI"
    DEBUG: bool = True

    # ── Phase 8 thresholds ────────────────────────────────────
    VALIDITY_SCORE_VALID: int = 80      # score >= 80 → VALID
    VALIDITY_SCORE_MARGINAL: int = 60   # 60 <= score < 80 → MARGINAL
    # below 60 → REJECTED

    # ── Gemini API Key ────────────────────────────────────────
    GEMINI_API_KEY: str | None = None

    model_config = {
        "env_file": str(_BACKEND_DIR / ".env"),
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


# Singleton instance — import this everywhere
settings = Settings()

# Export SQLite fallback URL for engine.py
SQLITE_FALLBACK_URL = _SQLITE_URL
