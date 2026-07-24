from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os
from dotenv import load_dotenv

load_dotenv()

try:
    from transformers import T5Tokenizer, T5ForConditionalGeneration
except ImportError:
    T5Tokenizer, T5ForConditionalGeneration = None, None
app = FastAPI(title="Sous-Chef AI Backend")

# Enable CORS for the Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to localhost:5173 or vercel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for model and data
MODEL = None
TOKENIZER = None
NUTRITION_DATA = {}

# Initialize Supabase client
from supabase import create_client, Client
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

supabase: Client | None = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

class RecipeRequest(BaseModel):
    ingredients: list[str]

@app.on_event("startup")
async def startup_event():
    global MODEL, TOKENIZER, NUTRITION_DATA
    
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

    # Load ML Model
    try:
        if T5Tokenizer is None or T5ForConditionalGeneration is None:
            print("Transformers library not installed. Skipping model load.")
        else:
            model_path = "./trained_recipe_model_final"
            if os.path.exists(model_path):
                print(f"Loading trained model from {model_path}...")
                TOKENIZER = T5Tokenizer.from_pretrained(model_path)
                MODEL = T5ForConditionalGeneration.from_pretrained(model_path)
                print("Model loaded successfully.")
            else:
                print(f"Warning: Trained model not found at {model_path}. Using base t5-small (generation will be poor until you train it).")
                TOKENIZER = T5Tokenizer.from_pretrained("t5-small")
                MODEL = T5ForConditionalGeneration.from_pretrained("t5-small")
    except Exception as e:
        print(f"Error loading model: {e}")

@app.post("/api/generate-recipe")
async def generate_recipe(req: RecipeRequest):
    ingredients_str = ", ".join(req.ingredients)
    if not MODEL or not TOKENIZER:
        return {
            "title": f"AI Recipe for {ingredients_str}",
            "ingredients": req.ingredients,
            "directions": ["Improvise with the ingredients above. (AI synthesis is disabled in Serverless environment)."],
            "raw_output": ""
        }
    
    input_text = f"generate recipe: {ingredients_str}"
    
    input_ids = TOKENIZER(input_text, return_tensors="pt").input_ids
    
    # Generate output
    # Adjust parameters like max_length, temperature, num_beams for better quality
    outputs = MODEL.generate(
        input_ids,
        max_length=512,
        num_beams=4,
        early_stopping=True,
        no_repeat_ngram_size=2
    )
    
    generated_text = TOKENIZER.decode(outputs[0], skip_special_tokens=True)
    
    # Parse the output string: "Title: X | Ingredients: Y | Directions: Z"
    # This is how we formatted the targets in train_model.py
    try:
        parts = generated_text.split(" | ")
        title = parts[0].replace("Title: ", "").strip()
        ingredients = parts[1].replace("Ingredients: ", "").strip().split(", ")
        directions = parts[2].replace("Directions: ", "").strip()
        
        # Split directions into a list of steps for the frontend
        directions_list = [step.strip() + "." for step in directions.split(". ") if step.strip()]
        
        return {
            "title": title,
            "ingredients": ingredients,
            "directions": directions_list,
            "raw_output": generated_text
        }
    except Exception as e:
        # Fallback if the model hallucinated a weird format
        return {
            "title": f"AI Recipe for {ingredients_str}",
            "ingredients": req.ingredients,
            "directions": ["Improvise with the ingredients above. The model output could not be parsed."],
            "raw_output": generated_text
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
    return {"status": "ok", "model_loaded": MODEL is not None}

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
    
    import math
    return {
        "data": data,
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
