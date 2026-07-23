import pandas as pd
from pathlib import Path
import os


BASE = Path(__file__).parent.parent / "datasets" / "datasets"


# =========================================================
# 1. INDIAN DATASET
# =========================================================

print("Loading Indian Dataset...")

indian_path = BASE / "Indian" / "Cleaned_Indian_Food_Dataset.csv"

indian_df = pd.read_csv(indian_path)

indian_data = pd.DataFrame({

    "ingredients": indian_df["TranslatedIngredients"],

    "cuisine": indian_df["Cuisine"]

})

print("Indian Samples:", len(indian_data))


# =========================================================
# 2. CUISINES DATASET (Indian - large)
# =========================================================

print("\nLoading Cuisines Dataset...")

cuisines_path = BASE / "Indian" / "cuisines.csv"

cuisines_df = pd.read_csv(cuisines_path)

cuisines_data = pd.DataFrame({

    "ingredients": cuisines_df["ingredients"],

    "cuisine": cuisines_df["cuisine"]

})

print("Cuisines Samples:", len(cuisines_data))


# =========================================================
# 3. THAI DATASET
# =========================================================

print("\nLoading Thai Dataset...")

thai_path = BASE / "Thai" / "thailand_foods.csv"

thai_df = pd.read_csv(thai_path)

thai_data = pd.DataFrame({

    "ingredients": thai_df["ingredients"],

    "cuisine": "Thai"

})

print("Thai Samples:", len(thai_data))


# =========================================================
# 4. CULTURAL DATASET
# =========================================================

print("\nLoading Cultural Dataset...")

master_path = BASE / "Cultural" / "recipes_master.csv"

ingredient_path = BASE / "Cultural" / "recipe_ingredients.csv"


master_df = pd.read_csv(master_path)

ingredient_df = pd.read_csv(ingredient_path)


# Group ingredients by recipe_id

grouped_ingredients = (

    ingredient_df

    .groupby("recipe_id")["ingredient_name"]

    .apply(lambda x: " ".join(x.astype(str)))

    .reset_index()

)


# Join with master table

cultural_df = pd.merge(

    master_df[["recipe_id", "cuisine"]],

    grouped_ingredients,

    on="recipe_id"

)


cultural_data = pd.DataFrame({

    "ingredients": cultural_df["ingredient_name"],

    "cuisine": cultural_df["cuisine"]

})

print("Cultural Samples:", len(cultural_data))


# =========================================================
# COMBINE ALL
# =========================================================

print("\nCombining datasets...")

combined = pd.concat([

    indian_data,

    cuisines_data,

    thai_data,

    cultural_data

], ignore_index=True)


# Remove empty rows

combined = combined.dropna()


# Remove duplicate rows

combined = combined.drop_duplicates()


# Save

save_path = Path(__file__).parent.parent / "processed_data" / "cuisine_training_data.csv"

# Ensure the directory exists before saving!
os.makedirs(save_path.parent, exist_ok=True)

combined.to_csv(save_path, index=False)


print("\nSaved Successfully")


print("Total Samples:", len(combined))


print("\nCuisine Distribution:\n")

print(combined["cuisine"].value_counts())


print("\nPreview:\n")

print(combined.head())