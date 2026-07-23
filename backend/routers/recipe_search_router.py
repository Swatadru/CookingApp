from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any


router = APIRouter(prefix="/api/recipes", tags=["recipes"])

# Lazy-load ML models to prevent import deadlocks
retriever = None
cuisine_classifier = None

def _get_services():
    global retriever, cuisine_classifier
    if retriever is None:
        try:
            from services.recipe_retriever import RecipeRetriever
            from services.cuisine_classifier import CuisineClassifier
            retriever = RecipeRetriever()
            cuisine_classifier = CuisineClassifier()
        except Exception as e:
            print(f"Warning: Failed to initialize ML models in recipes router: {e}")
            retriever = "unavailable"
    return retriever, cuisine_classifier

class SearchRequest(BaseModel):
    ingredients: List[str]
    top_k: int = 5
    cuisine_filter: Optional[str] = None

@router.post("/search")
def search_recipes(request: SearchRequest):
    """
    Predict cuisine based on ingredients and search for baseline recipes.
    """
    ret_svc, clf_svc = _get_services()
    if ret_svc == "unavailable" or not ret_svc or not clf_svc:
        raise HTTPException(status_code=503, detail="ML Models not loaded properly.")

    # 1. Predict Cuisine (Phase 3)
    cuisine_pred = clf_svc.predict(request.ingredients)
    predicted_cuisine = cuisine_pred.get("cuisine", "Unknown")
    
    # Optional: Override with user filter
    target_cuisine = request.cuisine_filter if request.cuisine_filter else predicted_cuisine

    # 2. Retrieve Recipes (Phase 2)
    # Using the ingredient list directly; standard retriever typically takes a string query
    query = " ".join(request.ingredients)
    results = ret_svc.search(query, top_k=request.top_k)

    return {
        "query_analysis": {
            "predicted_cuisine": predicted_cuisine,
            "confidence": cuisine_pred.get("confidence", 0.0),
            "target_cuisine": target_cuisine
        },
        "results": results
    }
