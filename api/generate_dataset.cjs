
const fs = require("fs");

const cuisines = ["Italian", "Indian", "Mexican", "Japanese", "American", "Mediterranean", "French", "Thai", "Chinese"];
const categories = ["Dinner", "Lunch", "Breakfast", "Dessert", "Snack"];

const ingredientsList = [
    ["1 lb chicken breast", "2 tbsp olive oil", "1 tsp salt", "1 tsp pepper", "2 cloves garlic"],
    ["2 cups pasta", "1 cup tomato sauce", "1/2 cup parmesan cheese", "1 tbsp basil"],
    ["1 cup rice", "1/2 cup black beans", "1/4 cup salsa", "1/4 cup corn", "Cilantro"],
    ["2 salmon fillets", "1 lemon", "1 tbsp butter", "Asparagus spears"],
    ["3 eggs", "1/4 cup milk", "1/2 cup cheddar cheese", "1/4 cup spinach"]
];

const titles = [
    "Garlic Butter Chicken", "Classic Tomato Pasta", "Mexican Rice Bowl", 
    "Lemon Butter Salmon", "Cheesy Spinach Omelette", "Spicy Tofu Stir Fry", 
    "Mushroom Risotto", "Beef Tacos", "Chicken Tikka Masala", "Pad Thai"
];

const images = [
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
];

const recipes = [];
for (let i = 1; i <= 250; i++) {
    const cuisine = cuisines[Math.floor(Math.random() * cuisines.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const baseTitle = titles[Math.floor(Math.random() * titles.length)];
    const title = `${baseTitle} (Variation ${i})`;
    const ingredients = ingredientsList[Math.floor(Math.random() * ingredientsList.length)];
    const image = images[Math.floor(Math.random() * images.length)];
    
    recipes.push({
        id: `r${i}`,
        title: title,
        description: `A wonderful ${cuisine} dish perfect for ${category.toLowerCase()}.`,
        prepTime: `${Math.floor(Math.random() * 50) + 10} min`,
        calories: Math.floor(Math.random() * 600) + 200,
        protein: Math.floor(Math.random() * 45) + 5,
        fat: Math.floor(Math.random() * 35) + 5,
        carbs: Math.floor(Math.random() * 90) + 10,
        cuisine: cuisine,
        category: category,
        tags: [cuisine.toLowerCase(), category.toLowerCase()],
        image: image,
        ingredients: ingredients,
        directions: [
            "Prepare all ingredients.",
            "Cook over medium heat until done.",
            "Serve immediately and enjoy."
        ],
        rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10
    });
}

fs.writeFileSync("api/data/recipes.json", JSON.stringify(recipes, null, 2));
console.log("Generated 250 recipes successfully!");

