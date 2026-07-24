from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os
import math
from dotenv import load_dotenv

load_dotenv()

from supabase import create_client, Client
import google.generativeai as genai

app = FastAPI(title="Sous-Chef AI Backend")

# Enable CORS for the Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to localhost:5173 or vercel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for data
NUTRITION_DATA = {}

# Initialize Supabase client
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

supabase: Client | None = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize Gemini API
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

class RecipeRequest(BaseModel):
    ingredients: list[str]

@app.on_event("startup")
async def startup_event():
    global NUTRITION_DATA
    
    # Load Nutrition Data
    try:
        if os.path.exists("nutrition_lookup.json"):
            with open("nutrition_lookup.json", "r") as f:
                NUTRITION_DATA = json.load(f)
            print(f"Loaded nutrition data for {len(NUTRITION_DATA)} ingredients.")
        else:
            print("Warning: nutrition_lookup.json not found. Run process_usda.py first.")
    except Exception as e:
        print(f"Error loading nutrition data: {e}")

    # Load Recipes Data - Now handled by Supabase
    if supabase:
        print("Supabase client initialized successfully.")
    else:
        print("Warning: SUPABASE_URL or SUPABASE_KEY not set. Recipe endpoints will fail.")

    if GEMINI_API_KEY:
        print("Gemini API configured successfully.")
    else:
        print("Warning: GEMINI_API_KEY not found. AI recipe generation will fallback.")

@app.post("/api/generate-recipe")
async def generate_recipe(req: RecipeRequest):
    ingredients_str = ", ".join(req.ingredients)
    
    if not GEMINI_API_KEY:
        return {
            "title": f"AI Recipe for {ingredients_str}",
            "ingredients": req.ingredients,
            "directions": ["Improvise with the ingredients above. (Gemini API key missing)."],
            "raw_output": ""
        }
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"""You are an expert chef. Generate a creative recipe using exactly these ingredients (and basic pantry staples if needed): {ingredients_str}.
Return the response in strictly valid JSON format with the following keys:
- "title": a creative string title
- "ingredients": an array of strings (the exact ingredients and measurements needed)
- "directions": an array of strings (step-by-step instructions)

Do not include any Markdown formatting like ```json or anything else. Just the raw JSON string."""

        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Clean up potential markdown formatting
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
            
        recipe_data = json.loads(text.strip())
        
        return {
            "title": recipe_data.get("title", f"AI Recipe for {ingredients_str}"),
            "ingredients": recipe_data.get("ingredients", req.ingredients),
            "directions": recipe_data.get("directions", ["Improvise with the ingredients above."]),
            "raw_output": response.text
        }
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return {
            "title": f"AI Recipe for {ingredients_str}",
            "ingredients": req.ingredients,
            "directions": ["Improvise with the ingredients above. The model output could not be parsed.", f"Error: {e}"],
            "raw_output": str(e)
        }

@app.get("/api/nutrition/{ingredient}")
async def get_nutrition(ingredient: str):
    query = ingredient.lower()
    
    # Exact match
    if query in NUTRITION_DATA:
        return NUTRITION_DATA[query]
        
    # Partial match
    for key, data in NUTRITION_DATA.items():
        if query in key:
            return {"match": key, "data": data}
            
    raise HTTPException(status_code=404, detail="Nutrition data not found for this ingredient")

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "model_loaded": GEMINI_API_KEY is not None}

@app.get("/api/recipes")
async def get_recipes(page: int = 1, limit: int = 12, cuisine: str = "All", search: str = ""):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")
        
    start = (page - 1) * limit
    end = start + limit - 1
    
    query = supabase.table("recipes").select("*", count="estimated")
    
    if cuisine and cuisine != "All":
        query = query.eq("cuisine", cuisine)
        
    if search:
        # Simple ilike search on title. Full text search can be used if configured.
        query = query.ilike("title", f"%{search}%")
        
    response = query.range(start, end).execute()
    data = response.data
    total = response.count if response.count is not None else len(data)
    
    # Map raw database rows to RecipeSummary for the frontend
    results = []
    for r in data:
        results.append({
            "id": r.get("id"),
            "title": r.get("title"),
            "cuisine": r.get("cuisine") or "Mixed",
            "prepTime": r.get("prep_time") or "30 min",
            "calories": int(r.get("calories")) if r.get("calories") else 400,
            "protein": int(r.get("protein")) if r.get("protein") else 20,
            "fat": int(r.get("fat")) if r.get("fat") else 15,
            "carbs": int(r.get("carbs")) if r.get("carbs") else 40,
            "image": r.get("image") or "",
            "rating": r.get("rating") or 4.5
        })
    
    return {
        "data": results,
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": max(1, math.ceil(total / limit))
    }

@app.get("/api/recipes/detail/{recipe_id}")
async def get_recipe_detail(recipe_id: str):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")
        
    response = supabase.table("recipes").select("*").eq("id", recipe_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Recipe not found")
        
    return response.data[0]
