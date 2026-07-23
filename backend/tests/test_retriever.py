import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.recipe_retriever import RecipeRetriever

def test_retriever_search():
    ingredients = ["chicken", "butter", "tomato"]
    retriever = RecipeRetriever()
    results = retriever.search(ingredients, top_k=3)
    
    assert len(results) > 0, "Should return at least one recipe match"
    
    print("\nTop Matching Recipes\n")
    for recipe in results:
        print("=" * 50)
        print("Recipe:", recipe["title"])
        print("Match Score:", recipe["match_score"])
        print("Matched:", recipe["matched_ingredients"])
        print("Missing:", recipe["missing_ingredients"])
        print()