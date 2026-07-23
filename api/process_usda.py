import pandas as pd
import json
import os

def process_usda_data():
    """
    Processes the massive USDA FoodData Central CSVs to extract 
    core nutritional information for a curated set of ingredients.
    Outputs a compressed JSON dictionary.
    """
    print("Loading USDA CSVs (this might take a minute)...")
    
    # Path to USDA datasets
    base_path = "../model_training/Datasets/FoodData_Central_csv_2026-04-30/FoodData_Central_csv_2026-04-30"
    
    # We only read the columns we need to save memory
    print("Loading foods...")
    foods_df = pd.read_csv(os.path.join(base_path, "food.csv"), usecols=["fdc_id", "description"])
    
    print("Loading nutrients metadata...")
    nutrients_df = pd.read_csv(os.path.join(base_path, "nutrient.csv"), usecols=["id", "name", "unit_name"])
    
    # Important nutrient IDs
    # 1008 / 2047 = Energy (KCAL)
    # 1003 = Protein (G)
    # 1004 = Total Fat (G)
    # 1005 = Carbohydrate (G)
    TARGET_NUTRIENTS = {
        1008: "calories", 
        2047: "calories", 
        1003: "protein", 
        1004: "fat", 
        1005: "carbs"
    }
    
    print("Loading food_nutrient mapping...")
    # This file is massive (1.7GB), we process in chunks if needed, or filter on read
    # For memory safety, we'll iterate in chunks
    chunk_size = 1000000
    
    # Dictionary to hold our final aggregated data
    # {fdc_id: {"calories": 100, "protein": 10...}}
    nutrition_map = {}
    
    for chunk in pd.read_csv(os.path.join(base_path, "food_nutrient.csv"), 
                             usecols=["fdc_id", "nutrient_id", "amount"],
                             chunksize=chunk_size):
        
        # Filter only the nutrients we care about to save memory
        filtered_chunk = chunk[chunk["nutrient_id"].isin(TARGET_NUTRIENTS.keys())]
        
        for _, row in filtered_chunk.iterrows():
            fdc_id = int(row["fdc_id"])
            nut_id = int(row["nutrient_id"])
            amount = float(row["amount"])
            
            if fdc_id not in nutrition_map:
                nutrition_map[fdc_id] = {"calories": 0, "protein": 0, "fat": 0, "carbs": 0}
                
            nut_key = TARGET_NUTRIENTS[nut_id]
            # Sometimes USDA has both 1008 and 2047 for energy, we take the max
            if nut_key == "calories":
                nutrition_map[fdc_id]["calories"] = max(nutrition_map[fdc_id]["calories"], amount)
            else:
                nutrition_map[fdc_id][nut_key] = amount
                
    print("Merging with food descriptions...")
    # Now build the final JSON format mapping lowercase ingredient name -> nutrition
    final_dict = {}
    
    for _, row in foods_df.iterrows():
        fdc_id = int(row["fdc_id"])
        desc = str(row["description"]).lower().strip()
        
        # Only include foods that have nutrition data
        if fdc_id in nutrition_map:
            # We don't want 1.6 million keys in our frontend JSON if we can avoid it.
            # We could filter for common ingredients, but for now we'll write them all out
            # or just take the shortest descriptions which are usually base ingredients
            
            # Simple heuristic: Keep names shorter than 40 chars (avoids ultra-specific branded foods)
            if len(desc) < 40 and desc not in final_dict:
                final_dict[desc] = nutrition_map[fdc_id]

    print(f"Compiled nutrition data for {len(final_dict)} ingredients.")
    
    # Save to JSON
    output_path = "nutrition_lookup.json"
    with open(output_path, 'w') as f:
        json.dump(final_dict, f)
        
    print(f"Successfully saved to {output_path}")

if __name__ == "__main__":
    process_usda_data()
