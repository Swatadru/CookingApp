import psycopg2
import time
import requests
from datetime import datetime

# ── Credentials ──────────────────────────────────────────────
# Local DB (Where the 1.4M rows currently are)
LOCAL_DB_URL = "postgresql://postgres:12102004@localhost:5432/recipe_generator"

# Supabase REST API (Where we are copying to)
SUPABASE_URL = "https://civqoyhnqqggqzuizvsw.supabase.co"
SUPABASE_KEY = "sb_publishable_fJEgrZuR-Cy7doaDfTiaew_MRoxBD7H"

# The REST API has payload limits, so smaller chunk size is better
CHUNK_SIZE = 1000

def sanitize_data(val):
    if isinstance(val, str):
        return val.replace('\x00', '')
    if isinstance(val, list):
        return [sanitize_data(v) for v in val]
    if isinstance(val, dict):
        return {k: sanitize_data(v) for k, v in val.items()}
    return val

def migrate_data():
    print("Connecting to local database...")
    local_conn = psycopg2.connect(LOCAL_DB_URL)
    local_cur = local_conn.cursor()

    # 2. Get total rows in local
    print("Counting local recipes...")
    local_cur.execute("SELECT COUNT(*) FROM recipes;")
    result = local_cur.fetchone()
    total_rows = result[0] if result else 0
    print(f"Found {total_rows} recipes to migrate.")

    if total_rows == 0:
        print("No recipes in local database! Exiting.")
        return

    print(f"Beginning REST API migration in chunks of {CHUNK_SIZE}...")
    
    offset = 1086000
    start_time = time.time()
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal, resolution=ignore-duplicates"
    }

    while offset < total_rows:
        local_cur.execute(f"""
            SELECT id, title, ingredients, directions, link, source, ner, image, cuisine, category, prep_time, calories, protein, fat, carbs, rating, created_at
            FROM recipes
            ORDER BY id ASC
            LIMIT {CHUNK_SIZE} OFFSET {offset};
        """)
        
        rows = local_cur.fetchall()
        if not rows:
            break
            
        payload = []
        for r in rows:
            # Convert datetime to ISO format string
            created_at = r[16]
            if isinstance(created_at, datetime):
                created_at = created_at.isoformat()
            
            payload.append({
                "id": r[0],
                "title": r[1],
                "ingredients": r[2],
                "directions": r[3],
                "link": r[4],
                "source": r[5],
                "ner": r[6],
                "image": r[7],
                "cuisine": r[8],
                "category": r[9],
                "prep_time": r[10],
                "calories": r[11],
                "protein": r[12],
                "fat": r[13],
                "carbs": r[14],
                "rating": r[15],
                "created_at": created_at
            })
            
        payload = sanitize_data(payload)
            
        try:
            # POST to /rest/v1/recipes
            response = requests.post(f"{SUPABASE_URL}/rest/v1/recipes", headers=headers, json=payload)
            response.raise_for_status()
            
            offset += len(rows)
            elapsed = time.time() - start_time
            print(f"Progress: {offset}/{total_rows} ({round((offset/total_rows)*100, 2)}%) - Elapsed: {round(elapsed, 1)}s")
        except Exception as e:
            print(f"Error on chunk {offset}: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print("Response:", e.response.text)
            break

    print("Migration complete!")
    local_cur.close()
    local_conn.close()

if __name__ == "__main__":
    migrate_data()
