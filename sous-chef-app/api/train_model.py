import os
import ast
import torch
from datasets import load_dataset
from transformers import T5Tokenizer, T5ForConditionalGeneration, Trainer, TrainingArguments

def format_recipe(example):
    """
    Format the RecipeNLG dataset for Sequence-to-Sequence training.
    Input: "generate recipe: chicken, lemon, thyme"
    Target: "Title: Lemon Chicken | Ingredients: 1 lb chicken... | Directions: Bake at 350..."
    """
    try:
        # NER contains the raw ingredients like ["chicken", "lemon"]
        ingredients_list = ast.literal_eval(example['NER'])
        input_text = f"generate recipe: {', '.join(ingredients_list)}"
        
        # Target needs Title, actual Ingredients (with measurements), and Directions
        title = example['title']
        measurements = ast.literal_eval(example['ingredients'])
        directions = ast.literal_eval(example['directions'])
        
        target_text = f"Title: {title} | Ingredients: {', '.join(measurements)} | Directions: {' '.join(directions)}"
    except Exception:
        # Fallback if parsing fails
        input_text = "generate recipe: unknown"
        target_text = "Title: Unknown | Ingredients: | Directions:"
        
    return {"input_text": input_text, "target_text": target_text}

def tokenize_function(examples, tokenizer, max_input_length=128, max_target_length=512):
    model_inputs = tokenizer(
        examples["input_text"], 
        max_length=max_input_length, 
        truncation=True, 
        padding="max_length"
    )
    
    # Tokenize targets
    labels = tokenizer(
        examples["target_text"], 
        max_length=max_target_length, 
        truncation=True, 
        padding="max_length"
    )
    
    model_inputs["labels"] = labels["input_ids"]
    return model_inputs

def main():
    print("Loading tokenizer and model...")
    model_name = "t5-small"
    tokenizer = T5Tokenizer.from_pretrained(model_name)
    model = T5ForConditionalGeneration.from_pretrained(model_name)

    print("Loading dataset (this uses memory-mapping so it's fast)...")
    # Path to your massive RecipeNLG dataset
    dataset_path = "../model_training/Datasets/archive/RecipeNLG_dataset.csv"
    
    # Load dataset. We take a subset for demonstration/faster local training.
    # To train on the FULL dataset, remove the 'split' argument, but be prepared for a long training time!
    dataset = load_dataset("csv", data_files=dataset_path, split="train[:50000]")
    
    # Split into train and evaluation
    dataset = dataset.train_test_split(test_size=0.1)

    print("Formatting and tokenizing data...")
    dataset = dataset.map(format_recipe)
    tokenized_datasets = dataset.map(
        lambda x: tokenize_function(x, tokenizer), 
        batched=True, 
        remove_columns=dataset["train"].column_names
    )

    # Define training arguments
    training_args = TrainingArguments(
        output_dir="./trained_recipe_model",
        eval_strategy="epoch",
        learning_rate=2e-5,
        per_device_train_batch_size=8,
        per_device_eval_batch_size=8,
        weight_decay=0.01,
        save_total_limit=2,
        num_train_epochs=3,
        fp16=torch.cuda.is_available(), # Use mixed precision if GPU is available
    )

    # Initialize Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_datasets["train"],
        eval_dataset=tokenized_datasets["test"],
        processing_class=tokenizer,
    )

    print("Starting training...")
    trainer.train()

    print("Saving final model...")
    trainer.save_model("./trained_recipe_model_final")
    tokenizer.save_pretrained("./trained_recipe_model_final")
    print("Training complete! Model saved to ./trained_recipe_model_final")

if __name__ == "__main__":
    main()
