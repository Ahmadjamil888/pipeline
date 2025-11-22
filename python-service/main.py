"""
Pipeline AI - Python Training Service
Real PyTorch model training and HuggingFace deployment
"""

from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import torch
from transformers import (
    AutoTokenizer, 
    AutoModelForSequenceClassification,
    TrainingArguments, 
    Trainer,
    DataCollatorWithPadding
)
from datasets import load_dataset, Dataset
from huggingface_hub import HfApi, login
import os
import json
from datetime import datetime
import asyncio

app = FastAPI(title="Pipeline AI Training Service")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Training job storage
training_jobs = {}

class TrainingRequest(BaseModel):
    model_id: str
    model_name: str
    creation_mode: str  # 'fine-tune' or 'from-scratch'
    training_mode: str  # 'supervised', 'unsupervised', 'reinforcement'
    model_description: Optional[str] = None  # AI prompt for from-scratch
    model_type: str
    task_type: str
    target_class: Optional[str] = None
    dataset_source: str
    dataset_name: Optional[str] = None
    base_model: Optional[str] = None
    compute_type: str  # 'cpu', 'gpu', 'tpu'
    epochs: int = 3
    batch_size: int = 8
    learning_rate: float = 2e-5
    hf_token: str
    groq_api_key: Optional[str] = None

class TrainingStatus(BaseModel):
    model_id: str
    status: str
    progress: float
    current_epoch: int
    total_epochs: int
    metrics: Dict[str, Any]
    logs: List[str]

@app.get("/")
async def root():
    return {"message": "Pipeline AI Training Service", "status": "running"}

@app.post("/train")
async def start_training(request: TrainingRequest, background_tasks: BackgroundTasks):
    """Start real PyTorch model training"""
    
    # Initialize training job
    training_jobs[request.model_id] = {
        "status": "initializing",
        "progress": 0,
        "current_epoch": 0,
        "total_epochs": request.epochs,
        "metrics": {},
        "logs": []
    }
    
    # Start training in background
    background_tasks.add_task(train_model, request)
    
    return {
        "success": True,
        "model_id": request.model_id,
        "message": "Training started"
    }

@app.get("/status/{model_id}")
async def get_training_status(model_id: str):
    """Get training status"""
    if model_id not in training_jobs:
        raise HTTPException(status_code=404, detail="Training job not found")
    
    return training_jobs[model_id]

async def train_model(request: TrainingRequest):
    """Real PyTorch model training with HuggingFace integration"""
    
    model_id = request.model_id
    
    try:
        # Update status
        training_jobs[model_id]["status"] = "analyzing"
        training_jobs[model_id]["logs"].append("Analyzing dataset and model requirements...")
        
        # If from-scratch with AI description, analyze it
        if request.creation_mode == "from-scratch" and request.model_description:
            await analyze_model_description(request, model_id)
        
        # Login to HuggingFace
        login(token=request.hf_token)
        
        # Load dataset
        training_jobs[model_id]["status"] = "loading_dataset"
        training_jobs[model_id]["logs"].append(f"Loading dataset: {request.dataset_name}")
        
        dataset = await load_training_dataset(request)
        
        # Load or create model
        training_jobs[model_id]["status"] = "preparing_model"
        training_jobs[model_id]["logs"].append("Preparing model and tokenizer...")
        
        if request.creation_mode == "fine-tune" and request.base_model:
            # Fine-tune existing model
            model_name = request.base_model
            tokenizer = AutoTokenizer.from_pretrained(model_name)
            model = AutoModelForSequenceClassification.from_pretrained(
                model_name,
                num_labels=2  # Adjust based on task
            )
        else:
            # Create from scratch
            model_name = "distilbert-base-uncased"  # Base architecture
            tokenizer = AutoTokenizer.from_pretrained(model_name)
            model = AutoModelForSequenceClassification.from_pretrained(
                model_name,
                num_labels=2
            )
        
        # Tokenize dataset
        def tokenize_function(examples):
            return tokenizer(examples["text"], padding="max_length", truncation=True)
        
        tokenized_dataset = dataset.map(tokenize_function, batched=True)
        
        # Split dataset
        train_test = tokenized_dataset.train_test_split(test_size=0.2)
        train_dataset = train_test["train"]
        eval_dataset = train_test["test"]
        
        # Set up device
        device = "cuda" if request.compute_type == "gpu" and torch.cuda.is_available() else "cpu"
        model.to(device)
        
        # Create HuggingFace repo name
        hf_repo_name = f"{request.model_name.lower().replace(' ', '-')}-{int(datetime.now().timestamp())}"
        
        # Training arguments with push_to_hub
        training_args = TrainingArguments(
            output_dir=f"./models/{model_id}",
            num_train_epochs=request.epochs,
            per_device_train_batch_size=request.batch_size,
            per_device_eval_batch_size=request.batch_size,
            learning_rate=request.learning_rate,
            evaluation_strategy="epoch",
            save_strategy="epoch",
            load_best_model_at_end=True,
            push_to_hub=True,
            hub_model_id=hf_repo_name,
            hub_token=request.hf_token,
            logging_steps=10,
            logging_dir=f"./logs/{model_id}",
            report_to="none",
            fp16=device == "cuda",
        )
        
        # Data collator
        data_collator = DataCollatorWithPadding(tokenizer=tokenizer)
        
        # Metrics
        def compute_metrics(eval_pred):
            predictions, labels = eval_pred
            predictions = predictions.argmax(axis=-1)
            accuracy = (predictions == labels).mean()
            return {"accuracy": float(accuracy)}
        
        # Initialize Trainer
        trainer = Trainer(
            model=model,
            args=training_args,
            train_dataset=train_dataset,
            eval_dataset=eval_dataset,
            tokenizer=tokenizer,
            data_collator=data_collator,
            compute_metrics=compute_metrics,
        )
        
        # Training callback for progress updates
        class ProgressCallback:
            def __init__(self, model_id, total_epochs):
                self.model_id = model_id
                self.total_epochs = total_epochs
            
            def on_epoch_end(self, args, state, control, **kwargs):
                epoch = state.epoch
                metrics = state.log_history[-1] if state.log_history else {}
                
                training_jobs[self.model_id]["current_epoch"] = int(epoch)
                training_jobs[self.model_id]["progress"] = (epoch / self.total_epochs) * 100
                training_jobs[self.model_id]["metrics"] = metrics
                training_jobs[self.model_id]["logs"].append(
                    f"Epoch {int(epoch)}/{self.total_epochs} - Loss: {metrics.get('loss', 0):.4f}"
                )
        
        trainer.add_callback(ProgressCallback(model_id, request.epochs))
        
        # Start training
        training_jobs[model_id]["status"] = "training"
        training_jobs[model_id]["logs"].append("Starting training...")
        
        trainer.train()
        
        # Evaluate
        training_jobs[model_id]["status"] = "evaluating"
        training_jobs[model_id]["logs"].append("Evaluating model...")
        
        eval_results = trainer.evaluate()
        training_jobs[model_id]["metrics"]["final"] = eval_results
        
        # Push to HuggingFace Hub
        training_jobs[model_id]["status"] = "deploying"
        training_jobs[model_id]["logs"].append("Pushing model to HuggingFace Hub...")
        
        trainer.push_to_hub(commit_message="Training completed via Pipeline AI")
        
        # Get HuggingFace username
        api = HfApi()
        user_info = api.whoami(token=request.hf_token)
        username = user_info["name"]
        
        hf_url = f"https://huggingface.co/{username}/{hf_repo_name}"
        
        # Complete
        training_jobs[model_id]["status"] = "completed"
        training_jobs[model_id]["progress"] = 100
        training_jobs[model_id]["hf_url"] = hf_url
        training_jobs[model_id]["logs"].append(f"Training completed! Model available at: {hf_url}")
        
    except Exception as e:
        training_jobs[model_id]["status"] = "failed"
        training_jobs[model_id]["logs"].append(f"Error: {str(e)}")
        training_jobs[model_id]["error"] = str(e)

async def load_training_dataset(request: TrainingRequest) -> Dataset:
    """Load dataset based on source"""
    
    if request.dataset_source == "huggingface":
        # Load from HuggingFace
        dataset = load_dataset(request.dataset_name, split="train")
        return dataset
    
    elif request.dataset_source == "auto":
        # Auto-find dataset based on task
        if request.task_type == "classification":
            dataset = load_dataset("imdb", split="train[:1000]")  # Sample for demo
        else:
            dataset = load_dataset("glue", "sst2", split="train[:1000]")
        return dataset
    
    else:
        # Create dummy dataset for demo
        data = {
            "text": ["This is great!", "This is bad", "Amazing product", "Terrible experience"] * 250,
            "label": [1, 0, 1, 0] * 250
        }
        return Dataset.from_dict(data)

async def analyze_model_description(request: TrainingRequest, model_id: str):
    """Use AI to analyze model description and suggest configuration"""
    
    if not request.groq_api_key:
        return
    
    try:
        from groq import Groq
        
        client = Groq(api_key=request.groq_api_key)
        
        prompt = f"""Analyze this model description and suggest the best configuration:

Description: {request.model_description}

Task Type: {request.task_type}
Training Mode: {request.training_mode}

Provide recommendations for:
1. Best base model to use
2. Optimal hyperparameters
3. Dataset suggestions
4. Training strategy

Respond in JSON format."""

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )
        
        analysis = response.choices[0].message.content
        training_jobs[model_id]["ai_analysis"] = analysis
        training_jobs[model_id]["logs"].append(f"AI Analysis: {analysis}")
        
    except Exception as e:
        training_jobs[model_id]["logs"].append(f"AI analysis failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
