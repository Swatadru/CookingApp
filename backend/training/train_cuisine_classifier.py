"""
train_cuisine_classifier.py
===========================
Train an XGBoost cuisine classifier using TF-IDF vectorized ingredient text.

Changes from baseline:
    - Uses 'multi:softprob' objective (probability output per class)
    - Increased n_estimators to 500 with early stopping
    - Added class weight balancing for imbalanced cuisine distribution
    - Saves training metadata (accuracy, class report) alongside model

Outputs (in backend/models/):
    - cuisine_classifier.pkl       : Trained XGBoost model
    - cuisine_vectorizer.pkl       : Fitted TF-IDF vectorizer
    - cuisine_label_encoder.pkl    : Label encoder (string ↔ int)
    - cuisine_training_meta.pkl    : Training metadata (accuracy, report, etc.)
"""

import sys
import time

sys.stdout.reconfigure(encoding="utf-8")

import numpy as np
import pandas as pd
import joblib
from pathlib import Path
from typing import Dict, Any

# Scikit Learn
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import LabelEncoder

# XGBoost
from xgboost import XGBClassifier


# =========================================================
# LOAD DATASET
# =========================================================

DATA_PATH = (
    Path(__file__).parent.parent
    / "processed_data"
    / "cleaned_cuisine_data.csv"
)

df = pd.read_csv(DATA_PATH)

print(f"Dataset Loaded: {len(df):,} samples")
print(f"Cuisines: {df['cuisine'].nunique()} classes\n")


# =========================================================
# INPUT + OUTPUT
# =========================================================

X = df["ingredients"]
y = df["cuisine"]


# =========================================================
# LABEL ENCODING
# XGBoost needs numeric labels
# =========================================================

print("Encoding cuisine labels...")

label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

print(f"Classes: {list(label_encoder.classes_)}")
print(f"Encoding Complete — {len(label_encoder.classes_)} classes\n")


# =========================================================
# TRAIN TEST SPLIT
# Use stratify for class imbalance
# =========================================================

print("Splitting dataset...")

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y_encoded,
    test_size=0.2,
    random_state=42,
    stratify=y_encoded,
)

print(f"Train Samples: {len(X_train):,}")
print(f"Test  Samples: {len(X_test):,}\n")


# =========================================================
# TF-IDF VECTORIZATION
# Use bi-grams (important for food ingredients)
# =========================================================

print("Vectorizing text...")

vectorizer = TfidfVectorizer(
    max_features=15_000,
    ngram_range=(1, 2),
    stop_words="english",
    sublinear_tf=True,
    min_df=2,
    max_df=0.90,
    dtype=np.float32,
)

X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

print(f"Vocabulary Size: {len(vectorizer.vocabulary_):,}")
print(f"Matrix Shape: {X_train_vec.shape}")
print("Vectorization Done\n")


# =========================================================
# CLASS WEIGHT BALANCING (sqrt-balanced)
# Full "balanced" weighting is too aggressive for 128:1 ratio.
# sqrt-balanced gives moderate uplift to minority classes.
# =========================================================

from collections import Counter

class_counts = Counter(y_train)
max_count = max(class_counts.values())

# sqrt(max_count / class_count) gives moderate weights
# South Asian: 1.0, Chinese: ~11x, Mexican: ~10x, etc.
sample_weights = np.array([
    np.sqrt(max_count / class_counts[label])
    for label in y_train
], dtype=np.float32)

print("Class weights (sqrt-balanced):")
for cls_idx in sorted(class_counts.keys()):
    cls_name = label_encoder.inverse_transform([cls_idx])[0]
    weight = np.sqrt(max_count / class_counts[cls_idx])
    print(f"  {cls_name:15s}: count={class_counts[cls_idx]:5d}  weight={weight:.2f}")
print()


# =========================================================
# XGBOOST MODEL
# Using softprob for probability outputs
# =========================================================

print("Initializing XGBoost model...")

num_classes = len(label_encoder.classes_)

model = XGBClassifier(
    n_estimators=500,
    max_depth=8,
    learning_rate=0.1,
    objective="multi:softprob",
    num_class=num_classes,
    random_state=42,
    eval_metric="mlogloss",
    early_stopping_rounds=20,
    missing=0.0,
    verbosity=1,
)


# =========================================================
# TRAIN MODEL
# =========================================================

print("Training Started...\n")

t0 = time.time()

model.fit(
    X_train_vec,
    y_train,
    sample_weight=sample_weights,
    eval_set=[(X_test_vec, y_test)],
    verbose=50,
)

train_time = time.time() - t0

print(f"\nTraining Complete — {train_time:.1f}s")
print(f"Best iteration: {model.best_iteration}\n")


# =========================================================
# EVALUATION
# =========================================================

print("Evaluating model...")

# Probability predictions
y_proba = model.predict_proba(X_test_vec)

# Hard predictions (argmax)
predictions = np.argmax(y_proba, axis=1)

accuracy = accuracy_score(y_test, predictions)

print(f"\n{'=' * 50}")
print(f"FINAL ACCURACY: {accuracy:.4f} ({accuracy * 100:.2f}%)")
print(f"{'=' * 50}\n")


# Convert numeric labels back to original labels
decoded_y_test = label_encoder.inverse_transform(y_test)
decoded_predictions = label_encoder.inverse_transform(predictions)


print("Classification Report:\n")

report_str = classification_report(
    decoded_y_test,
    decoded_predictions,
    zero_division=0,
)

print(report_str)

# Also get report as dict for metadata
report_dict: Dict[str, Any] = classification_report(
    decoded_y_test,
    decoded_predictions,
    zero_division=0,
    output_dict=True,
)


# =========================================================
# CONFIDENCE ANALYSIS
# =========================================================

print("\nConfidence Analysis:")
print("-" * 40)

max_probs = np.max(y_proba, axis=1)
print(f"  Mean confidence:   {np.mean(max_probs):.4f}")
print(f"  Median confidence: {np.median(max_probs):.4f}")
print(f"  Min confidence:    {np.min(max_probs):.4f}")
print(f"  >90% confident:   {np.sum(max_probs > 0.9) / len(max_probs) * 100:.1f}%")
print(f"  >80% confident:   {np.sum(max_probs > 0.8) / len(max_probs) * 100:.1f}%")
print(f"  <50% confident:   {np.sum(max_probs < 0.5) / len(max_probs) * 100:.1f}%")


# =========================================================
# SAVE MODEL + ARTIFACTS
# =========================================================

SAVE_FOLDER = Path(__file__).parent.parent / "models"
SAVE_FOLDER.mkdir(exist_ok=True)

print(f"\nSaving model files to: {SAVE_FOLDER}")


# Save XGBoost model
joblib.dump(model, SAVE_FOLDER / "cuisine_classifier.pkl")
print("  ✓ cuisine_classifier.pkl")

# Save TF-IDF vectorizer
joblib.dump(vectorizer, SAVE_FOLDER / "cuisine_vectorizer.pkl")
print("  ✓ cuisine_vectorizer.pkl")

# Save label encoder
joblib.dump(label_encoder, SAVE_FOLDER / "cuisine_label_encoder.pkl")
print("  ✓ cuisine_label_encoder.pkl")

# Save training metadata
training_meta: Dict[str, Any] = {
    "accuracy": float(accuracy),
    "num_classes": num_classes,
    "classes": list(label_encoder.classes_),
    "train_samples": len(X_train),
    "test_samples": len(X_test),
    "best_iteration": int(model.best_iteration),
    "train_time_seconds": round(train_time, 1),
    "vocabulary_size": len(vectorizer.vocabulary_),
    "report": report_dict,
    "confidence_stats": {
        "mean": float(np.mean(max_probs)),
        "median": float(np.median(max_probs)),
        "min": float(np.min(max_probs)),
        "pct_above_90": float(np.sum(max_probs > 0.9) / len(max_probs)),
        "pct_above_80": float(np.sum(max_probs > 0.8) / len(max_probs)),
    },
}

joblib.dump(training_meta, SAVE_FOLDER / "cuisine_training_meta.pkl")
print("  ✓ cuisine_training_meta.pkl")


print(f"\n{'=' * 50}")
print(f"  TRAINING PIPELINE COMPLETE")
print(f"  Accuracy: {accuracy:.4f}")
print(f"  Classes:  {num_classes}")
print(f"{'=' * 50}")