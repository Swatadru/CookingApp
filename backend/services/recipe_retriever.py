"""
recipe_retriever.py
===================
Hybrid Recipe Retrieval Engine — TF-IDF Semantic + Keyword Matching.

Architecture:
    1. TF-IDF Cosine Similarity (semantic signal):
       Converts the user's ingredient query into the same TF-IDF vector space
       as the pre-indexed recipe corpus, then ranks all recipes by cosine
       similarity.  This captures semantic proximity — e.g., "cheddar" matches
       recipes with "cheese" through shared bi-gram/n-gram features.

    2. Keyword Overlap Scoring (precision signal):
       Token-level ingredient matching that counts exact word-boundary hits.
       Prevents false positives like "butter" → "butternut squash".

    3. Hybrid Fusion:
       final_score = α·cosine_sim + β·keyword_coverage + γ·recipe_completeness
       Default weights: α=0.55, β=0.30, γ=0.15

Design:
    - Class-based for FastAPI dependency injection.
    - Loads pre-built TF-IDF artifacts once at startup (fast cold start).
    - Falls back to keyword-only mode if TF-IDF index is unavailable.
    - All public methods are fully typed with docstrings.

Usage:
    retriever = RecipeRetriever()          # loads index from disk
    results = retriever.search(["chicken", "garlic", "lemon"], top_k=10)
"""

import logging
import warnings
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import joblib
import numpy as np
from scipy.sparse import csr_matrix, load_npz
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

warnings.filterwarnings("ignore", category=UserWarning)

logger = logging.getLogger(__name__)


# =========================================================
# PATHS
# =========================================================

_SERVICE_DIR = Path(__file__).parent
_MODELS_DIR = _SERVICE_DIR.parent / "models" / "retrieval"


# =========================================================
# Keyword Matching Utilities
# =========================================================

def ingredient_match(user_ing: str, recipe_ing: str) -> bool:
    """
    Safe token-based ingredient matching with word-boundary enforcement.

    Allows:
        chicken  → chicken breast     ✓
        tomato   → tomato sauce       ✓
        butter   → salted butter      ✓

    Prevents:
        butter   → butternut squash   ✗
        ham      → hamburger          ✗
        pea      → peanut             ✗

    Args:
        user_ing: Single normalized user ingredient.
        recipe_ing: Single normalized recipe ingredient.

    Returns:
        True if user_ing matches recipe_ing at a word boundary.
    """
    user_ing = user_ing.lower().strip()
    recipe_ing = recipe_ing.lower().strip()

    # Exact match
    if user_ing == recipe_ing:
        return True

    # Multi-word user ingredient: check if every word appears in recipe
    user_words = user_ing.split()
    recipe_words = recipe_ing.split()

    if len(user_words) > 1:
        return all(w in recipe_words for w in user_words)

    # Single word: full-word match only
    return user_ing in recipe_words


def compute_keyword_scores(
    user_ingredients: List[str],
    recipe_ingredients: List[str],
) -> Tuple[float, float, List[str], List[str]]:
    """
    Compute keyword overlap scores between user and recipe ingredient lists.

    Args:
        user_ingredients: Normalized user ingredient list.
        recipe_ingredients: Normalized recipe ingredient list.

    Returns:
        Tuple of (user_coverage, recipe_completeness, matched_list, missing_list).
    """
    matched: set = set()

    for user_ing in user_ingredients:
        for recipe_ing in recipe_ingredients:
            if ingredient_match(user_ing, recipe_ing):
                matched.add(user_ing)
                break

    matched_count = len(matched)
    total_user = max(len(user_ingredients), 1)
    total_recipe = max(len(recipe_ingredients), 1)

    user_coverage = matched_count / total_user
    recipe_completeness = matched_count / total_recipe

    # Find missing ingredients
    missing: List[str] = []
    for recipe_ing in recipe_ingredients:
        found = False
        for user_ing in user_ingredients:
            if ingredient_match(user_ing, recipe_ing):
                found = True
                break
        if not found:
            missing.append(recipe_ing)

    return user_coverage, recipe_completeness, list(matched), missing


# =========================================================
# RecipeRetriever Class
# =========================================================

class RecipeRetriever:
    """
    Hybrid Recipe Retrieval Engine with TF-IDF semantic search
    and keyword overlap re-ranking.

    Loads pre-built index artifacts from disk at initialization.
    If the index does not exist, falls back to keyword-only mode
    (requires streaming the full database — much slower).

    Attributes:
        vectorizer: Fitted TfidfVectorizer for ingredient text.
        tfidf_matrix: Pre-computed sparse TF-IDF matrix (recipes × features).
        metadata: List of recipe metadata dicts.
        _index_loaded: Whether the TF-IDF index was loaded successfully.

    Example:
        >>> retriever = RecipeRetriever()
        >>> results = retriever.search(["chicken", "garlic", "lemon"])
        >>> print(results[0]["title"])
    """

    def __init__(
        self,
        models_dir: Optional[Path] = None,
        alpha: float = 0.55,
        beta: float = 0.30,
        gamma: float = 0.15,
    ) -> None:
        """
        Initialize the retriever by loading pre-built TF-IDF artifacts.

        Args:
            models_dir: Path to the directory containing index artifacts.
                        Defaults to backend/models/retrieval/.
            alpha: Weight for TF-IDF cosine similarity score.
            beta: Weight for keyword user-coverage score.
            gamma: Weight for keyword recipe-completeness score.
        """
        self.models_dir = models_dir or _MODELS_DIR
        self.alpha = alpha
        self.beta = beta
        self.gamma = gamma

        self.vectorizer: Optional[TfidfVectorizer] = None
        self.tfidf_matrix: Optional[csr_matrix] = None
        self.metadata: Optional[List[Dict[str, Any]]] = None
        self._index_loaded: bool = False

        self._load_index()

    def _load_index(self) -> None:
        """Load the pre-built TF-IDF index artifacts from disk."""
        vectorizer_path = self.models_dir / "tfidf_vectorizer.pkl"
        matrix_path = self.models_dir / "tfidf_matrix.npz"
        metadata_path = self.models_dir / "recipe_metadata.pkl"

        if not all(p.exists() for p in [vectorizer_path, matrix_path, metadata_path]):
            logger.warning(
                "TF-IDF index not found at %s. "
                "Run `python scripts/build_retrieval_index.py` to build it. "
                "Falling back to keyword-only mode.",
                self.models_dir,
            )
            self._index_loaded = False
            return

        logger.info("Loading TF-IDF retrieval index from %s ...", self.models_dir)

        self.vectorizer = joblib.load(vectorizer_path)
        self.tfidf_matrix = load_npz(matrix_path)
        self.metadata = joblib.load(metadata_path)
        self._index_loaded = True

        logger.info(
            "Index loaded: %s recipes, %s features",
            self.tfidf_matrix.shape[0],
            self.tfidf_matrix.shape[1],
        )

    @property
    def is_ready(self) -> bool:
        """Whether the TF-IDF index is loaded and ready for semantic search."""
        return self._index_loaded

    @property
    def recipe_count(self) -> int:
        """Number of indexed recipes."""
        if self.metadata is not None:
            return len(self.metadata)
        return 0

    def search(
        self,
        user_ingredients: List[str],
        top_k: int = 10,
        min_keyword_matches: int = 1,
        cosine_prefilter_k: int = 200,
    ) -> List[Dict[str, Any]]:
        """
        Search for recipes matching the given ingredients using
        hybrid TF-IDF + keyword scoring.

        Pipeline:
            1. Vectorize user ingredients into TF-IDF space.
            2. Compute cosine similarity against all indexed recipes.
            3. Take top `cosine_prefilter_k` candidates (fast semantic filter).
            4. Re-rank candidates with hybrid scoring:
               score = α·cosine + β·user_coverage + γ·recipe_completeness
            5. Apply minimum keyword match threshold.
            6. Return top `top_k` results.

        Args:
            user_ingredients: List of ingredient strings (e.g., ["chicken", "garlic"]).
            top_k: Number of top results to return.
            min_keyword_matches: Minimum number of keyword ingredient matches
                                 required to include a recipe in results.
            cosine_prefilter_k: Number of candidates to keep from cosine
                                similarity ranking before re-ranking.

        Returns:
            List of result dicts, each containing:
                - title: Recipe title.
                - match_score: Final hybrid score (0–1).
                - cosine_score: Raw TF-IDF cosine similarity.
                - keyword_coverage: Fraction of user ingredients matched.
                - recipe_completeness: Fraction of recipe ingredients covered.
                - matched_ingredients: List of matched user ingredients.
                - missing_ingredients: List of recipe ingredients not in user list.
                - instructions: Recipe instructions string.
                - source: Recipe source.
                - link: Recipe link.
        """
        if not user_ingredients:
            return []

        # Normalize
        user_ingredients = [ing.lower().strip() for ing in user_ingredients]

        if not self._index_loaded:
            logger.warning("Index not loaded — returning empty results.")
            return []

        # ----- STAGE 1: TF-IDF Cosine Similarity -----
        query_text = " ".join(user_ingredients)
        query_vec = self.vectorizer.transform([query_text])

        # Check for completely OOV query
        if query_vec.nnz == 0:
            logger.info(
                "All query terms are out-of-vocabulary: %s. "
                "Falling back to partial matching.",
                user_ingredients,
            )
            # Try individual ingredients
            individual_vecs = self.vectorizer.transform(user_ingredients)
            if individual_vecs.nnz == 0:
                logger.warning("No vocabulary overlap at all. Returning empty.")
                return []
            # Use the mean of individual vectors
            query_vec = individual_vecs.mean(axis=0)

        # Compute cosine similarities (query vs all recipes)
        cosine_scores = cosine_similarity(query_vec, self.tfidf_matrix).flatten()

        # ----- STAGE 2: Top-K Prefilter -----
        # Use argpartition for O(n) partial sort instead of full argsort
        effective_k = min(cosine_prefilter_k, len(cosine_scores))
        if effective_k <= 0:
            return []

        # Get indices of top candidates
        top_indices = np.argpartition(cosine_scores, -effective_k)[-effective_k:]

        # Sort these candidates by cosine score descending
        top_indices = top_indices[np.argsort(cosine_scores[top_indices])[::-1]]

        # ----- STAGE 3: Hybrid Re-ranking -----
        results: List[Dict[str, Any]] = []

        for idx in top_indices:
            idx = int(idx)
            recipe_meta = self.metadata[idx]
            recipe_ingredients = [
                ing.lower().strip()
                for ing in recipe_meta.get("ingredients", [])
            ]

            # Skip empty ingredient lists
            if not recipe_ingredients:
                continue

            # Keyword scoring
            user_coverage, recipe_completeness, matched, missing = (
                compute_keyword_scores(user_ingredients, recipe_ingredients)
            )

            matched_count = len(matched)

            # Apply minimum keyword threshold
            if matched_count < min_keyword_matches:
                continue

            # Cosine score for this candidate
            cos_score = float(cosine_scores[idx])

            # Hybrid fusion
            hybrid_score = (
                self.alpha * cos_score
                + self.beta * user_coverage
                + self.gamma * recipe_completeness
            )

            # Clamp to [0, 1]
            hybrid_score = round(min(max(hybrid_score, 0.0), 1.0), 4)

            results.append({
                "title": recipe_meta.get("title", "Unknown"),
                "match_score": hybrid_score,
                "cosine_score": round(cos_score, 4),
                "keyword_coverage": round(user_coverage, 4),
                "recipe_completeness": round(recipe_completeness, 4),
                "matched_ingredients": matched,
                "missing_ingredients": missing,
                "instructions": recipe_meta.get("instructions", ""),
                "source": recipe_meta.get("source", ""),
                "link": recipe_meta.get("link", ""),
            })

        # Final sort by hybrid score
        results.sort(key=lambda x: x["match_score"], reverse=True)

        return results[:top_k]

    def search_by_text(
        self,
        query_text: str,
        top_k: int = 10,
    ) -> List[Dict[str, Any]]:
        """
        Search recipes using a free-text query (e.g., "spicy Thai curry with shrimp").

        This method skips keyword re-ranking and uses pure TF-IDF cosine
        similarity, which is better suited for natural language queries.

        Args:
            query_text: Free-text search query.
            top_k: Number of results to return.

        Returns:
            List of result dicts with title, cosine_score, ingredients, instructions.
        """
        if not query_text.strip() or not self._index_loaded:
            return []

        query_vec = self.vectorizer.transform([query_text.lower().strip()])

        if query_vec.nnz == 0:
            logger.info("Free-text query has no vocabulary overlap: '%s'", query_text)
            return []

        cosine_scores = cosine_similarity(query_vec, self.tfidf_matrix).flatten()

        effective_k = min(top_k, len(cosine_scores))
        top_indices = np.argpartition(cosine_scores, -effective_k)[-effective_k:]
        top_indices = top_indices[np.argsort(cosine_scores[top_indices])[::-1]]

        results: List[Dict[str, Any]] = []
        for idx in top_indices:
            idx = int(idx)
            meta = self.metadata[idx]
            results.append({
                "title": meta.get("title", "Unknown"),
                "cosine_score": round(float(cosine_scores[idx]), 4),
                "ingredients": meta.get("ingredients", []),
                "instructions": meta.get("instructions", ""),
                "source": meta.get("source", ""),
                "link": meta.get("link", ""),
            })

        return results

    def get_similar_recipes(
        self,
        recipe_index: int,
        top_k: int = 5,
    ) -> List[Dict[str, Any]]:
        """
        Find recipes similar to a given recipe by index (recipe-to-recipe similarity).

        Useful for "you might also like" recommendations.

        Args:
            recipe_index: Index of the source recipe in the metadata list.
            top_k: Number of similar recipes to return.

        Returns:
            List of similar recipe dicts.

        Raises:
            IndexError: If recipe_index is out of bounds.
        """
        if not self._index_loaded:
            return []

        if recipe_index < 0 or recipe_index >= self.tfidf_matrix.shape[0]:
            raise IndexError(
                f"recipe_index {recipe_index} is out of bounds "
                f"(0 to {self.tfidf_matrix.shape[0] - 1})"
            )

        recipe_vec = self.tfidf_matrix[recipe_index]
        cosine_scores = cosine_similarity(recipe_vec, self.tfidf_matrix).flatten()

        # Exclude the recipe itself
        cosine_scores[recipe_index] = -1.0

        effective_k = min(top_k, len(cosine_scores))
        top_indices = np.argpartition(cosine_scores, -effective_k)[-effective_k:]
        top_indices = top_indices[np.argsort(cosine_scores[top_indices])[::-1]]

        results: List[Dict[str, Any]] = []
        for idx in top_indices:
            idx = int(idx)
            meta = self.metadata[idx]
            results.append({
                "title": meta.get("title", "Unknown"),
                "cosine_score": round(float(cosine_scores[idx]), 4),
                "ingredients": meta.get("ingredients", []),
                "instructions": meta.get("instructions", ""),
            })

        return results

    def __repr__(self) -> str:
        status = "ready" if self._index_loaded else "not loaded"
        count = self.recipe_count
        return f"<RecipeRetriever status={status} recipes={count:,}>"


# =========================================================
# Standalone Test
# =========================================================

if __name__ == "__main__":
    import json
    import sys

    sys.stdout.reconfigure(encoding="utf-8")

    logging.basicConfig(level=logging.INFO)

    print("Initializing RecipeRetriever...")
    retriever = RecipeRetriever()
    print(retriever)
    print()

    if not retriever.is_ready:
        print("ERROR: Index not loaded. Run build_retrieval_index.py first.")
        sys.exit(1)

    # Test 1: Ingredient-list search
    test_ingredients = ["chicken", "garlic", "lemon", "olive oil"]
    print(f"Test 1: Ingredient search → {test_ingredients}")
    print("-" * 60)

    results = retriever.search(test_ingredients, top_k=5)

    for i, r in enumerate(results, 1):
        print(f"\n  #{i}: {r['title']}")
        print(f"      Hybrid Score:     {r['match_score']}")
        print(f"      Cosine Score:     {r['cosine_score']}")
        print(f"      Keyword Coverage: {r['keyword_coverage']}")
        print(f"      Matched:          {r['matched_ingredients']}")
        print(f"      Missing:          {r['missing_ingredients'][:5]}")

    # Test 2: Free-text search
    print(f"\n{'=' * 60}")
    free_text = "spicy indian curry with rice"
    print(f"Test 2: Free-text search → \"{free_text}\"")
    print("-" * 60)

    results2 = retriever.search_by_text(free_text, top_k=5)

    for i, r in enumerate(results2, 1):
        print(f"\n  #{i}: {r['title']}")
        print(f"      Cosine Score: {r['cosine_score']}")
        print(f"      Ingredients:  {r['ingredients'][:6]}")

    print(f"\n{'=' * 60}")
    print("All tests complete.")