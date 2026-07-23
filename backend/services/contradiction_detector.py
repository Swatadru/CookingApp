"""
contradiction_detector.py
=========================
Phase 6 — Rule-Based Contradiction Detection Engine.

Validates whether GPT-generated recipe instructions are logically consistent
with the listed ingredients and implied equipment. Catches errors like:

    - "Bake at 180°C" but no oven mentioned and no baking ingredients
    - "Deep fry the chicken" but oil is not in the ingredient list
    - "Blend until smooth" but no blender available
    - "Boil pasta" but water is not listed

Design:
    - Action verbs are extracted from recipe steps using lemma mapping.
    - Each action maps to required ingredients/equipment.
    - Missing requirements generate contradiction errors with severity levels.

Usage:
    detector = ContradictionDetector()
    result = detector.detect(recipe_data)
    # → {"contradictions": [...], "logic_score": 85, "is_valid": True}
"""

import logging
import re
from typing import List, Dict, Any, Set
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class Contradiction:
    """A single detected contradiction in a recipe."""
    rule: str
    severity: str  # "error" or "warning"
    action: str
    missing: List[str]
    message: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "rule": self.rule,
            "severity": self.severity,
            "action": self.action,
            "missing": self.missing,
            "message": self.message,
        }


class ContradictionDetector:
    """
    Rule-based engine that validates recipe instructions against
    available ingredients and equipment.
    """

    def __init__(self):
        # ── Action → Required Items ──────────────────────
        # Each cooking action requires certain ingredients or equipment.
        # "any_of" means at least one must be present.
        self.rules: Dict[str, Dict[str, Any]] = {
            "bake": {
                "requires_any": ["oven"],
                "ingredient_hints": ["flour", "baking powder", "baking soda", "batter", "dough"],
                "severity": "warning",
            },
            "roast": {
                "requires_any": ["oven"],
                "ingredient_hints": [],
                "severity": "warning",
            },
            "boil": {
                "requires_any": ["water", "broth", "stock", "liquid"],
                "ingredient_hints": [],
                "severity": "error",
            },
            "simmer": {
                "requires_any": ["water", "broth", "stock", "sauce", "liquid", "milk", "cream"],
                "ingredient_hints": [],
                "severity": "warning",
            },
            "fry": {
                "requires_any": ["oil", "butter", "ghee", "lard", "fat"],
                "ingredient_hints": [],
                "severity": "error",
            },
            "deep fry": {
                "requires_any": ["oil"],
                "ingredient_hints": [],
                "severity": "error",
            },
            "saute": {
                "requires_any": ["oil", "butter", "ghee"],
                "ingredient_hints": [],
                "severity": "error",
            },
            "steam": {
                "requires_any": ["water", "steamer"],
                "ingredient_hints": [],
                "severity": "warning",
            },
            "grill": {
                "requires_any": ["grill"],
                "ingredient_hints": [],
                "severity": "warning",
            },
            "blend": {
                "requires_any": ["blender", "food processor", "immersion blender"],
                "ingredient_hints": [],
                "severity": "warning",
            },
            "puree": {
                "requires_any": ["blender", "food processor"],
                "ingredient_hints": [],
                "severity": "warning",
            },
            "knead": {
                "requires_any": ["flour", "dough"],
                "ingredient_hints": [],
                "severity": "error",
            },
            "marinate": {
                "requires_any": ["marinade", "sauce", "oil", "vinegar", "yogurt", "lemon", "lime"],
                "ingredient_hints": [],
                "severity": "warning",
            },
            "whisk": {
                "requires_any": ["whisk", "fork", "mixer"],
                "ingredient_hints": ["egg", "cream", "batter"],
                "severity": "warning",
            },
            "broil": {
                "requires_any": ["broiler", "oven"],
                "ingredient_hints": [],
                "severity": "warning",
            },
            "stir fry": {
                "requires_any": ["oil", "wok"],
                "ingredient_hints": [],
                "severity": "error",
            },
        }

        # ── Lemma Mapping ────────────────────────────────
        # Maps verb variations to their base form (no heavy NLP needed)
        self.lemma_map: Dict[str, str] = {}
        for base_verb in self.rules:
            # Handle multi-word verbs
            words = base_verb.split()
            if len(words) == 1:
                self.lemma_map[base_verb] = base_verb
                # Generate common conjugations
                if base_verb.endswith("e"):
                    self.lemma_map[base_verb + "d"] = base_verb      # bake → baked
                    self.lemma_map[base_verb + "s"] = base_verb      # bake → bakes
                    self.lemma_map[base_verb[:-1] + "ing"] = base_verb  # bake → baking
                else:
                    self.lemma_map[base_verb + "ed"] = base_verb     # grill → grilled
                    self.lemma_map[base_verb + "s"] = base_verb      # grill → grills
                    self.lemma_map[base_verb + "ing"] = base_verb    # grill → grilling
                    # Handle doubling: stir → stirred, stirring
                    self.lemma_map[base_verb + base_verb[-1] + "ed"] = base_verb
                    self.lemma_map[base_verb + base_verb[-1] + "ing"] = base_verb

    def detect(self, recipe_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Detect contradictions in a recipe.

        Args:
            recipe_data: Dict with "ingredients" (list of str) and
                         "steps" or "instructions" (list of str or single string).

        Returns:
            Dict with:
                - contradictions: List of contradiction dicts
                - logic_score: 0–100 score (100 = no contradictions)
                - is_valid: True if no errors (warnings are OK)
                - actions_detected: List of cooking actions found
        """
        ingredients = recipe_data.get("ingredients", [])
        steps = recipe_data.get("steps", recipe_data.get("instructions", []))

        # Normalize: ensure steps is a list
        if isinstance(steps, str):
            steps = [s.strip() for s in steps.split(".") if s.strip()]

        # Build a set of all ingredient-related words (lowercased)
        ingredient_words = self._extract_ingredient_words(ingredients)

        # Extract cooking actions from steps
        detected_actions = self._extract_actions(steps)

        # Check each action against requirements
        contradictions: List[Contradiction] = []

        for action in detected_actions:
            if action not in self.rules:
                continue

            rule = self.rules[action]
            required = rule["requires_any"]

            # Check if any required item appears in ingredients or steps text
            all_text = " ".join(ingredients + steps).lower()
            found = any(req in all_text or req in ingredient_words for req in required)

            if not found:
                # Also check ingredient hints (broader matching)
                hint_found = any(
                    hint in all_text or hint in ingredient_words
                    for hint in rule.get("ingredient_hints", [])
                )

                if not hint_found:
                    contradictions.append(Contradiction(
                        rule=f"{action}_requires",
                        severity=rule["severity"],
                        action=action,
                        missing=required,
                        message=(
                            f"Recipe step uses '{action}' but none of the required "
                            f"items ({', '.join(required)}) were found in the "
                            f"ingredient list or instructions."
                        ),
                    ))

        # Calculate logic score
        error_count = sum(1 for c in contradictions if c.severity == "error")
        warning_count = sum(1 for c in contradictions if c.severity == "warning")

        # Errors deduct 20 points each, warnings deduct 10
        logic_score = max(0, 100 - (error_count * 20) - (warning_count * 10))

        return {
            "contradictions": [c.to_dict() for c in contradictions],
            "logic_score": logic_score,
            "is_valid": error_count == 0,
            "error_count": error_count,
            "warning_count": warning_count,
            "actions_detected": list(detected_actions),
        }

    def _extract_ingredient_words(self, ingredients: List[str]) -> Set[str]:
        """Extract all meaningful words from the ingredient list."""
        words: Set[str] = set()
        for ing in ingredients:
            # Remove quantities and measurements
            cleaned = re.sub(
                r'\b\d+[\d/]*\s*(cup|cups|tbsp|tsp|tablespoon|teaspoon|oz|ounce|'
                r'pound|lb|kg|g|gram|ml|liter|litre|inch|cm|clove|cloves|'
                r'pinch|dash|can|bunch|stalk|piece|slice|medium|large|small)\b',
                '', ing.lower()
            )
            for word in cleaned.split():
                word = word.strip(",.;:()[]\"'")
                if len(word) > 1:
                    words.add(word)
        return words

    def _extract_actions(self, steps: List[str]) -> Set[str]:
        """Extract cooking action verbs from recipe steps."""
        actions: Set[str] = set()
        for step in steps:
            words = step.lower().split()
            for i, word in enumerate(words):
                word = word.strip(",.;:()[]\"'")

                # Check for multi-word actions first (e.g., "deep fry", "stir fry")
                if i + 1 < len(words):
                    two_word = word + " " + words[i + 1].strip(",.;:()[]\"'")
                    if two_word in self.rules:
                        actions.add(two_word)
                        continue

                # Check single-word via lemma map
                if word in self.lemma_map:
                    actions.add(self.lemma_map[word])

        return actions


if __name__ == "__main__":
    import json
    import sys

    sys.stdout.reconfigure(encoding="utf-8")
    logging.basicConfig(level=logging.INFO)

    detector = ContradictionDetector()

    print("Testing Contradiction Detector...\n")

    test_cases = [
        {
            "name": "1. Fry without oil (ERROR)",
            "recipe": {
                "ingredients": ["chicken breast", "salt", "pepper", "garlic"],
                "steps": ["Season the chicken.", "Fry the chicken until golden brown."],
            },
        },
        {
            "name": "2. Bake without oven context (WARNING)",
            "recipe": {
                "ingredients": ["flour", "sugar", "eggs", "butter"],
                "steps": ["Mix all ingredients.", "Bake at 180°C for 30 minutes."],
            },
        },
        {
            "name": "3. Boil without water (ERROR)",
            "recipe": {
                "ingredients": ["pasta", "salt", "olive oil", "garlic"],
                "steps": ["Boil the pasta until al dente.", "Drain and toss with oil."],
            },
        },
        {
            "name": "4. Valid recipe (PASS)",
            "recipe": {
                "ingredients": ["chicken", "oil", "garlic", "soy sauce", "water", "rice"],
                "steps": ["Boil rice in water.", "Fry chicken in oil.", "Add soy sauce."],
            },
        },
        {
            "name": "5. Multiple contradictions",
            "recipe": {
                "ingredients": ["flour", "sugar", "salt"],
                "steps": [
                    "Knead the dough.",
                    "Fry until golden.",
                    "Blend until smooth.",
                    "Bake at 200°C.",
                ],
            },
        },
    ]

    for tc in test_cases:
        print(f"--- {tc['name']} ---")
        result = detector.detect(tc["recipe"])
        print(f"Logic Score: {result['logic_score']}")
        print(f"Valid: {'✅' if result['is_valid'] else '❌'}")
        print(f"Actions: {result['actions_detected']}")
        if result["contradictions"]:
            for c in result["contradictions"]:
                icon = "🔴" if c["severity"] == "error" else "🟡"
                print(f"  {icon} {c['message']}")
        else:
            print("  No contradictions found.")
        print()
