# Sous-Chef AI: Data-Driven Culinary Architecture

Sous-Chef AI is an intelligent, modern web application that combines the power of Generative AI (for recipe synthesis) with factual nutritional databases (for exact dietary tracking). It seamlessly blends a highly responsive Vite/React frontend with a high-performance Python/FastAPI backend powered by Machine Learning.

---

## 🏗️ Architecture & Technologies

### 1. Frontend Technologies
- **Framework:** React 18 with Vite for lightning-fast HMR and building.
- **Routing:** `react-router-dom` for SPA navigation (configured for Vercel deployment).
- **Styling:** Tailwind CSS (PostCSS) with a custom design system featuring glassmorphism, advanced micro-animations, and responsive layouts.
- **API Communication:** Standard `fetch` API proxied through Vite directly to the backend.

### 2. Backend Technologies
- **Framework:** FastAPI (Python) running on Uvicorn, providing high-speed async REST API endpoints.
- **Data Processing:** `pandas` for handling and chunking multi-gigabyte CSV datasets.
- **Machine Learning Engine:** PyTorch & HuggingFace `transformers` and `accelerate`.
- **Dataset Management:** HuggingFace `datasets` library for memory-mapped loading of massive datasets.

### 3. The Datasets
- **RecipeNLG Dataset (2.3GB):** Used for training the generative model. Contains over 2.2 million recipes including ingredients, step-by-step directions, and NER (Named Entity Recognition) parsed ingredient lists.
- **USDA FoodData Central (3.2GB):** Used for factual lookup. Provides highly accurate macronutrient data (Calories, Protein, Fat, Carbs) for hundreds of thousands of base ingredients.

### 4. The Machine Learning Model
- **Base Model:** Google's **T5-Small** (`t5-small`).
- **Architecture:** Sequence-to-Sequence (Encoder-Decoder) Transformer.
- **Why T5?** T5 is explicitly designed to convert one string of text into another. We fine-tune it by providing an input string (`"generate recipe: chicken, lemon"`) and training it to output a highly structured string containing a Title, formatted Ingredients, and cooking Directions.

---

## 📂 Project Folder Structure

```text
Cooking/
│
├── sous-chef-app/                  # VITE / REACT FRONTEND
│   ├── src/
│   │   ├── components/             # Reusable UI elements (Navigation, Sidebar, FeatureGrid)
│   │   ├── pages/                  # Main views (Home, GenerateRecipe, KitchenDashboard, etc.)
│   │   ├── data/                   # Fallback mock data and TypeScript interfaces
│   │   ├── index.css               # Global Tailwind directives & custom CSS animations
│   │   ├── App.tsx                 # Main routing logic
│   │   └── main.tsx                # React DOM entry point
│   ├── vercel.json                 # Vercel deployment configuration for SPA routing
│   ├── vite.config.ts              # Vite config (includes API proxy to localhost:8000)
│   ├── tailwind.config.js          # Tailwind theme and custom color palettes
│   └── package.json                # Node.js dependencies
│
├── backend/                        # PYTHON / FASTAPI BACKEND
│   ├── main.py                     # The FastAPI server (API endpoints)
│   ├── train_model.py              # ML Training pipeline (Fine-tunes T5 on RecipeNLG)
│   ├── process_usda.py             # Data Pipeline (Compresses USDA CSVs to JSON)
│   ├── requirements.txt            # Python dependencies (FastAPI, PyTorch, Transformers)
│   ├── nutrition_lookup.json       # Generated dictionary of factual macros (Created by process_usda.py)
│   └── trained_recipe_model_final/ # The fine-tuned T5 model weights (Created by train_model.py)
│
└── model_training/                 # RAW DATASETS (External/Ignored in Git)
    └── Datasets/
        ├── archive/                # RecipeNLG CSVs
        └── FoodData_Central.../    # USDA Nutrition CSVs
```

---

## 🔄 Step-by-Step Data Flow & Explanation

Here is exactly how the entire system works from end-to-end.

### Phase 1: Data Pre-processing (Offline)
*Goal: Turn 3.2GB of messy CSVs into a fast, factual lookup table.*

1. **The Script (`process_usda.py`):** The USDA dataset is too large to load into memory at once or query live on a small server.
2. **Chunking:** The script uses `pandas` to read the massive `food_nutrient.csv` in chunks of 1,000,000 rows.
3. **Filtering:** It isolates only the data we care about (Calories, Protein, Fat, Carbs) and discards everything else (like specific vitamin weights, obsolete data, etc.).
4. **Output:** It generates a highly compressed `nutrition_lookup.json` file mapping simple ingredient names directly to their exact macros.

### Phase 2: Model Fine-Tuning (Offline)
*Goal: Teach an AI how to cook based on 2.2 million examples.*

1. **The Script (`train_model.py`):** Loads the `t5-small` model and the RecipeNLG dataset using memory mapping.
2. **Data Formatting:** It takes a recipe from the CSV and formats the input to look like `generate recipe: chicken, garlic` and the target to look like `Title: Garlic Chicken | Ingredients: ... | Directions: ...`.
3. **Training Loop:** Using the HuggingFace `Trainer`, it passes batches of these examples to the model. The model guesses the recipe, calculates the loss (how wrong it was), and updates its weights using PyTorch & `accelerate` (Backpropagation).
4. **Output:** A folder called `trained_recipe_model_final` containing the new "brain" of the AI.

### Phase 3: The Live Backend Server
*Goal: Bridge the AI and the website.*

1. **Initialization (`main.py`):** When started, the FastAPI server loads both the `nutrition_lookup.json` and the `trained_recipe_model_final` into active system memory.
2. **Nutrition Endpoint:** If a user requests `/api/nutrition/chicken`, the server instantly performs an O(1) dictionary lookup in the JSON data and returns the exact macros.
3. **Generation Endpoint:** If a user requests `/api/generate-recipe` with ingredients `["salmon", "asparagus"]`:
   - The server tokenizes the input: `generate recipe: salmon, asparagus`.
   - The T5 model performs "inference" (predicting the next best words based on its training).
   - The server parses the generated string back into a JSON object containing the Title, Ingredients array, and Directions.

### Phase 4: The Frontend User Experience
*Goal: Give the user a beautiful interface to interact with the AI.*

1. **User Input (`GenerateRecipe.tsx`):** The user types their ingredients into the UI and clicks "Synthesize".
2. **Proxy Request:** The React app makes a `fetch()` call to `/api/generate-recipe`. In development, Vite intercepts this and proxies it to port 8000 (where the Python server lives).
3. **State Management:** While waiting, the React app shows a custom CSS-animated "Omniscient Synthesis" loading screen.
4. **Display:** When the backend returns the generated recipe, React updates the DOM to display the newly synthesized recipe title, formatted ingredients list, and step-by-step directions to the user.

---

## 🚀 How to Run the Project Locally

### 1. Backend Setup
1. Ensure **Python 3.14** (or higher) is installed.
2. Open a terminal in the `backend/` directory.
3. Install dependencies:
   ```bash
   py -m pip install -r requirements.txt
   ```
4. Build the factual nutrition database:
   ```bash
   py process_usda.py
   ```
5. *(Optional)* Train the AI model (Requires a powerful GPU for the full dataset):
   ```bash
   py train_model.py
   ```
6. Start the API server:
   ```bash
   py -m uvicorn main:app --reload
   ```

### 2. Frontend Setup
1. Open a new terminal in the `sous-chef-app/` directory.
2. Install Node dependencies (if you haven't already):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser. The app is now fully connected to your local AI engine!
