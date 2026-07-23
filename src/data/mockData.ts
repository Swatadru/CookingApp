// ============================================================
// Types
// ============================================================

export interface AllergySwapOption {
  allergen: string;
  original: string;
  substitute: string;
  macroImpact: string;
}

export interface ChemistryMetrics {
  maillardTemp: string;
  phLevel: number;
  emulsionStability: string;
  gelatinizationTemp: string;
  keyFlavors: string[];
}

export interface HeatRequirement {
  cookingMethod: string;
  recommendedVessel: string;
  preheatDuration: string;
  targetInternalTemp: string;
  stovetopSetting: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTime: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  cuisine: string;
  category: string;
  tags: string[];
  image: string;
  ingredients: string[];
  directions: string[];
  rating: number;
  chemistry?: ChemistryMetrics;
  heatRequirement?: HeatRequirement;
  allergySwaps?: AllergySwapOption[];
  chemistry_notes?: string;
}

export interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

// ============================================================
// Navigation
// ============================================================

export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'AI Chatbot', href: '/chat' },
  { label: 'Recipe Book', href: '/recipe-book' },
  { label: 'Profile', href: '/profile' },
];

// ============================================================
// Features (Home page)
// ============================================================

export const features = [
  {
    icon: 'auto_awesome',
    title: 'Instant Synthesis',
    description:
      'Describe your cravings in natural language. Our T5-based model synthesizes a unique recipe from 2.2 million culinary data points in seconds.',
  },
  {
    icon: 'science',
    title: 'Factual Nutrition',
    description:
      'Every macro is sourced from the USDA FoodData Central database — not estimated. Get precise Calories, Protein, Fat, and Carb counts you can trust.',
  },
  {
    icon: 'smart_toy',
    title: 'Interactive Assistant',
    description:
      'Stuck mid-cook? Our contextual troubleshooter chatbot answers recipe-specific questions like substitutions, technique tips, and timing adjustments.',
  },
];

// ============================================================
// Mock Recipes (Recipe Book)
// ============================================================

export const cuisineFilters = [
  'All',
  'Italian',
  'Asian',
  'Mexican',
  'American',
  'Mediterranean',
  'French',
];

export const mockRecipes: Recipe[] = [
  {
    id: 'r1',
    title: 'Saffron Risotto alla Milanese',
    description:
      'A luxurious Italian classic featuring Carnaroli rice in golden saffron-infused broth with aged Parmigiano.',
    prepTime: '35 min',
    calories: 420,
    protein: 12,
    fat: 18,
    carbs: 52,
    cuisine: 'Italian',
    category: 'Dinner',
    tags: ['Vegetarian', 'Comfort Food'],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCFO6pVvgaBXRMUko2Cx51l8bEOdEWpAk151Ckh8a3WbJ7Y2IPrT4AVVohg-uffWeh7B0L7khPhejZESlT_BNU39scGXzCubD2S2MR2LA-wfh5xRPLb6yeC3VSf1VqjDhcdKdCa_JVGGQ9by9tIHhvq6Ku881b8XoZy4SdSV7qqXEkbFmkFasXVaxPVhDTd23Nri9pPzZ2VsGLWHvGRuj8vPlR2CcUgcLRva1e52Cf-MPqO7PKh_-qZAr-7gPxy7lSTWlnkFJK-Biau',
    ingredients: [
      '300g Carnaroli rice',
      '0.5g Saffron threads',
      '1L Vegetable broth',
      '50g Parmigiano Reggiano',
      '1 Onion, finely diced',
      '30g Butter',
      '100ml White wine',
    ],
    directions: [
      'Toast saffron in a dry pan, steep in warm broth for 10 minutes.',
      'Sauté finely diced onion in butter until translucent.',
      'Add rice, toast for 2 minutes until edges become translucent.',
      'Deglaze with white wine, stir until fully absorbed.',
      'Add saffron broth one ladle at a time, stirring constantly for 18 min.',
      'Finish with cold butter and Parmigiano. Rest 2 minutes before serving.',
    ],
    rating: 4.8,
  },
  {
    id: 'r2',
    title: 'Morning Radiance Bowl',
    description:
      'Superfoods meets high-end breakfast culture. Acai, granola, and seasonal fruits.',
    prepTime: '15 min',
    calories: 310,
    protein: 8,
    fat: 12,
    carbs: 45,
    cuisine: 'American',
    category: 'Breakfast',
    tags: ['Vegan', 'High-Fiber'],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBpNOLL90rmwFSrRSLAIX75MmIeSiZGG1qsY2nK64B5LANUyjkJN4uHIH0iyhFHMYTqPsqrjAvXs8KRkbF4XiEuun8AqFluV2yhLrM1xtekDhY0E-1X2R3vSB9-Yy6ZP2tEsaSLJoRanpBKSdYrNryZ6Eg-qp2ZSsQc_EielZDEOovF-FqpiyaQPkNsiI1Le9l45sQa8DWARvM8yc2DH1lmxevJy6KD30slNsZwOrfybBAwkwrWyaZWc8Vn9fyDblie0FGnSux8CNO4',
    ingredients: [
      '200g Frozen acai puree',
      '100g Granola',
      '1 Banana',
      '50g Blueberries',
      '30g Coconut flakes',
      '2 tbsp Honey',
      '50g Strawberries',
    ],
    directions: [
      'Blend acai puree with half the banana until thick and smooth.',
      'Pour into a bowl and arrange toppings artfully.',
      'Layer granola, sliced fruits, and coconut flakes.',
      'Drizzle with honey and serve immediately.',
    ],
    rating: 4.6,
  },
  {
    id: 'r3',
    title: 'Wild Mushroom Tart',
    description:
      'Delicate buttery crust with rich duxelles topped with hand-picked chanterelles and thyme.',
    prepTime: '50 min',
    calories: 380,
    protein: 9,
    fat: 24,
    carbs: 35,
    cuisine: 'French',
    category: 'Appetizer',
    tags: ['Vegetarian', 'Seasonal'],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB8O3dbV9Tpgkn7NvC4nVSXecGPaJBTTBc2RKDpE9RjM2atoPirgVmPm9Z9kHlLztlmn4hfsV5J7qbXDXCU12gafyQvxJE1QeBFWDw3gCdmqFpl6aBXYHlpLdEONLDlkZCK7M7mvNdUa93UT8qR1I_VspZxHHQ8YtPIrhcSer6WKI6yZLzf6m33K0v-HCbNyJpwHa2g3DJ0A7UA9e7dYxYa0UZhszRAPMX1VjHt16kpMeQrBZsp0EKgs-v2mtThSbBa9RpLvQqLiNEd',
    ingredients: [
      '1 Puff pastry sheet',
      '300g Mixed wild mushrooms',
      '2 Shallots',
      '3 sprigs Fresh thyme',
      '30g Butter',
      '100ml Crème fraîche',
      'Salt & pepper to taste',
    ],
    directions: [
      'Preheat oven to 200°C. Roll out puff pastry and dock with a fork.',
      'Sauté shallots in butter until soft, add sliced mushrooms.',
      'Cook until moisture evaporates, season with thyme, salt, and pepper.',
      'Spread mushroom mixture on pastry, leave a 2cm border.',
      'Fold edges inward, brush with egg wash.',
      'Bake for 25 minutes until golden. Dollop crème fraîche to serve.',
    ],
    rating: 4.7,
  },
  {
    id: 'r4',
    title: 'Braised Short Ribs',
    description:
      'Fall-off-the-bone tender beef short ribs slow-braised in a rich red wine reduction.',
    prepTime: '3 hrs',
    calories: 580,
    protein: 42,
    fat: 35,
    carbs: 18,
    cuisine: 'American',
    category: 'Dinner',
    tags: ['High-Protein', 'Comfort Food'],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBqFCmrg_B9wMgymNRgJOXIOfFVk_6defchY4RvPRV5cVzWsrI5c9P3Lbtm78Y4_P5EbOx2BW62PQvs4iusr5zAYoQYt_nizCxSe0Nbk7U77qLBobGDeuyLVYk2vz2_T86KPJztwB958JzsypIaUo1QOHL7SIIkIRLA4bAIdxJ7hZwvCnoaTkyYHyVFI4yU0OiAkPo7FHJ456PRhp0NJZzKCO6HeW_gp9qAe7NnEijcoy_W55W6twnlL9VM-YhMMDo9UzXs1qqIYnd7',
    ingredients: [
      '1.5kg Beef short ribs',
      '500ml Red wine',
      '2 Carrots',
      '2 Celery stalks',
      '1 Onion',
      '4 cloves Garlic',
      '2 tbsp Tomato paste',
      '500ml Beef stock',
    ],
    directions: [
      'Season ribs generously with salt and pepper. Sear on all sides.',
      'Remove ribs. Sauté mirepoix until caramelized.',
      'Add garlic and tomato paste, cook for 2 minutes.',
      'Deglaze with red wine, scraping fond from the bottom.',
      'Return ribs, add stock. Cover and braise at 160°C for 2.5 hours.',
      'Remove lid for final 30 min to reduce and glaze the ribs.',
    ],
    rating: 4.9,
  },
  {
    id: 'r5',
    title: 'Lava Cake AI-X',
    description:
      'A precisely engineered molten chocolate cake with a liquid ganache center.',
    prepTime: '25 min',
    calories: 480,
    protein: 6,
    fat: 28,
    carbs: 52,
    cuisine: 'French',
    category: 'Dessert',
    tags: ['Indulgent', 'Date Night'],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDDL2qk_BfPLxgZALT2jxWjpJw4pGS5HRctHMlWrmqIMIOuuIgzWL4zF1NbkJusEO71RXhO_EangMT4z1sVLSilrnpLmP9EzqAXCqflIweQ0R-3zm-dldWFa-Ux9Ighzx-6LxM_O7_ikWBgEeX2dL8wydmCzFfCLJL7wxKZE_8I9KLDJqvyUMXaClIffWm5cfHAz5yMfkGptwZUdjULQPIa_VKExoaWPpYhJxg8fPaxktanWTT_lAWqaOhD0n_Zp4Zv6KNzr8g6uX6o',
    ingredients: [
      '200g Dark chocolate (70%)',
      '100g Butter',
      '2 Eggs + 2 Yolks',
      '80g Sugar',
      '40g Flour',
      '1 tsp Vanilla extract',
      'Pinch of sea salt',
    ],
    directions: [
      'Melt chocolate and butter together. Let cool slightly.',
      'Whisk eggs, yolks, and sugar until pale and fluffy.',
      'Fold chocolate mixture into egg mixture gently.',
      'Sift in flour, add vanilla and salt. Fold until just combined.',
      'Pour into greased ramekins. Bake at 220°C for exactly 12 min.',
      'Invert onto plates immediately. Center should flow when broken.',
    ],
    rating: 4.9,
  },
  {
    id: 'r6',
    title: 'Zen Garden Bowl',
    description:
      'A harmonious Japanese-inspired grain bowl with pickled veg, tofu, and miso tahini.',
    prepTime: '30 min',
    calories: 350,
    protein: 18,
    fat: 14,
    carbs: 42,
    cuisine: 'Asian',
    category: 'Lunch',
    tags: ['Vegan', 'Healthy'],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB-PEPw8FQpcIqS4_eXL9Q1MOoSSupqXTQpcM-DXzI3AGXUk1Ao_R1D8qvIOSe27yAjxuDmHdFNFn5f06ifEZWXAHQUSEUp_uqYcmpDO3yGcrBFkQhqB7xAZOscfQXqk9g9xMK2ZtvGy53fvepeFt-b9wg64c3iAg0Wtai9jKyOrbmqpdV6mIFR6UvDK2R6R77D5anQz0TeTXcV8QhjOX9emO6KernP2ekJU7rvogB0-tp7MFxMO-O2gN2K_jfkPwdIfHYbOm8GyMgi',
    ingredients: [
      '200g Sushi rice',
      '150g Firm tofu',
      '100g Edamame',
      '1 Avocado',
      '100g Pickled radish',
      '2 tbsp White miso',
      '1 tbsp Tahini',
      '1 tbsp Rice vinegar',
    ],
    directions: [
      'Cook sushi rice and season with rice vinegar.',
      'Press and cube tofu, pan-fry until golden on all sides.',
      'Whisk miso, tahini, and warm water into a smooth dressing.',
      'Arrange rice in bowl, top with tofu, edamame, avocado, pickled radish.',
      'Drizzle with miso tahini dressing. Garnish with sesame seeds.',
    ],
    rating: 4.5,
  },
  {
    id: 'r7',
    title: 'Chicken Tacos al Pastor',
    description:
      'Smoky, sweet, and tangy — marinated chicken with pineapple salsa on corn tortillas.',
    prepTime: '40 min',
    calories: 410,
    protein: 32,
    fat: 16,
    carbs: 38,
    cuisine: 'Mexican',
    category: 'Dinner',
    tags: ['High-Protein', 'Spicy'],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCe0AD34aGqd6r8D8xiDCvgetSz6Mey7g8xX66LOKCsQtj40wmuqU7w_tMRM2nEqQzMPn_nXiQssADv1xm3CeWPQNaR9Bzz3XOXN0MKUqZECCoKP2XCh2UPPRbHWZ8y1Xd0j7Uu4ScmTRxAx-ebOx0VaND0MmjmVZ7MBO7NcgkjrN4A5RvGSCUyfkcD2NnWGoY6-H8BdJU7ST0h9xcBinylT7djF3V2_cz5xkzY95H4rGbRQoQ_o96vNd-tDEEMMiZCe_Cv-wsVm4K_',
    ingredients: [
      '500g Chicken thighs',
      '3 Dried guajillo chiles',
      '200g Pineapple',
      '8 Corn tortillas',
      '1 White onion',
      '1 bunch Cilantro',
      '2 Limes',
      '2 cloves Garlic',
    ],
    directions: [
      'Rehydrate chiles in hot water for 15 minutes.',
      'Blend chiles with garlic, pineapple juice, and spices into a marinade.',
      'Marinate chicken for at least 30 minutes.',
      'Grill or pan-sear chicken until charred and cooked through.',
      'Dice pineapple and grill until caramelized.',
      'Slice chicken, serve on warm tortillas with pineapple, onion, cilantro, lime.',
    ],
    rating: 4.7,
  },
  {
    id: 'r8',
    title: 'Mediterranean Grilled Sea Bass',
    description:
      'Whole sea bass with lemon, olives, capers, and cherry tomatoes over herbed couscous.',
    prepTime: '45 min',
    calories: 390,
    protein: 36,
    fat: 18,
    carbs: 22,
    cuisine: 'Mediterranean',
    category: 'Dinner',
    tags: ['Gluten-Free', 'Healthy'],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAQBKUMIREti4HiLvshGZavZ8fnipclV8Hqv7Jf_ympGE1xGIew88f8l7s3z4vVNppOBzBJSUBTX3Wlz56uCgKh8Eir6qPxE6IgZq4vhxkuIYFIFF-GxtHx1whuNKo4cDHIPGK8iV0VmtzelHLuwsrPuf3fzbiGiWtib7HVDKhia2OFMpmz3ecqHZWih8vfGt87yKSTNdvOMcRrWSo7nYKJCNkjhaHeHnRBcJqMwOUl8l5rCS8zHvvibgeBg_GcHg0-YqK6n_905fuC',
    ingredients: [
      '1 Whole sea bass (600g)',
      '200g Cherry tomatoes',
      '50g Kalamata olives',
      '2 tbsp Capers',
      '2 Lemons',
      '200g Couscous',
      '3 tbsp Olive oil',
      'Fresh oregano and parsley',
    ],
    directions: [
      'Score sea bass and stuff with lemon slices and herbs.',
      'Season generously with olive oil, salt, and pepper.',
      'Grill over medium-high heat for 6-7 minutes per side.',
      'Halve tomatoes, combine with olives, capers, and olive oil.',
      'Prepare couscous with lemon zest and fresh herbs.',
      'Serve fish over couscous, topped with the tomato-olive relish.',
    ],
    rating: 4.6,
  },
  {
    id: 'r9',
    title: 'Pad Thai Classique',
    description:
      'Authentic Thai rice noodles with tamarind sauce, shrimp, peanuts and bean sprouts.',
    prepTime: '25 min',
    calories: 440,
    protein: 22,
    fat: 16,
    carbs: 54,
    cuisine: 'Asian',
    category: 'Dinner',
    tags: ['Quick', 'Crowd Pleaser'],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDUxFKGRwXOGYoDCFiwR3S2-euCrx9gUnzhAgCFx4S4aA680QnPU8OpG4LxO02NHBdiEwSy35X4ELswd_NGEw-YCvgx3LJP7MKAJX4J57XZkJERGmXTkwxi50_fbu6InYSQ81h1QTGRqZa6WFy938nvcQLU-nJat2zbyR1K4TcvvrtuSMoIhlUxHIK1uIwUacLdGQt_AjFwzY65qektbwN9-nd5ykeNmCF8EIiFzfSEhs5kkgO0rj50gWW3v2gvhMENeuKqC7Db19VU',
    ingredients: [
      '200g Rice noodles',
      '200g Shrimp',
      '2 Eggs',
      '100g Bean sprouts',
      '3 tbsp Tamarind paste',
      '2 tbsp Fish sauce',
      '50g Crushed peanuts',
      '2 Limes',
      '3 Green onions',
    ],
    directions: [
      'Soak rice noodles in warm water for 20 minutes. Drain.',
      'Mix tamarind paste, fish sauce, and sugar into pad thai sauce.',
      'Stir-fry shrimp in hot wok until pink. Set aside.',
      'Scramble eggs in the same wok.',
      'Add noodles and sauce, toss vigorously for 2 minutes.',
      'Return shrimp, add bean sprouts. Serve with peanuts, lime, green onions.',
    ],
    rating: 4.5,
  },
];

// ============================================================
// Mock Generated Recipe (for /generate fallback)
// ============================================================

export const mockGeneratedRecipe = {
  title: 'Lemon-Herb Chicken with Wilted Spinach',
  image:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCe0AD34aGqd6r8D8xiDCvgetSz6Mey7g8xX66LOKCsQtj40wmuqU7w_tMRM2nEqQzMPn_nXiQssADv1xm3CeWPQNaR9Bzz3XOXN0MKUqZECCoKP2XCh2UPPRbHWZ8y1Xd0j7Uu4ScmTRxAx-ebOx0VaND0MmjmVZ7MBO7NcgkjrN4A5RvGSCUyfkcD2NnWGoY6-H8BdJU7ST0h9xcBinylT7djF3V2_cz5xkzY95H4rGbRQoQ_o96vNd-tDEEMMiZCe_Cv-wsVm4K_',
  calories: 380,
  protein: 42,
  fat: 16,
  carbs: 12,
  ingredients: [
    '2 Chicken breasts (boneless, skinless)',
    '200g Fresh spinach',
    '2 Lemons (zest and juice)',
    '4 cloves Garlic, minced',
    '2 tbsp Olive oil',
    '1 tsp Dried oregano',
    '1 tsp Smoked paprika',
    'Salt & freshly ground pepper',
  ],
  directions: [
    'Pat chicken dry and season with oregano, paprika, salt, pepper, and half the lemon zest.',
    'Heat olive oil in a cast-iron skillet over medium-high heat.',
    'Sear chicken for 5-6 minutes per side until golden and internal temp reaches 74°C.',
    'Remove chicken and rest for 5 minutes.',
    'In the same pan, sauté garlic for 30 seconds until fragrant.',
    'Add spinach, toss until just wilted (about 2 minutes).',
    'Squeeze remaining lemon juice over spinach and chicken.',
    'Slice chicken, serve over wilted spinach with lemon wedges.',
  ],
};

// ============================================================
// Troubleshooter AI Responses
// ============================================================

export const troubleshooterResponses: {
  keywords: string[];
  response: string;
}[] = [
  {
    keywords: ['substitute', 'replace', 'swap', 'instead', 'alternative'],
    response:
      'Great question! Here are some common substitutions:\n\n• **Butter** → Olive oil or coconut oil (1:1)\n• **Heavy cream** → Coconut cream or cashew cream\n• **Eggs** → Flax eggs (1 tbsp ground flax + 3 tbsp water per egg)\n• **Flour** → Almond flour or oat flour for gluten-free\n\nWould you like a specific substitution for this recipe?',
  },
  {
    keywords: ['oven', 'bake', 'temperature', 'temp', 'degrees'],
    response:
      'For this recipe, here are oven tips:\n\n🌡️ **Conventional oven:** Use the listed temperature\n🌡️ **Convection/Fan:** Reduce by 20°C (25°F)\n🌡️ **No oven?** You can adapt using a Dutch oven on the stovetop at low heat with a tight lid.\n\nAlways use an instant-read thermometer for proteins!',
  },
  {
    keywords: ['time', 'long', 'faster', 'quick', 'speed', 'minutes'],
    response:
      'Time-saving tips for this recipe:\n\n⏱️ **Prep ahead:** Dice all vegetables and measure ingredients first\n⏱️ **Parallel cooking:** Start your side while the main protein rests\n⏱️ **Pressure cooker:** Can reduce braising/stewing times by up to 60%\n⏱️ **Thinner cuts:** Butterfly thick proteins for faster, more even cooking',
  },
  {
    keywords: ['spicy', 'heat', 'hot', 'mild', 'pepper', 'chili'],
    response:
      'To adjust heat level:\n\n🌶️ **More heat:** Add red pepper flakes, fresh jalapeños, or cayenne\n🌶️ **Less heat:** Remove seeds from peppers, reduce chili amounts by half\n🌶️ **Balance:** Add honey, sugar, or cream to temper spiciness\n🌶️ **Smoky:** Use chipotle in adobo instead of fresh chiles',
  },
  {
    keywords: ['serve', 'pair', 'side', 'with', 'alongside', 'wine'],
    response:
      'Pairing suggestions for this dish:\n\n🍷 **Wine:** A medium-bodied white or light red\n🥗 **Salad:** Simple arugula with lemon vinaigrette\n🍞 **Bread:** Crusty sourdough or warm naan\n🍚 **Grain:** Fluffy jasmine rice or herbed couscous',
  },
  {
    keywords: ['store', 'leftover', 'save', 'freeze', 'reheat', 'keep'],
    response:
      'Storage & reheating tips:\n\n📦 **Refrigerate:** Up to 3-4 days in an airtight container\n❄️ **Freeze:** Most cooked dishes freeze well for up to 3 months\n♨️ **Reheat:** Low and slow in oven (160°C) or stovetop with a splash of broth\n⚠️ **Avoid:** Microwaving delicate proteins — they dry out',
  },
];

// ============================================================
// Legacy Exports (backward compatibility for unused components)
// ============================================================

export const heroContent = {
  titleStart: 'Meet Your',
  titleHighlight: 'AI Sous-Chef',
  description:
    'The precision of a professional kitchen meets the intuition of digital intelligence. Craft recipes that transcend ingredients, guided by an omniscient companion that understands your palate and your pantry.',
  buttons: [
    { label: 'Generate Recipe', primary: true },
    { label: 'Explore Recipe Book', primary: false },
  ],
  image: {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQBKUMIREti4HiLvshGZavZ8fnipclV8Hqv7Jf_ympGE1xGIew88f8l7s3z4vVNppOBzBJSUBTX3Wlz56uCgKh8Eir6qPxE6IgZq4vhxkuIYFIFF-GxtHx1whuNKo4cDHIPGK8iV0VmtzelHLuwsrPuf3fzbiGiWtib7HVDKhia2OFMpmz3ecqHZWih8vfGt87yKSTNdvOMcRrWSo7nYKJCNkjhaHeHnRBcJqMwOUl8l5rCS8zHvvibgeBg_GcHg0-YqK6n_905fuC',
    alt: 'Cinematic Kitchen Setup',
  },
  aiSuggestion: 'AI is suggesting: Saffron Risotto with Crispy Sage',
};

export const inspirationContent = {
  tag: 'Recipe of the Day',
  quote:
    '"Today\'s craving might become tomorrow\'s family tradition."',
  image: {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUxFKGRwXOGYoDCFiwR3S2-euCrx9gUnzhAgCFx4S4aA680QnPU8OpG4LxO02NHBdiEwSy35X4ELswd_NGEw-YCvgx3LJP7MKAJX4J57XZkJERGmXTkwxi50_fbu6InYSQ81h1QTGRqZa6WFy938nvcQLU-nJat2zbyR1K4TcvvrtuSMoIhlUxHIK1uIwUacLdGQt_AjFwzY65qektbwN9-nd5ykeNmCF8EIiFzfSEhs5kkgO0rj50gWW3v2gvhMENeuKqC7Db19VU',
    alt: 'Featured Recipe',
  },
  time: '45m',
  calories: '320 kcal',
};

export const chatHistory = [
  {
    role: 'ai',
    text: 'Welcome back! I noticed you have some wild mushrooms and thyme. Shall we try a Creamy Forest Risotto tonight?',
  },
  {
    role: 'user',
    text: 'That sounds perfect. Do I have enough arborio rice?',
  },
];
