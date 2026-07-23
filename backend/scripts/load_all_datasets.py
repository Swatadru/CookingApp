import sys
import os
from pathlib import Path
import json
import logging
import csv

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.engine import engine
from db.models import Base, Recipe
import pandas as pd
from tqdm import tqdm
from sqlalchemy import text
import ast

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATASETS_DIR = Path(__file__).parent.parent / "datasets" / "datasets"
CHUNK_SIZE = 10000

def parse_json_array(s):
    try:
        if pd.isna(s):
            return []
        if isinstance(s, str):
            try:
                return json.loads(s)
            except json.JSONDecodeError:
                try:
                    return ast.literal_eval(s)
                except Exception:
                    return [x.strip() for x in s.split(',')]
        return []
    except Exception:
        return []

def safe_split(s, sep=','):
    if pd.isna(s):
        return []
    return [x.strip() for x in str(s).split(sep) if x.strip()]

def get_local_image_map():
    image_dir = DATASETS_DIR / "Indian" / "image_for _cuisines" / "data"
    image_map = {}
    if image_dir.exists():
        for filename in os.listdir(image_dir):
            if filename.endswith(".jpg"):
                parts = filename.split(".", 1)
                if len(parts) == 2:
                    basename = parts[1]
                    image_map[basename] = filename
    return image_map

def map_image_url(url, image_map):
    if pd.isna(url):
        return None
    url_str = str(url)
    basename = url_str.split('/')[-1]
    if basename in image_map:
        return f"http://localhost:8000/images/{image_map[basename]}"
    return url_str

def load_data():
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    logger.info("Emptying the existing recipes table (if any)...")
    with engine.connect() as conn:
        conn.execute(text("TRUNCATE TABLE recipes RESTART IDENTITY CASCADE;"))
        conn.commit()

    image_map = get_local_image_map()
    logger.info(f"Loaded {len(image_map)} local images into mapping.")

    # 1. Indian - cuisines.csv
    cuisines_path = DATASETS_DIR / "Indian" / "cuisines.csv"
    if cuisines_path.exists():
        logger.info(f"Loading {cuisines_path}...")
        for chunk in tqdm(pd.read_csv(cuisines_path, chunksize=CHUNK_SIZE)):
            df = pd.DataFrame()
            df['title'] = chunk['name']
            df['ingredients'] = chunk['ingredients'].apply(lambda x: json.dumps(safe_split(x, ',')))
            df['directions'] = chunk['instructions'].apply(lambda x: json.dumps(safe_split(x, '.')))
            df['image'] = chunk['image_url'].apply(lambda x: map_image_url(x, image_map))
            df['cuisine'] = chunk['cuisine']
            df['category'] = chunk['course']
            df['prep_time'] = chunk['prep_time'].astype(str)
            df['source'] = 'Indian_Cuisines'
            df.to_sql('recipes', engine, if_exists='append', index=False, method='multi')

    # 2. Indian - Cleaned_Indian_Food_Dataset.csv
    cleaned_indian_path = DATASETS_DIR / "Indian" / "Cleaned_Indian_Food_Dataset.csv"
    if cleaned_indian_path.exists():
        logger.info(f"Loading {cleaned_indian_path}...")
        for chunk in tqdm(pd.read_csv(cleaned_indian_path, chunksize=CHUNK_SIZE)):
            df = pd.DataFrame()
            df['title'] = chunk['TranslatedRecipeName']
            df['ingredients'] = chunk['TranslatedIngredients'].apply(lambda x: json.dumps(safe_split(x, ',')))
            df['directions'] = chunk['TranslatedInstructions'].apply(lambda x: json.dumps(safe_split(x, '.')))
            df['image'] = chunk['image-url'].apply(lambda x: map_image_url(x, image_map))
            df['cuisine'] = chunk['Cuisine']
            df['prep_time'] = chunk['TotalTimeInMins'].astype(str)
            df['link'] = chunk['URL']
            df['source'] = 'Indian_Cleaned'
            df.to_sql('recipes', engine, if_exists='append', index=False, method='multi')

    # 3. Thai - thailand_foods.csv
    thai_path = DATASETS_DIR / "Thai" / "thailand_foods.csv"
    if thai_path.exists():
        logger.info(f"Loading {thai_path}...")
        for chunk in tqdm(pd.read_csv(thai_path, chunksize=CHUNK_SIZE)):
            df = pd.DataFrame()
            df['title'] = chunk['en_name']
            df['ingredients'] = chunk['ingredients'].apply(lambda x: json.dumps(safe_split(x, '+')))
            df['directions'] = json.dumps([]) # Thai dataset lacks instructions
            df['cuisine'] = 'Thai'
            df['category'] = chunk['course']
            df['source'] = 'Thai'
            df.to_sql('recipes', engine, if_exists='append', index=False, method='multi')

    # 4. Cultural (recipes_master.csv ONLY for simplicity)
    # Joining a 3.7M rows ingredient table and 4.6M rows step table in pandas chunk by chunk is complex.
    cultural_master_path = DATASETS_DIR / "Cultural" / "recipes_master.csv"
    if cultural_master_path.exists():
        logger.info(f"Loading {cultural_master_path}...")
        for chunk in tqdm(pd.read_csv(cultural_master_path, chunksize=CHUNK_SIZE)):
            df = pd.DataFrame()
            df['title'] = chunk['recipe_name']
            df['ingredients'] = json.dumps(["Ingredients provided separately in Cultural dataset"]) 
            df['directions'] = json.dumps(["Steps provided separately in Cultural dataset"]) 
            df['cuisine'] = chunk['cuisine']
            df['category'] = chunk['category']
            df['prep_time'] = chunk['total_time_minutes'].astype(str)
            df['calories'] = pd.to_numeric(chunk['calories_per_serving'], errors='coerce')
            df['rating'] = pd.to_numeric(chunk['rating'], errors='coerce')
            df['source'] = 'Cultural'
            df.to_sql('recipes', engine, if_exists='append', index=False, method='multi')

    # 5. RecipeNLG (Takes a long time, so we do it last, limiting for fast loading during testing if needed)
    recipenlg_path = DATASETS_DIR / "RecipeNLG" / "RecipeNLG_dataset.csv"
    if recipenlg_path.exists():
        logger.info(f"Loading {recipenlg_path}...")
        for chunk in tqdm(pd.read_csv(recipenlg_path, chunksize=CHUNK_SIZE)):
            df = pd.DataFrame()
            df['title'] = chunk['title']
            df['ingredients'] = chunk['ingredients'].apply(lambda x: json.dumps(parse_json_array(x)))
            df['directions'] = chunk['directions'].apply(lambda x: json.dumps(parse_json_array(x)))
            df['link'] = chunk['link']
            df['source'] = chunk['source']
            df['ner'] = chunk['NER'].apply(lambda x: json.dumps(parse_json_array(x)))
            df.to_sql('recipes', engine, if_exists='append', index=False, method='multi')

    logger.info("Database loaded successfully.")

if __name__ == "__main__":
    load_data()
