"""
chemistry_validator.py
======================
Rule-based Chemistry Validator for Recipe Engine.

This module flags basic culinary chemistry violations when combining ingredients
and cooking methods (e.g., acid/dairy interactions, leavening activation).

Design:
    - Class-based for FastAPI dependency injection.
    - Ingredient categorization via dictionary lookup.
    - Modular rule evaluation logic.

Usage:
    validator = ChemistryValidator()
    violations = validator.validate_recipe(["milk", "lemon juice", "flour"], ["whisk", "bake"])
"""

import logging
from typing import List, Dict, Any, Set
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class Violation:
    rule_name: str
    severity: str  # "warning" or "error"
    description: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "rule": self.rule_name,
            "severity": self.severity,
            "description": self.description
        }


class ChemistryValidator:
    """
    Validates recipes for culinary chemistry violations using a rule-based approach.
    Designed to be injected as a dependency in FastAPI.
    """

    def __init__(self):
        # Dictionary categorizing ingredients into chemical roles
        # Note: In a real system, this would be a larger DB or taxonomy
        self.ingredient_categories = {
            "acid": {
                "lemon juice", "lime juice", "vinegar", "buttermilk", "yogurt", 
                "sour cream", "tomato", "tamarind", "citrus", "wine"
            },
            "dairy_protein": {
                "milk", "cream", "heavy cream", "half and half"
            },
            "base": {
                "baking soda", "sodium bicarbonate"
            },
            "baking_powder": {
                "baking powder"
            },
            "stabilizer": {
                "cornstarch", "flour", "gelatin", "agar", "mustard"
            }
        }

    def _categorize_ingredients(self, ingredients: List[str]) -> Dict[str, Set[str]]:
        """Maps input ingredients to their chemical categories."""
        categorized = {cat: set() for cat in self.ingredient_categories}
        
        # Lowercase and normalize for matching
        cleaned_ingredients = [ing.lower().strip() for ing in ingredients]
        
        for ing in cleaned_ingredients:
            for category, keywords in self.ingredient_categories.items():
                if any(keyword in ing for keyword in keywords):
                    categorized[category].add(ing)
                    
        return categorized

    def validate_recipe(self, ingredients: List[str], methods: List[str] = None) -> List[Dict[str, Any]]:
        """
        Validates the ingredient list against known culinary chemistry rules.
        
        Args:
            ingredients: List of recipe ingredients (e.g., ["1 cup milk", "2 tbsp lemon juice"]).
            methods: List of cooking methods (optional).
            
        Returns:
            List of violation dictionaries. Empty list if no violations found.
        """
        if methods is None:
            methods = []
            
        violations: List[Violation] = []
        categorized = self._categorize_ingredients(ingredients)
        
        # Rule 1: Acid + Dairy Curdling
        # If acid and dairy are present without a stabilizer, it might curdle.
        if categorized["acid"] and categorized["dairy_protein"]:
            if not categorized["stabilizer"]:
                violations.append(Violation(
                    rule_name="Acid-Dairy Interaction",
                    severity="warning",
                    description=(
                        f"Combining acid ({', '.join(categorized['acid'])}) with "
                        f"dairy ({', '.join(categorized['dairy_protein'])}) without a stabilizer "
                        "(like cornstarch or flour) may cause the dairy to curdle."
                    )
                ))

        # Rule 2: Leavening Activation (Baking Soda needs Acid)
        # Baking soda requires an acid to activate and release CO2.
        if categorized["base"] and not categorized["acid"]:
            violations.append(Violation(
                rule_name="Inactive Leavening Agent",
                severity="error",
                description=(
                    f"Baking soda ({', '.join(categorized['base'])}) requires an acidic ingredient "
                    "to activate and leaven properly. Add an acid like buttermilk, lemon juice, or vinegar, "
                    "or switch to baking powder."
                )
            ))

        # Rule 3: Baking Powder + Excessive Acid
        # Baking powder contains its own acid. Adding too much extra acid can cause rapid reaction and collapse.
        if categorized["baking_powder"] and len(categorized["acid"]) > 1 and not categorized["base"]:
            violations.append(Violation(
                rule_name="Excessive Acid with Baking Powder",
                severity="warning",
                description=(
                    f"Baking powder is already balanced with acid. Adding multiple strong acids "
                    f"({', '.join(categorized['acid'])}) may cause the batter to rise too quickly and collapse. "
                    "Consider replacing some baking powder with baking soda to neutralize the extra acid."
                )
            ))

        return [v.to_dict() for v in violations]


if __name__ == "__main__":
    import json
    import sys
    
    # Fix unicode printing on Windows
    sys.stdout.reconfigure(encoding="utf-8")
    
    # Configure logging for standalone test
    logging.basicConfig(level=logging.INFO)
    
    validator = ChemistryValidator()
    
    print("Testing Chemistry Validator...\n")
    
    test_cases = [
        {
            "name": "1. Acid + Dairy (Curdling risk)",
            "ingredients": ["1 cup milk", "2 tbsp lemon juice", "sugar"],
        },
        {
            "name": "2. Acid + Dairy + Stabilizer (Safe)",
            "ingredients": ["1 cup milk", "2 tbsp lemon juice", "1 tbsp cornstarch", "sugar"],
        },
        {
            "name": "3. Baking Soda missing Acid (Error)",
            "ingredients": ["2 cups flour", "1 tsp baking soda", "1 cup water", "salt"],
        },
        {
            "name": "4. Baking Soda with Acid (Safe)",
            "ingredients": ["2 cups flour", "1 tsp baking soda", "1 cup buttermilk", "salt"],
        },
        {
            "name": "5. Baking Powder with Excessive Acid (Warning)",
            "ingredients": ["2 cups flour", "1 tsp baking powder", "1/2 cup yogurt", "1 tbsp lemon juice"],
        },
        {
            "name": "6. Perfectly Safe Recipe",
            "ingredients": ["flour", "baking powder", "sugar", "milk", "eggs", "butter"],
        }
    ]
    
    for idx, case in enumerate(test_cases, 1):
        print(f"--- Test {case['name']} ---")
        print(f"Ingredients: {case['ingredients']}")
        violations = validator.validate_recipe(case["ingredients"])
        if not violations:
            print("Status: ✅ PASS (No violations)")
        else:
            print(f"Status: ❌ FAILED ({len(violations)} violations found)")
            print(json.dumps(violations, indent=2))
        print("\n")
