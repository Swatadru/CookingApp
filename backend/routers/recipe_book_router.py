from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Optional
import math
from pydantic import BaseModel

from db.engine import get_db
from db.models import Recipe

router = APIRouter(
    prefix="/api/recipes",
    tags=["recipe_book"]
)

class RecipeSummary(BaseModel):
    id: int
    title: str
    cuisine: str
    prepTime: str
    calories: int
    protein: int
    fat: int
    carbs: int
    image: str
    rating: float

class PaginatedRecipes(BaseModel):
    data: List[RecipeSummary]
    total: int
    page: int
    limit: int
    totalPages: int

@router.get("", response_model=PaginatedRecipes)
def get_recipes(
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
    cuisine: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Fetch paginated recipes from the database.
    Optionally filter by cuisine or search text.
    """
    query = db.query(Recipe)
    
    # Optional search by title
    if search:
        query = query.filter(Recipe.title.ilike(f"%{search}%"))
        
    # Optional cuisine filter
    # The dataset doesn't have a direct 'cuisine' column, 
    # we can try to infer it from the title or NER, or just return random cuisines for now
    if cuisine and cuisine != 'All':
        query = query.filter(Recipe.title.ilike(f"%{cuisine}%"))

    total = query.count()
    total_pages = math.ceil(total / limit)
    
    offset = (page - 1) * limit
    recipes = query.order_by(Recipe.id).offset(offset).limit(limit).all()
    
    # Map raw database rows to RecipeSummary for the frontend
    results = []
    for r in recipes:
        results.append(RecipeSummary(
            id=r.id,
            title=r.title,
            cuisine=r.cuisine or "Mixed",
            prepTime=r.prep_time or "30 min",
            calories=int(r.calories) if r.calories else 400,
            protein=int(r.protein) if r.protein else 20,
            fat=int(r.fat) if r.fat else 15,
            carbs=int(r.carbs) if r.carbs else 40,
            image=r.image or "",
            rating=r.rating or 4.5
        ))
        
    return PaginatedRecipes(
        data=results,
        total=total,
        page=page,
        limit=limit,
        totalPages=total_pages
    )

@router.get("/detail/{recipe_id}")
def get_recipe_by_id(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
        
    image_url = recipe.image or ""
    
    return {
        "id": recipe.id,
        "title": recipe.title,
        "description": f"Source: {recipe.source}",
        "prepTime": recipe.prep_time or "30 min",
        "calories": int(recipe.calories) if recipe.calories else 400,
        "protein": int(recipe.protein) if recipe.protein else 20,
        "fat": int(recipe.fat) if recipe.fat else 15,
        "carbs": int(recipe.carbs) if recipe.carbs else 40,
        "cuisine": recipe.cuisine or "Mixed",
        "category": recipe.category or "Dinner",
        "tags": [],
        "image": image_url,
        "ingredients": recipe.ingredients,
        "directions": recipe.directions,
        "rating": recipe.rating or 4.5
    }
