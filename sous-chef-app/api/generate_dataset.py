import json
import random

cuisines = ["Italian", "Indian", "Mexican", "Japanese", "American", "Mediterranean", "French"]
categories = ["Dinner", "Lunch", "Breakfast", "Dessert", "Snack"]

recipes = []
for i in range(1, 101):
    cuisine = random.choice(cuisines)
    category = random.choice(categories)
    title = f"{cuisine} {category} {i}"
    
    recipes.append({
        "id": f"r{i}",
        "title": title,
        "description": f"A wonderful {cuisine} dish perfect for {category.lower()}.",
        "prepTime": f"{random.randint(10, 60)} min",
        "calories": random.randint(200, 800),
        "protein": random.randint(5, 50),
        "fat": random.randint(5, 40),
        "carbs": random.randint(10, 100),
        "cuisine": cuisine,
        "category": category,
        "tags": [cuisine.lower(), category.lower()],
        "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "ingredients": [
            "1 cup main ingredient",
            "2 tbsp oil",
            "1 tsp salt",
            "Spices to taste"
        ],
        "directions": [
            "Prepare ingredients.",
            "Cook in a pan for 20 minutes.",
            "Serve hot."
        ],
        "rating": round(random.uniform(3.5, 5.0), 1)
    })

with open("api/data/recipes.json", "w") as f:
    json.dump(recipes, f, indent=2)

print("Generated 100 recipes!")
