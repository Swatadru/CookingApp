import pandas as pd
from pathlib import Path


DATA_PATH = Path(__file__).parent.parent / "processed_data" / "cuisine_training_data.csv"

df = pd.read_csv(DATA_PATH)

print("Before Cleaning:", len(df))


# =========================================
# FIX UNICODE BOM CORRUPTION
# Strip \ufeff (BOM) from all labels
# =========================================

df["cuisine"] = df["cuisine"].str.replace("\ufeff", "", regex=False).str.strip()


# =========================================
# LABEL NORMALIZATION
# =========================================

mapping = {

    # =============================================
    # SOUTH ASIAN CLUSTER
    # Afghan, Pakistani, Bangladeshi, Indian all
    # share cumin/coriander/turmeric/ginger/garlic
    # TF-IDF cannot separate them → merge
    # =============================================

    # Indian regional labels → South Asian
    "South Indian Recipes": "South Asian",
    "Andhra": "South Asian",
    "Kerala Recipes": "South Asian",
    "North Indian Recipes": "South Asian",
    "Bengali Recipes": "South Asian",
    "Chettinad": "South Asian",
    "Karnataka": "South Asian",
    "Maharashtrian Recipes": "South Asian",
    "Tamil Nadu": "South Asian",
    "Rajasthani": "South Asian",
    "Gujarati Recipes": "South Asian",
    "Punjabi": "South Asian",
    "Goan Recipes": "South Asian",
    "Kashmiri": "South Asian",
    "Mangalorean": "South Asian",
    "Parsi Recipes": "South Asian",
    "Awadhi": "South Asian",
    "Konkan": "South Asian",
    "Sindhi": "South Asian",
    "Assamese": "South Asian",
    "Hyderabadi": "South Asian",
    "Oriya Recipes": "South Asian",
    "Bihari": "South Asian",
    "Mughlai": "South Asian",
    "Indian": "South Asian",

    # New regional labels from cuisines.csv → South Asian
    "North East India Recipes": "South Asian",
    "Himachal": "South Asian",
    "Coorg": "South Asian",
    "Coastal Karnataka": "South Asian",
    "North Karnataka": "South Asian",
    "South Karnataka": "South Asian",
    "Udupi": "South Asian",
    "Malabar": "South Asian",
    "Malvani": "South Asian",
    "Lucknowi": "South Asian",
    "Uttar Pradesh": "South Asian",
    "Kongunadu": "South Asian",
    "Haryana": "South Asian",
    "Jharkhand": "South Asian",
    "Uttarakhand-North Kumaon": "South Asian",
    "Nagaland": "South Asian",

    # Neighboring cuisines with overlapping ingredients
    "Pakistani": "South Asian",
    "Bangladeshi": "South Asian",
    "Afghan": "South Asian",
    "Nepalese": "South Asian",
    "Sri Lankan": "South Asian",

    # =============================================
    # WESTERN CLUSTER
    # French has too few samples, shares ingredients
    # with Continental → merge
    # =============================================
    "Continental": "Western",
    "French": "Western",

    # =============================================
    # DISTINCT CUISINES (keep separate)
    # These have unique ingredient signatures
    # =============================================
    "Indo Chinese": "Chinese",
    "Chinese": "Chinese",
    "Sichuan": "Chinese",
    "Thai": "Thai",
    "Mexican": "Mexican",
    "Italian Recipes": "Italian",
}


# =============================================
# DROP UNLEARNABLE CLASSES
# Fusion = mix of everything (unclassifiable)
# Asian = too vague (Chinese/Thai already covered)
# European, Mediterranean, Middle Eastern = too few samples
# =============================================

bad_labels = [

    # Meal types (not cuisines)
    "Lunch",
    "Dinner",
    "Brunch",
    "Snack",
    "Breakfast",
    "Dessert",
    "Appetizer",

    # Unlearnable cuisine labels
    "Fusion",
    "Asian",
    "European",
    "Mediterranean",
    "Middle Eastern",
    "Arab",
    "African",
]


# Replace labels if present in mapping

df["cuisine"] = df["cuisine"].replace(mapping)


# Remove bad/unlearnable labels

df = df[~df["cuisine"].isin(bad_labels)]


# Remove very rare cuisines (< 50 samples — not enough to learn)

counts = df["cuisine"].value_counts()

valid_labels = counts[counts >= 50].index

df = df[df["cuisine"].isin(valid_labels)]


# Save cleaned dataset

SAVE_PATH = Path(__file__).parent.parent / "processed_data" / "cleaned_cuisine_data.csv"

df.to_csv(SAVE_PATH, index=False)


print("\nAfter Cleaning:", len(df))

print("\nFinal Labels:\n")

print(df["cuisine"].value_counts())