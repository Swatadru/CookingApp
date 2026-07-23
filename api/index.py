from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os
from transformers import T5Tokenizer, T5ForConditionalGeneration

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
RECIPES_DATA = []

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

    # Load Recipes Data
    global RECIPES_DATA
    try:
        # Vercel deploys files from api/ folder to the root of the serverless function
        recipes_path = os.path.join(os.path.dirname(__file__), "data", "recipes.json")
        if os.path.exists(recipes_path):
            with open(recipes_path, "r", encoding="utf-8") as f:
                RECIPES_DATA = json.load(f)
            print(f"Loaded {len(RECIPES_DATA)} recipes from dataset.")
        else:
            print(f"Warning: recipes.json not found at {recipes_path}.")
    except Exception as e:
        print(f"Error loading recipes data: {e}")

    # Load ML Model
    try:
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
    if not MODEL or not TOKENIZER:
        raise HTTPException(status_code=503, detail="Model is currently loading or unavailable")

    ingredients_str = ", ".join(req.ingredients)
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
        
        return {
            "title": title,
            "ingredients": ingredients,
            "directions": directions,
            "raw_output": generated_text
        }
    except Exception as e:
        # Fallback if the model hallucinated a weird format
        return {
            "title": f"AI Recipe for {ingredients_str}",
            "ingredients": req.ingredients,
            "directions": "Improvise with the ingredients above. The model output could not be parsed.",
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
    filtered = RECIPES_DATA
    
    if cuisine and cuisine != "All":
        filtered = [r for r in filtered if r.get("cuisine", "") == cuisine]
        
    if search:
        s = search.lower()
        filtered = [
            r for r in filtered 
            if s in r.get("title", "").lower() or 
               any(s in i.lower() for i in r.get("ingredients", []))
        ]
        
    total = len(filtered)
    start = (page - 1) * limit
    data = filtered[start:start + limit]
    
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
    for r in RECIPES_DATA:
        if r.get("id") == recipe_id:
            return r
    raise HTTPException(status_code=404, detail="Recipe not found")
