"""
engine.py
=========
SQLAlchemy engine, session factory, and FastAPI dependency.

Automatically falls back to SQLite if PostgreSQL is unavailable.
This ensures the app can run locally without a PostgreSQL server.

Usage in FastAPI:
    @router.get("/example")
    def example(db: Session = Depends(get_db)):
        ...
"""

import logging

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from config import settings, SQLITE_FALLBACK_URL

logger = logging.getLogger(__name__)


# ── Try PostgreSQL, fall back to SQLite ───────────────────
def _create_engine():
    """
    Attempt to connect to PostgreSQL.
    If it fails (not installed, wrong password, etc.), fall back to SQLite.
    """
    db_url = settings.DATABASE_URL

    # If the configured URL is PostgreSQL, try it first
    if db_url.startswith("postgresql"):
        try:
            eng = create_engine(
                db_url,
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=20,
                echo=settings.DEBUG,
            )
            # Test the connection
            with eng.connect() as conn:
                from sqlalchemy import text
                conn.execute(text("SELECT 1"))
            logger.info("Connected to PostgreSQL database.")
            return eng
        except Exception as e:
            logger.error(f"PostgreSQL unavailable ({e}). Enforcing PostgreSQL per user request.")
            raise

    # If it's not PostgreSQL, raise an error
    raise ValueError(f"DATABASE_URL must be a postgresql URL, got: {db_url}")


engine = _create_engine()

# ── Session Factory ───────────────────────────────────────
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# ── FastAPI Dependency ────────────────────────────────────
def get_db() -> Generator[Session, None, None]:
    """
    Yields a database session scoped to a single request.
    Automatically closes the session when the request is done.

    Usage:
        @router.post("/items")
        def create_item(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
