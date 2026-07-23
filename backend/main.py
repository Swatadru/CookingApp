"""
main.py
=======
Sous-Chef AI — FastAPI Application Entry Point.

Wires together ALL backend routers and initializes the database.

Start with:
    uvicorn main:app --reload --port 8000

API Documentation:
    http://localhost:8000/docs      (Swagger UI)
    http://localhost:8000/redoc     (ReDoc)
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from config import settings
from db.engine import engine
from db.models import Base

# ── Import Routers (renamed for clarity) ──────────────────
from routers.session_router import router as session_router
from routers.recipe_draft_router import router as recipe_draft_router
from routers.recipe_search_router import router as recipe_search_router
from routers.recipe_generation_router import router as recipe_generation_router
from routers.validation_router import router as validation_router
from routers.allergen_router import router as allergen_router
from routers.scoring_router import router as scoring_router
from routers.cuisine_classifier_router import router as cuisine_classifier_router
from routers.recipe_generator_router import router as recipe_generator_router
from routers.recipe_book_router import router as recipe_book_router

# ── Logging ───────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


# ── Lifespan (startup / shutdown) ─────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    # ── Startup ───────────────────────────────────────
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables ready.")
    logger.info("Sous-Chef AI backend is running!")
    logger.info("API docs: http://localhost:8000/docs")

    yield  # App is running

    # ── Shutdown ──────────────────────────────────────
    logger.info("Shutting down Sous-Chef AI backend.")


# ── FastAPI App ───────────────────────────────────────────
app = FastAPI(
    title=settings.APP_TITLE,
    description=(
        "Sous-Chef AI — An intelligent, production-grade AI cooking assistant.\n\n"
        "**Backend Modules:**\n"
        "- Session & User Management\n"
        "- Recipe Drafts with Undo/Redo Timeline\n"
        "- Recipe Search (TF-IDF + Retrieval)\n"
        "- Recipe Generation (T5 Transformer)\n"
        "- Cuisine Classification (XGBoost ML)\n"
        "- Contradiction Detection (DAG Logic)\n"
        "- Cultural Allergen Scanner & Swapper\n"
        "- Recipe Validity Classifier (Cookability Scoring)\n"
    ),
    version="2.0.0",
    lifespan=lifespan,
)


# ── CORS Middleware ───────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:3000",   # Alternative dev server
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Register ALL Routers ─────────────────────────────────
app.include_router(session_router)              # Users + Sessions
app.include_router(recipe_draft_router)         # Recipe Drafts (Save / Undo / Redo)
app.include_router(recipe_search_router)        # Recipe Search (TF-IDF Retrieval)
app.include_router(recipe_generation_router)    # Guardrail Validation Pipeline
app.include_router(validation_router)           # Contradiction Detection
app.include_router(allergen_router)             # Allergen Scanning + Swapping
app.include_router(scoring_router)              # Recipe Validity Scoring
app.include_router(cuisine_classifier_router)   # Cuisine Classification (XGBoost)
app.include_router(recipe_generator_router)     # T5 Recipe Generation + Nutrition Lookup
app.include_router(recipe_book_router)          # Recipe Book API

# ── Mount Static Images ───────────────────────────────────
IMAGES_DIR = os.path.join(os.path.dirname(__file__), "datasets", "datasets", "Indian", "image_for _cuisines", "data")
if os.path.exists(IMAGES_DIR):
    app.mount("/images", StaticFiles(directory=IMAGES_DIR), name="images")


# ── Health Check ──────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    """Health check endpoint."""
    return {
        "service": "Sous-Chef AI",
        "version": "2.0.0",
        "status": "running",
        "database": settings.DATABASE_URL.split("://")[0],
    }


@app.get("/api/health", tags=["Health"])
def health_check():
    """Detailed health check with service status."""
    from services.validity_classifier import ValidityClassifier

    classifier = ValidityClassifier()

    return {
        "status": "healthy",
        "database": settings.DATABASE_URL.split("://")[0],
        "services": {
            "memory_manager": "active",
            "contradiction_detector": "active",
            "allergen_swapper": "active",
            "validity_classifier": "active (XGBoost)" if classifier.is_ready else "active (rule-based fallback)",
            "cuisine_classifier": "active",
            "recipe_generator": "active (T5)",
        },
    }
