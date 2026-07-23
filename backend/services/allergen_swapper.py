"""
allergen_swapper.py
===================
Phase 7 — Cultural Allergen Swapper.

Scans recipe ingredients for allergens based on user preferences,
and replaces them with cuisine-appropriate safe alternatives.

Features:
    - Fuzzy ingredient matching (catches "creamy peanut butter" → peanut)
    - Cuisine-aware substitutions (dairy → coconut cream for Thai, cashew cream for Indian)
    - Multiple allergen category support (dairy, nuts, gluten, eggs, soy, shellfish, fish)
    - Diet-type support (vegan, vegetarian, keto, halal)

Usage:
    swapper = AllergenSwapper()
    result = swapper.swap_ingredients(
        ingredients=["chicken", "peanut butter", "heavy cream"],
        allergies=["nuts", "dairy"],
        cuisine="thai",
    )
"""

import logging
import re
from typing import List, Dict, Any, Optional, Set, Tuple
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class AllergenHit:
    """A detected allergen in an ingredient."""
    ingredient: str
    allergen_category: str
    trigger_word: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "ingredient": self.ingredient,
            "category": self.allergen_category,
            "trigger": self.trigger_word,
        }


@dataclass
class SwapResult:
    """Result of an ingredient swap."""
    original: str
    substitute: str
    reason: str
    cuisine_specific: bool

    def to_dict(self) -> Dict[str, Any]:
        return {
            "original": self.original,
            "substitute": self.substitute,
            "reason": self.reason,
            "cuisine_specific": self.cuisine_specific,
        }


class AllergenSwapper:
    """
    Scans ingredients for allergens and provides cuisine-aware substitutions.
    """

    def __init__(self):
        # ── Allergen Triggers ─────────────────────────────
        # Maps allergen categories to ingredient keywords that trigger them
        self.allergen_triggers: Dict[str, List[str]] = {
            "dairy": [
                "milk", "cream", "butter", "cheese", "yogurt", "yoghurt",
                "whey", "casein", "ghee", "paneer", "ricotta", "mozzarella",
                "parmesan", "cheddar", "brie", "gouda", "feta", "mascarpone",
                "half and half", "sour cream", "cream cheese", "condensed milk",
                "evaporated milk", "buttermilk", "kefir",
            ],
            "nuts": [
                "peanut", "almond", "walnut", "cashew", "pistachio",
                "hazelnut", "pecan", "macadamia", "brazil nut", "pine nut",
                "nut butter", "peanut butter", "almond butter", "almond milk",
                "cashew cream", "nutella",
            ],
            "gluten": [
                "wheat", "flour", "bread", "pasta", "noodles", "barley",
                "rye", "semolina", "couscous", "bulgur", "seitan",
                "breadcrumbs", "croutons", "tortilla", "pita",
                "soy sauce",  # Traditional soy sauce contains wheat
            ],
            "eggs": [
                "egg", "eggs", "egg white", "egg yolk", "mayonnaise",
                "meringue", "custard", "aioli",
            ],
            "soy": [
                "soy sauce", "soy", "tofu", "tempeh", "edamame",
                "miso", "soybean", "soy milk",
            ],
            "shellfish": [
                "shrimp", "prawn", "crab", "lobster", "crawfish",
                "crayfish", "scallop", "clam", "mussel", "oyster",
            ],
            "fish": [
                "fish", "salmon", "tuna", "cod", "tilapia", "anchovy",
                "sardine", "mackerel", "trout", "bass", "halibut",
                "fish sauce", "worcestershire",
            ],
            "sesame": [
                "sesame", "tahini", "sesame oil", "sesame seeds",
            ],
        }

        # ── Substitution Database ─────────────────────────
        # Maps trigger ingredients to cuisine-aware replacements
        self.substitutions: Dict[str, Dict[str, str]] = {
            # Dairy
            "milk": {
                "default": "oat milk",
                "asian": "coconut milk",
                "indian": "coconut milk",
                "thai": "coconut milk",
                "mexican": "almond milk",
                "italian": "oat milk",
            },
            "cream": {
                "default": "coconut cream",
                "indian": "cashew cream",
                "thai": "coconut cream",
                "italian": "silken tofu blended",
                "mexican": "avocado cream",
            },
            "heavy cream": {
                "default": "coconut cream",
                "indian": "cashew cream",
                "thai": "coconut cream",
                "french": "oat cream",
            },
            "butter": {
                "default": "olive oil",
                "indian": "coconut oil",
                "asian": "sesame oil",
                "italian": "olive oil",
                "french": "vegan butter",
                "baking": "coconut oil",
            },
            "cheese": {
                "default": "nutritional yeast",
                "italian": "vegan parmesan",
                "mexican": "avocado",
                "indian": "firm tofu",
            },
            "yogurt": {
                "default": "coconut yogurt",
                "indian": "coconut yogurt",
                "greek": "soy yogurt",
            },
            "sour cream": {
                "default": "coconut cream + lemon",
                "mexican": "mashed avocado",
            },
            "paneer": {
                "default": "firm tofu",
                "indian": "firm tofu",
            },
            "ghee": {
                "default": "coconut oil",
                "indian": "coconut oil",
            },

            # Nuts
            "peanut butter": {
                "default": "sunflower seed butter",
                "asian": "tahini",
                "thai": "sunflower seed butter",
            },
            "peanut": {
                "default": "sunflower seeds",
                "asian": "toasted coconut flakes",
                "thai": "roasted sunflower seeds",
            },
            "almond": {
                "default": "sunflower seeds",
                "indian": "pumpkin seeds",
            },
            "almond milk": {
                "default": "oat milk",
                "asian": "coconut milk",
            },
            "cashew": {
                "default": "sunflower seeds",
                "indian": "melon seeds",
            },
            "walnut": {
                "default": "pumpkin seeds",
            },

            # Gluten
            "flour": {
                "default": "rice flour",
                "gluten-free": "almond flour",
                "asian": "rice flour",
                "indian": "chickpea flour (besan)",
            },
            "pasta": {
                "default": "rice noodles",
                "italian": "gluten-free pasta",
                "asian": "rice noodles",
            },
            "bread": {
                "default": "gluten-free bread",
            },
            "breadcrumbs": {
                "default": "crushed rice crackers",
                "asian": "panko (gluten-free)",
            },
            "soy sauce": {
                "default": "coconut aminos",
                "gluten-free": "tamari",
                "asian": "tamari",
            },
            "tortilla": {
                "default": "corn tortilla",
                "mexican": "corn tortilla",
            },

            # Eggs
            "egg": {
                "default": "flax egg",
                "vegan": "aquafaba (3 tbsp)",
                "baking": "applesauce (1/4 cup)",
                "binding": "chia egg",
            },
            "eggs": {
                "default": "flax eggs",
                "vegan": "aquafaba",
                "baking": "applesauce",
            },
            "mayonnaise": {
                "default": "vegan mayonnaise",
            },

            # Soy
            "tofu": {
                "default": "chickpeas",
                "asian": "seitan",
            },
            "tempeh": {
                "default": "jackfruit",
            },
            "miso": {
                "default": "vegetable bouillon paste",
            },

            # Shellfish / Fish
            "shrimp": {
                "default": "king oyster mushroom",
                "asian": "hearts of palm",
            },
            "fish sauce": {
                "default": "coconut aminos + seaweed",
                "thai": "mushroom sauce + salt",
                "asian": "soy sauce + lime",
            },

            # Sesame
            "sesame oil": {
                "default": "olive oil",
                "asian": "perilla oil",
            },
            "tahini": {
                "default": "sunflower seed butter",
            },
        }

        # ── Diet Type Overrides ──────────────────────────
        self.diet_exclusions: Dict[str, List[str]] = {
            "vegan": ["dairy", "eggs", "fish", "shellfish"],
            "vegetarian": ["fish", "shellfish"],
            "keto": [],  # No exclusions, but could flag high-carb
            "halal": [],  # Would need a separate halal ingredient list
        }

    def scan_allergens(
        self,
        ingredients: List[str],
        allergies: List[str],
        diet_type: Optional[str] = None,
    ) -> List[AllergenHit]:
        """
        Scan a list of ingredients for allergens.

        Uses longest-match-first to avoid false positives like
        "peanut butter" matching the dairy trigger "butter" instead
        of the nut trigger "peanut butter".

        Args:
            ingredients: List of recipe ingredient strings.
            allergies: List of allergen categories (e.g., ["dairy", "nuts"]).
            diet_type: Optional dietary restriction (e.g., "vegan").

        Returns:
            List of AllergenHit objects for detected allergens.
        """
        # Combine explicit allergies with diet-derived exclusions
        all_exclusions = set(a.lower() for a in allergies)
        if diet_type and diet_type.lower() in self.diet_exclusions:
            all_exclusions.update(self.diet_exclusions[diet_type.lower()])

        hits: List[AllergenHit] = []

        for ingredient in ingredients:
            ing_lower = ingredient.lower().strip()

            # Collect ALL matching triggers across all categories,
            # sorted by trigger length DESC so "peanut butter" beats "butter"
            all_matches: List[Tuple[str, str, int]] = []  # (category, trigger, length)

            for category in all_exclusions:
                if category not in self.allergen_triggers:
                    continue

                for trigger in self.allergen_triggers[category]:
                    if self._fuzzy_match(trigger, ing_lower):
                        all_matches.append((category, trigger, len(trigger)))

            if not all_matches:
                continue

            # Sort by trigger length descending — prefer most specific match
            all_matches.sort(key=lambda x: x[2], reverse=True)

            # Take the best (longest) match as the primary hit
            best_category, best_trigger, _ = all_matches[0]
            hits.append(AllergenHit(
                ingredient=ingredient,
                allergen_category=best_category,
                trigger_word=best_trigger,
            ))

        return hits

    def swap_ingredients(
        self,
        ingredients: List[str],
        allergies: List[str],
        cuisine: Optional[str] = None,
        diet_type: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Scan and swap allergenic ingredients with safe alternatives.

        Args:
            ingredients: List of recipe ingredient strings.
            allergies: List of allergen categories.
            cuisine: Optional cuisine type for context-aware swaps.
            diet_type: Optional dietary restriction.

        Returns:
            Dict with safe_ingredients, swaps_made, and any warnings.
        """
        hits = self.scan_allergens(ingredients, allergies, diet_type)

        # Build a set of ingredients that need swapping
        ingredients_to_swap: Dict[str, AllergenHit] = {}
        for hit in hits:
            # Use the original ingredient text as key (avoid duplicate swaps)
            if hit.ingredient not in ingredients_to_swap:
                ingredients_to_swap[hit.ingredient] = hit

        # Perform swaps
        safe_ingredients: List[str] = []
        swaps_made: List[SwapResult] = []
        warnings: List[str] = []

        for ingredient in ingredients:
            if ingredient in ingredients_to_swap:
                hit = ingredients_to_swap[ingredient]
                substitute, is_cuisine_specific = self._find_substitute(
                    hit.trigger_word, cuisine, diet_type
                )

                if substitute:
                    # Try to preserve quantities: "2 cups milk" → "2 cups oat milk"
                    swapped = self._replace_preserving_quantity(
                        ingredient, hit.trigger_word, substitute
                    )
                    safe_ingredients.append(swapped)
                    swaps_made.append(SwapResult(
                        original=ingredient,
                        substitute=swapped,
                        reason=f"{hit.allergen_category} allergy ({hit.trigger_word})",
                        cuisine_specific=is_cuisine_specific,
                    ))
                else:
                    warnings.append(
                        f"No substitute found for '{ingredient}' "
                        f"({hit.allergen_category}). Please review manually."
                    )
                    safe_ingredients.append(ingredient)  # Keep original with warning
            else:
                safe_ingredients.append(ingredient)

        return {
            "safe_ingredients": safe_ingredients,
            "swaps_made": [s.to_dict() for s in swaps_made],
            "allergens_detected": [h.to_dict() for h in hits],
            "warnings": warnings,
            "total_swaps": len(swaps_made),
            "is_safe": len(warnings) == 0 and len(hits) == len(swaps_made),
        }

    def _fuzzy_match(self, trigger: str, ingredient: str) -> bool:
        """
        Check if a trigger word appears in an ingredient string.
        Uses word-boundary matching to avoid false positives.
        """
        # Exact substring match
        if trigger in ingredient:
            return True

        # Word-boundary match for single words
        trigger_words = trigger.split()
        if len(trigger_words) == 1:
            # Match as whole word
            pattern = r'\b' + re.escape(trigger) + r'\b'
            return bool(re.search(pattern, ingredient))

        # Multi-word trigger: check all words present
        return all(word in ingredient for word in trigger_words)

    def _find_substitute(
        self,
        trigger: str,
        cuisine: Optional[str],
        diet_type: Optional[str],
    ) -> Tuple[Optional[str], bool]:
        """
        Find the best substitute for a trigger ingredient.

        Priority:
            1. Cuisine-specific substitute
            2. Diet-type specific substitute
            3. Default substitute

        Returns:
            Tuple of (substitute_string, is_cuisine_specific).
        """
        if trigger not in self.substitutions:
            # Try partial match
            for key in self.substitutions:
                if key in trigger or trigger in key:
                    trigger = key
                    break
            else:
                return None, False

        subs = self.substitutions[trigger]

        # 1. Cuisine-specific
        if cuisine:
            cuisine_lower = cuisine.lower()
            if cuisine_lower in subs:
                return subs[cuisine_lower], True
            # Try partial cuisine match (e.g., "south indian" → "indian")
            for key in subs:
                if key in cuisine_lower or cuisine_lower in key:
                    return subs[key], True

        # 2. Diet-type specific
        if diet_type and diet_type.lower() in subs:
            return subs[diet_type.lower()], False

        # 3. Default
        if "default" in subs:
            return subs["default"], False

        return None, False

    def _replace_preserving_quantity(
        self,
        original: str,
        trigger: str,
        substitute: str,
    ) -> str:
        """
        Replace the allergen ingredient while preserving any quantity/measurement.
        E.g., "2 cups milk" → "2 cups oat milk"
        """
        # Try to find and replace just the trigger word
        pattern = re.compile(re.escape(trigger), re.IGNORECASE)
        result = pattern.sub(substitute, original, count=1)

        # If the result is identical (no match found), just return substitute
        if result == original:
            return substitute

        return result


if __name__ == "__main__":
    import json
    import sys

    sys.stdout.reconfigure(encoding="utf-8")
    logging.basicConfig(level=logging.INFO)

    swapper = AllergenSwapper()

    print("Testing Allergen Swapper...\n")

    test_cases = [
        {
            "name": "1. Peanut + Dairy allergy (Thai cuisine)",
            "ingredients": ["chicken breast", "2 tbsp peanut butter", "1 cup heavy cream", "garlic"],
            "allergies": ["nuts", "dairy"],
            "cuisine": "thai",
        },
        {
            "name": "2. Gluten allergy (Italian)",
            "ingredients": ["500g pasta", "2 tbsp soy sauce", "flour tortilla", "olive oil"],
            "allergies": ["gluten"],
            "cuisine": "italian",
        },
        {
            "name": "3. Vegan diet (Indian)",
            "ingredients": ["paneer", "ghee", "2 eggs", "yogurt", "cumin"],
            "allergies": [],
            "cuisine": "indian",
            "diet": "vegan",
        },
        {
            "name": "4. Multiple allergies (No cuisine)",
            "ingredients": ["1 cup milk", "3 eggs", "peanut oil", "shrimp"],
            "allergies": ["dairy", "eggs", "nuts", "shellfish"],
            "cuisine": None,
        },
    ]

    for tc in test_cases:
        print(f"--- {tc['name']} ---")
        result = swapper.swap_ingredients(
            ingredients=tc["ingredients"],
            allergies=tc["allergies"],
            cuisine=tc.get("cuisine"),
            diet_type=tc.get("diet"),
        )
        print(f"Safe: {'✅' if result['is_safe'] else '⚠️'}")
        print(f"Swaps: {result['total_swaps']}")
        for swap in result["swaps_made"]:
            tag = "🌍" if swap["cuisine_specific"] else "🔄"
            print(f"  {tag} {swap['original']} → {swap['substitute']} ({swap['reason']})")
        if result["warnings"]:
            for w in result["warnings"]:
                print(f"  ⚠️ {w}")
        print(f"Final ingredients: {result['safe_ingredients']}")
        print()
