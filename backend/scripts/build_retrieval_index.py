"""
build_retrieval_index.py
========================
Pre-build TF-IDF retrieval index from the recipe database.

Streams the 2GB+ recipe_database.json using ijson,
builds a TF-IDF sparse matrix over ingredient text,
and serializes the index artifacts for fast load at query time.

Usage:
    python build_retrieval_index.py

Outputs (in backend/models/retrieval/):
    - tfidf_vectorizer.pkl     : Fitted TfidfVectorizer
    - tfidf_matrix.npz         : Sparse CSR matrix of recipe vectors
    - recipe_metadata.pkl      : List of dicts with title, ingredients, instructions, etc.
"""

import sys
import time

sys.stdout.reconfigure(encoding="utf-8")  # type: ignore

import ijson
import joblib
import numpy as np
from pathlib import Path
from typing import Any, Dict, List

from scipy.sparse import save_npz
from sklearn.feature_extraction.text import TfidfVectorizer


# =========================================================
# PATHS
# =========================================================

SCRIPT_DIR = Path(__file__).parent
DB_URL = "postgresql://postgres:12102004@localhost:5432/recipe_generator"
OUTPUT_DIR = SCRIPT_DIR.parent / "models" / "retrieval"


# =========================================================
# STEP 1: Stream and Extract Corpus
# =========================================================

def stream_recipes() -> tuple[List[str], List[Dict[str, Any]]]:
    """
    Stream the recipe database from PostgreSQL and extract:
      - corpus: list of ingredient-text strings (one per recipe)
      - metadata: list of recipe dicts
    """
    import json
    from sqlalchemy import create_engine, text

    corpus: List[str] = []
    metadata: List[Dict[str, Any]] = []

    print("Streaming recipes from PostgreSQL...")
    print("This may take a few minutes...\n")

    count = 0
    skipped = 0

    engine = create_engine(DB_URL)
    with engine.connect() as conn:
        result = conn.execution_options(stream_results=True).execute(
            text("SELECT id, title, ingredients, directions FROM recipes")
        )

        for row in result:
            try:
                recipe_id = row[0]
                title = row[1]
                # Ingredients might be stored as stringified JSON
                raw_ing = row[2]
                ingredients = json.loads(raw_ing) if isinstance(raw_ing, str) else raw_ing
                
                raw_dir = row[3]
                directions = json.loads(raw_dir) if isinstance(raw_dir, str) else raw_dir
                
                if not isinstance(ingredients, list):
                    ingredients = []
                    
                if len(ingredients) < 2:
                    skipped += 1
                    continue

                ingredient_text = " ".join(str(ing).lower().strip() for ing in ingredients)
                corpus.append(ingredient_text)

                metadata.append({
                    "title": title or "Unknown",
                    "ingredients": ingredients,
                    "instructions": directions or "",
                    "source": "",
                    "link": "",
                })

                count += 1
                if count % 10_000 == 0:
                    print(f"  Processed {count:,} recipes...")

            except Exception as e:
                skipped += 1
                continue

    print(f"\nTotal recipes indexed: {count:,}")
    print(f"Skipped (too few ingredients/errors): {skipped:,}")

    return corpus, metadata


# =========================================================
# STEP 2: Build TF-IDF Matrix
# =========================================================

def build_tfidf_index(
    corpus: List[str],
    max_features: int = 25_000,
    ngram_range: tuple[int, int] = (1, 2),
    min_df: int = 3,
    max_df: float = 0.85,
    sublinear_tf: bool = True,
) -> tuple[TfidfVectorizer, Any]:
    """
    Fit a TF-IDF vectorizer on the ingredient corpus and transform
    it into a sparse document-term matrix.

    Args:
        corpus: List of ingredient-text strings.
        max_features: Maximum vocabulary size.
        ngram_range: Uni-gram and bi-gram range for ingredient phrases.
        min_df: Minimum document frequency (prune extremely rare terms).
        max_df: Maximum document frequency ratio (prune ubiquitous terms).
        sublinear_tf: Apply sublinear TF scaling (1 + log(tf)).

    Returns:
        Tuple of (fitted vectorizer, sparse TF-IDF matrix).
    """
    print("\nBuilding TF-IDF index...")
    print(f"  max_features = {max_features:,}")
    print(f"  ngram_range  = {ngram_range}")
    print(f"  min_df       = {min_df}")
    print(f"  max_df       = {max_df}")
    print(f"  sublinear_tf = {sublinear_tf}")

    vectorizer = TfidfVectorizer(
        max_features=max_features,
        ngram_range=ngram_range,
        min_df=min_df,
        max_df=max_df,
        sublinear_tf=sublinear_tf,
        stop_words="english",
        dtype=np.float32,
    )

    t0 = time.time()
    tfidf_matrix = vectorizer.fit_transform(corpus)
    elapsed = time.time() - t0

    print(f"\n  Vectorization complete in {elapsed:.1f}s")
    print(f"  Matrix shape: {tfidf_matrix.shape}")
    print(f"  Vocabulary size: {len(vectorizer.vocabulary_):,}")
    print(f"  Non-zero entries: {tfidf_matrix.nnz:,}")
    print(f"  Sparsity: {1.0 - tfidf_matrix.nnz / (tfidf_matrix.shape[0] * tfidf_matrix.shape[1]):.6f}")

    return vectorizer, tfidf_matrix


# =========================================================
# STEP 3: Serialize Index Artifacts
# =========================================================

def save_index(
    vectorizer: TfidfVectorizer,
    tfidf_matrix: Any,
    metadata: List[Dict[str, Any]],
    output_dir: Path,
) -> None:
    """
    Save the TF-IDF index artifacts to disk.

    Args:
        vectorizer: Fitted TfidfVectorizer.
        tfidf_matrix: Sparse TF-IDF matrix.
        metadata: List of recipe metadata dicts.
        output_dir: Directory to save artifacts.
    """
    output_dir.mkdir(parents=True, exist_ok=True)

    vectorizer_path = output_dir / "tfidf_vectorizer.pkl"
    matrix_path = output_dir / "tfidf_matrix.npz"
    metadata_path = output_dir / "recipe_metadata.pkl"

    print(f"\nSaving artifacts to: {output_dir}")

    joblib.dump(vectorizer, vectorizer_path)
    print(f"  ✓ {vectorizer_path.name}")

    save_npz(matrix_path, tfidf_matrix)
    print(f"  ✓ {matrix_path.name}")

    joblib.dump(metadata, metadata_path)
    print(f"  ✓ {metadata_path.name}")


# =========================================================
# MAIN
# =========================================================

def main() -> None:
    """Main entry point for building the retrieval index."""
    print("=" * 60)
    print("  RECIPE RETRIEVAL INDEX BUILDER")
    print("=" * 60)

    t_start = time.time()

    # Step 1: Stream recipes
    corpus, metadata = stream_recipes()

    if len(corpus) == 0:
        print("\n[ERROR] No recipes found in PostgreSQL database.")
        sys.exit(1)

    # Step 2: Build TF-IDF
    vectorizer, tfidf_matrix = build_tfidf_index(corpus)

    # Step 3: Save
    save_index(vectorizer, tfidf_matrix, metadata, OUTPUT_DIR)

    total_time = time.time() - t_start
    print(f"\n{'=' * 60}")
    print(f"  INDEX BUILD COMPLETE — {total_time:.1f}s total")
    print(f"  Recipes indexed: {len(metadata):,}")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
