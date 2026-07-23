"""
recipe_generator_router.py
===========================
API endpoints for Gemini-based Recipe Generation using RAG.
"""

import json
import logging
import os
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from config import settings
from google import genai

from services.recipe_retriever import RecipeRetriever
from services.cuisine_classifier import CuisineClassifier
from services.chemistry_validator import ChemistryValidator

router = APIRouter(prefix="/api", tags=["Recipe Generation"])
logger = logging.getLogger(__name__)

# ── Global state ──────────────────────────────────────────
_nutrition_data: dict = {}
_recipe_retriever = None
_cuisine_classifier = None
_chemistry_validator = None
_gemini_client = None

def _get_gemini_client():
    global _gemini_client
    if not _gemini_client:
        api_key = settings.GEMINI_API_KEY
        if api_key:
            _gemini_client = genai.Client(api_key=api_key)
    return _gemini_client

def _get_services():
    global _recipe_retriever, _cuisine_classifier, _chemistry_validator
    if not _recipe_retriever:
        try:
            _recipe_retriever = RecipeRetriever()
            _cuisine_classifier = CuisineClassifier()
            _chemistry_validator = ChemistryValidator()
        except Exception as e:
            logger.warning(f"Failed to load AI services: {e}")
    return _recipe_retriever, _cuisine_classifier, _chemistry_validator

def _load_nutrition_data():
    """Load USDA nutrition lookup JSON."""
    global _nutrition_data
    if _nutrition_data:
        return

    paths_to_try = [
        settings.NUTRITION_LOOKUP_PATH,
        settings.DATABASE_DIR / "nutrition_lookup.json",
        Path(__file__).resolve().parent.parent / "database" / "nutrition_lookup.json",
    ]

    for path in paths_to_try:
        if path.exists():
            try:
                with open(path, "r") as f:
                    _nutrition_data = json.load(f)
                logger.info(f"Loaded nutrition data for {len(_nutrition_data)} ingredients.")
                return
            except Exception as e:
                logger.warning(f"Failed to load nutrition data: {e}")

# ── Schemas ───────────────────────────────────────────────

class GenerateRecipeRequest(BaseModel):
    ingredients: List[str]

class AllergySwapOption(BaseModel):
    allergen: str
    original: str
    substitute: str
    macroImpact: str

class ChemistryMetrics(BaseModel):
    maillardTemp: str
    phLevel: float
    emulsionStability: str
    gelatinizationTemp: str
    keyFlavors: List[str]

class HeatRequirement(BaseModel):
    cookingMethod: str
    recommendedVessel: str
    preheatDuration: str
    targetInternalTemp: str
    stovetopSetting: str

class GeneratedRecipeOutput(BaseModel):
    title: str = Field(description="A creative and appetizing title for the recipe.")
    ingredients: list[str] = Field(description="List of ingredients with measurements.")
    directions: list[str] = Field(description="Step-by-step cooking instructions.")
    calories: int = Field(description="Estimated calories per serving.")
    protein: int = Field(description="Estimated protein (g) per serving.")
    fat: int = Field(description="Estimated fat (g) per serving.")
    carbs: int = Field(description="Estimated carbs (g) per serving.")
    chemistry_notes: str = Field(description="A short, interesting food chemistry fact about why these ingredients or techniques work well together.")
    chemistry: ChemistryMetrics = Field(description="Detailed chemistry metrics of the cooking process.")
    heatRequirement: HeatRequirement = Field(description="Thermal dynamics and heat guide.")
    allergySwaps: List[AllergySwapOption] = Field(description="Suggested allergy substitutes for this specific recipe.")
    model: str = Field(default="gemini-2.5-flash", description="The model used to generate this.")

# ── Endpoints ─────────────────────────────────────────────

@router.post("/generate-recipe")
def generate_recipe(req: GenerateRecipeRequest):
    """
    Generate a recipe using Gemini RAG Pipeline (Phase 11).
    """
    client = _get_gemini_client()
    retriever, classifier, chemist = _get_services()

    ingredients_str = ", ".join(req.ingredients)

    if not client:
        logger.warning("No Gemini API key found. Falling back to mock recipe.")
        return _generate_fallback_recipe(req.ingredients, ingredients_str)

    # 1. RAG Context Collection
    retrieved_context = ""
    cuisine_context = ""
    chemistry_context = ""

    if retriever:
        top_recipes = retriever.search(req.ingredients, top_k=3)
        retrieved_context = "\n".join([
            f"Recipe: {r['title']}\nIngredients: {', '.join(r.get('matched_ingredients', []))}\n" 
            for r in top_recipes
        ])
    
    if classifier:
        cuisine_pred = classifier.predict(req.ingredients)
        cuisine_context = f"Predicted optimal cuisine profile: {cuisine_pred.get('cuisine', 'Global Fusion')}"

    if chemist:
        chem_rules = chemist.validate_recipe(req.ingredients)
        if chem_rules and chem_rules.get("rules_applied"):
            chemistry_context = "Food Chemistry Considerations:\n" + "\n".join(chem_rules["rules_applied"])

    # 2. Construct the massive prompt
    prompt = f"""
    You are an expert, Michelin-star AI Sous-Chef.
    Create a detailed, delicious recipe using primarily these ingredients: {ingredients_str}.
    
    Here is some inspiration from our database of 2.2M recipes:
    {retrieved_context}
    
    Cuisine Guidance:
    {cuisine_context}
    
    Food Chemistry Rules to respect:
    {chemistry_context}
    
    You may add staple pantry ingredients (oil, salt, pepper, basic spices, garlic, onion) to make the dish complete.
    Be creative but ensure the recipe is physically possible and tasty.
    Provide precise measurements and clear step-by-step directions.
    Estimate realistic nutritional macros per serving.
    Include a short 'chemistry_notes' field explaining the science behind why this dish works.
    Also generate tailored 'chemistry', 'heatRequirement', and 'allergySwaps' profiles specifically for this recipe.
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config={
                'response_mime_type': 'application/json',
                'response_schema': GeneratedRecipeOutput,
            },
        )
        
        # Parse the structured JSON response
        recipe_data = json.loads(response.text)
        
        # Add a default image for the UI
        recipe_data["image"] = _get_mock_image_for_ingredients(req.ingredients)
        
        return recipe_data

    except Exception as e:
        logger.error(f"Gemini generation failed: {e}")
        return _generate_fallback_recipe(req.ingredients, ingredients_str)


@router.get("/nutrition/{ingredient}")
def get_nutrition(ingredient: str):
    """Look up USDA nutritional data for an ingredient."""
    _load_nutrition_data()
    if not _nutrition_data:
        raise HTTPException(status_code=503, detail="Nutrition database not loaded.")
    query = ingredient.lower().strip()
    if query in _nutrition_data:
        return {"ingredient": query, "data": _nutrition_data[query]}
    matches = [{"match": k, "data": v} for k, v in _nutrition_data.items() if query in k][:5]
    if matches:
        return {"query": query, "results": matches}
    raise HTTPException(status_code=404, detail=f"Nutrition data not found for '{ingredient}'")

# ── Helper Functions ──────────────────────────────────────

def _get_mock_image_for_ingredients(ingredients: list) -> str:
    ing_lower = " ".join(ingredients).lower()
    if any(w in ing_lower for w in ["chicken", "poultry"]):
        return "https://lh3.googleusercontent.com/aida-public/AB6AXuCe0AD34aGqd6r8D8xiDCvgetSz6Mey7g8xX66LOKCsQtj40wmuqU7w_tMRM2nEqQzMPn_nXiQssADv1xm3CeWPQNaR9Bzz3XOXN0MKUqZECCoKP2XCh2UPPRbHWZ8y1Xd0j7Uu4ScmTRxAx-ebOx0VaND0MmjmVZ7MBO7NcgkjrN4A5RvGSCUyfkcD2NnWGoY6-H8BdJU7ST0h9xcBinylT7djF3V2_cz5xkzY95H4rGbRQoQ_o96vNd-tDEEMMiZCe_Cv-wsVm4K_"
    elif any(w in ing_lower for w in ["pasta", "spaghetti", "penne"]):
        return "https://lh3.googleusercontent.com/aida-public/AB6AXuCFO6pVvgaBXRMUko2Cx51l8bEOdEWpAk151Ckh8a3WbJ7Y2IPrT4AVVohg-uffWeh7B0L7khPhejZESlT_BNU39scGXzCubD2S2MR2LA-wfh5xRPLb6yeC3VSf1VqjDhcdKdCa_JVGGQ9by9tIHhvq6Ku881b8XoZy4SdSV7qqXEkbFmkFasXVaxPVhDTd23Nri9pPzZ2VsGLWHvGRuj8vPlR2CcUgcLRva1e52Cf-MPqO7PKh_-qZAr-7gPxy7lSTWlnkFJK-Biau"
    elif any(w in ing_lower for w in ["salmon", "fish", "shrimp", "tuna"]):
        return "https://lh3.googleusercontent.com/aida-public/AB6AXuAQBKUMIREti4HiLvshGZavZ8fnipclV8Hqv7Jf_ympGE1xGIew88f8l7s3z4vVNppOBzBJSUBTX3Wlz56uCgKh8Eir6qPxE6IgZq4vhxkuIYFIFF-GxtHx1whuNKo4cDHIPGK8iV0VmtzelHLuwsrPuf3fzbiGiWtib7HVDKhia2OFMpmz3ecqHZWih8vfGt87yKSTNdvOMcRrWSo7nYKJCNkjhaHeHnRBcJqMwOUl8l5rCS8zHvvibgeBg_GcHg0-YqK6n_905fuC"
    elif any(w in ing_lower for w in ["rice", "risotto"]):
        return "https://lh3.googleusercontent.com/aida-public/AB6AXuB-PEPw8FQpcIqS4_eXL9Q1MOoSSupqXTQpcM-DXzI3AGXUk1Ao_R1D8qvIOSe27yAjxuDmHdFNFn5f06ifEZWXAHQUSEUp_uqYcmpDO3yGcrBFkQhqB7xAZOscfQXqk9g9xMK2ZtvGy53fvepeFt-b9wg64c3iAg0Wtai9jKyOrbmqpdV6mIFR6UvDK2R6R77D5anQz0TeTXcV8QhjOX9emO6KernP2ekJU7rvogB0-tp7MFxMO-O2gN2K_jfkPwdIfHYbOm8GyMgi"
    return "https://lh3.googleusercontent.com/aida-public/AB6AXuDDL2qk_BfPLxgZALT2jxWjpJw4pGS5HRctHMlWrmqIMIOuuIgzWL4zF1NbkJusEO71RXhO_EangMT4z1sVLSilrnpLmP9EzqAXCqflIweQ0R-3zm-dldWFa-Ux9Ighzx-6LxM_O7_ikWBgEeX2dL8wydmCzFfCLJL7wxKZE_8I9KLDJqvyUMXaClIffWm5cfHAz5yMfkGptwZUdjULQPIa_VKExoaWPpYhJxg8fPaxktanWTT_lAWqaOhD0n_Zp4Zv6KNzr8g6uX6o"

def _generate_fallback_recipe(ingredients: list, ingredients_str: str) -> dict:
    formatted_ingredients = [f"{ing.strip().title()}" for ing in ingredients]
    return {
        "title": f"Chef's Special: {', '.join(ing.title() for ing in ingredients[:3])} Medley",
        "image": _get_mock_image_for_ingredients(ingredients),
        "ingredients": formatted_ingredients,
        "directions": [
            f"Prepare all ingredients: wash, peel, and dice {ingredients[0]} and any vegetables.",
            "Heat olive oil in a large skillet over medium-high heat.",
            f"Season {ingredients[0]} with salt, pepper, and your preferred herbs.",
            f"Cook the {ingredients[0]} for 5-7 minutes until golden brown on each side.",
            "Add remaining ingredients to the pan and cook for 3-4 minutes.",
            "Adjust seasoning to taste and serve immediately on a warm plate.",
        ],
        "calories": 380,
        "protein": 42,
        "fat": 16,
        "carbs": 12,
        "chemistry_notes": "Since the AI is offline, here is a mock chemistry note: Maillard reaction makes food tasty.",
        "chemistry": {
            "maillardTemp": "145°C - 165°C (Optimal amino-acid browning)",
            "phLevel": 5.8,
            "emulsionStability": "94% Equilibrium (Lipid-Aqueous Bond)",
            "gelatinizationTemp": "65°C Starch Hydration",
            "keyFlavors": ["Pyrazines", "Limonene", "Guaiacol", "Glutamate"]
        },
        "heatRequirement": {
            "cookingMethod": "High Thermal Conductivity Pan-Sear & Low Simmer",
            "recommendedVessel": "Heavy Cast Iron Skillet / Enamelled Dutch Oven",
            "preheatDuration": "4 to 5 minutes over medium-high heat",
            "targetInternalTemp": "74°C (Poultry) / 63°C (Fish/Beef)",
            "stovetopSetting": "Medium-High (70% Dial Output)"
        },
        "allergySwaps": [
            {
                "allergen": "Dairy",
                "original": "Butter",
                "substitute": "Extra Virgin Olive Oil / Avocado Oil",
                "macroImpact": "-5g Saturated Fat, +Oleic Acid"
            }
        ],
        "model": "fallback (Gemini unavailable)",
    }
