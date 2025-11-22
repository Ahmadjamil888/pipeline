# 🚀 Real PyTorch Training Setup Guide

This guide explains how to set up **real PyTorch model training** with automatic HuggingFace deployment.

## 🏗️ Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Next.js App   │─────▶│  Python Service  │─────▶│ HuggingFace Hub │
│   (Frontend)    │      │  (PyTorch Train) │      │  (Model Repo)   │
└─────────────────┘      └──────────────────┘      └─────────────────┘
```

## 📋 Prerequisites

- Python 3.10+
- Node.js 18+
- (Optional) CUDA for GPU training

## 🚀 Quick Start

### Step 1: Start Python Training Service

```bash
cd python-service

# Install dependencies
pip install -r requirements.txt

# Run service
python main.py
```

The service will start on `http://localhost:8000`

### Step 2: Start Next.js App

```bash
# In the main pipeline directory
npm run dev
```

The app will start on `http://localhost:3000`

### Step 3: Configure Environment

Make sure `.env.local` has:
```env
PYTHON_SERVICE_URL=http://localhost:8000
NEXT_PUBLIC_PYTHON_SERVICE_URL=http://localhost:8000
```

## 🎯 How It Works

### 1. User Creates Model

User fills out the form with:
- Model name and description
- Creation mode (Fine-tune or From-scratch)
- Training mode (Supervised/Unsupervised/RLHF)
- **AI Description** (for from-scratch): Natural language description of what the model should do
- Dataset source
- Compute type (CPU/GPU/TPU)
- Hyperparameters

### 2. AI Analysis (From-Scratch Mode)

When user provides a model description, Groq AI analyzes it and suggests:
- Best base model architecture
- Optimal hyperparameters
- Recommended datasets
- Training strategy

### 3. Real Training Begins

The Python service:
1. Loads the dataset (HuggingFace, Kaggle, or custom)
2. Initializes PyTorch model
3. Sets up Transformers Trainer with `push_to_hub=True`
4. Trains the model with real backpropagation
5. Evaluates on validation set
6. **Automatically pushes to HuggingFace Hub**

### 4. Real-Time Progress

Frontend polls `/api/train-real?modelId=xxx` to show:
- Current epoch
- Training loss
- Validation accuracy
- Real-time logs

### 5. Automatic Deployment

When training completes, the model is automatically on HuggingFace with:
- ✅ Trained model weights (.bin file)
- ✅ Model configuration
- ✅ Tokenizer files
- ✅ Model card (README.md)
- ✅ Training metrics
- ✅ Ready for inference!

## 🔧 Configuration Options

### Training Modes

**Supervised Learning:**
- Trains on labeled data
- Uses CrossEntropyLoss
- Best for classification/regression

**Unsupervised Learning:**
- Discovers patterns without labels
- Uses contrastive learning
- Best for clustering/embeddings

**Reinforcement Learning (RLHF):**
- Learns from human feedback
- Implements PPO/DPO
- Best for instruction following

### Compute Types

**CPU:**
- Works everywhere
- Slower training
- Good for small models

**GPU:**
- 10-50x faster
- Requires CUDA
- Automatic mixed precision (FP16)

**TPU:**
- Ultra-fast for large models
- Requires Google Cloud
- Best for production

## 📊 Example Training Request

```json
{
  "model_id": "model-123",
  "model_name": "Sentiment Classifier",
  "creation_mode": "from-scratch",
  "training_mode": "supervised",
  "model_description": "Build a sentiment analysis model for movie reviews that can classify them as positive or negative with high accuracy",
  "model_type": "transformer",
  "task_type": "classification",
  "target_class": "label",
  "dataset_source": "huggingface",
  "dataset_name": "imdb",
  "compute_type": "gpu",
  "epochs": 3,
  "batch_size": 16,
  "learning_rate": 0.00002,
  "hf_token": "hf_...",
  "groq_api_key": "gsk_..."
}
```

## 🎓 Training Process

### Phase 1: Initialization (5-10 seconds)
- Load dataset
- Initialize model
- Setup tokenizer
- Prepare data loaders

### Phase 2: Training (varies)
- Forward pass
- Compute loss
- Backward pass
- Update weights
- Log metrics

### Phase 3: Evaluation (30-60 seconds)
- Run on validation set
- Compute final metrics
- Save best checkpoint

### Phase 4: Deployment (1-2 minutes)
- Push model to HuggingFace
- Upload all files
- Create model card
- Set up inference API

## 🔍 Monitoring Training

### Real-Time Logs

```
[2024-01-15 10:30:00] Analyzing dataset and model requirements...
[2024-01-15 10:30:05] AI Analysis: Recommended base model: distilbert-base-uncased
[2024-01-15 10:30:10] Loading dataset: imdb
[2024-01-15 10:30:15] Dataset loaded: 25000 training samples
[2024-01-15 10:30:20] Preparing model and tokenizer...
[2024-01-15 10:30:25] Starting training...
[2024-01-15 10:32:00] Epoch 1/3 - Loss: 0.4521 - Accuracy: 0.7834
[2024-01-15 10:34:00] Epoch 2/3 - Loss: 0.2341 - Accuracy: 0.8923
[2024-01-15 10:36:00] Epoch 3/3 - Loss: 0.1234 - Accuracy: 0.9456
[2024-01-15 10:36:30] Evaluating model...
[2024-01-15 10:37:00] Final accuracy: 94.56%
[2024-01-15 10:37:05] Pushing model to HuggingFace Hub...
[2024-01-15 10:38:00] Training completed! Model available at: https://huggingface.co/username/model-name
```

## 🐛 Troubleshooting

### Python Service Won't Start

**Error:** `ModuleNotFoundError: No module named 'transformers'`

**Solution:**
```bash
pip install -r requirements.txt
```

### Out of Memory During Training

**Error:** `CUDA out of memory`

**Solutions:**
1. Reduce batch size: `batch_size: 4`
2. Use gradient accumulation
3. Use smaller model
4. Enable gradient checkpointing

### HuggingFace Push Fails

**Error:** `Repository not found`

**Solutions:**
1. Verify HF token has write permissions
2. Check token is valid: `huggingface-cli whoami`
3. Ensure repository name is valid (lowercase, hyphens only)

### Training is Slow

**Solutions:**
1. Use GPU: `compute_type: "gpu"`
2. Increase batch size
3. Use smaller dataset for testing
4. Enable mixed precision (automatic with GPU)

## 🚀 Production Deployment

### Deploy Python Service

**Option 1: Docker**
```bash
cd python-service
docker build -t pipeline-training .
docker run -p 8000:8000 -e HF_TOKEN=xxx pipeline-training
```

**Option 2: Railway**
1. Push `python-service` to GitHub
2. Connect to Railway
3. Set environment variables
4. Deploy!

**Option 3: AWS/GCP**
Use the Dockerfile for ECS/Cloud Run deployment

### Environment Variables

```env
HF_TOKEN=hf_xxxxxxxxxxxxx
GROQ_API_KEY=gsk_xxxxxxxxxxxxx
CUDA_VISIBLE_DEVICES=0  # For GPU
```

## 📈 Performance Benchmarks

| Model Size | Dataset | CPU Time | GPU Time | TPU Time |
|------------|---------|----------|----------|----------|
| Small (110M) | 10K samples | 30 min | 3 min | 1 min |
| Medium (340M) | 50K samples | 2 hours | 15 min | 5 min |
| Large (1.5B) | 100K samples | 8 hours | 1 hour | 20 min |

## 🎉 Success!

Once training completes, your model will be:
- ✅ Fully trained with real PyTorch
- ✅ Deployed to HuggingFace Hub
- ✅ Ready for inference
- ✅ Includes all necessary files
- ✅ Has a professional model card
- ✅ Accessible via Transformers library

## 📚 Next Steps

1. Test your model on HuggingFace
2. Try inference via API
3. Fine-tune further if needed
4. Share with the community!

---

**Need help?** Check the logs or contact support.
