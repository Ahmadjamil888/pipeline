# Pipeline AI - Python Training Service

Real PyTorch model training service with HuggingFace integration.

## Features

- ✅ Real PyTorch model training (not simulated)
- ✅ Automatic HuggingFace Hub deployment
- ✅ GPU/CPU support
- ✅ Real-time training progress
- ✅ AI-powered model analysis (Groq)
- ✅ Multiple training modes (Supervised, Unsupervised, RLHF)

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Build
docker build -t pipeline-training .

# Run
docker run -p 8000:8000 pipeline-training
```

### Option 2: Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run service
python main.py
```

The service will be available at `http://localhost:8000`

## API Endpoints

### POST /train
Start model training

```json
{
  "model_id": "unique-id",
  "model_name": "My Model",
  "creation_mode": "from-scratch",
  "training_mode": "supervised",
  "model_description": "A sentiment classifier for movie reviews",
  "model_type": "transformer",
  "task_type": "classification",
  "dataset_source": "huggingface",
  "dataset_name": "imdb",
  "compute_type": "cpu",
  "epochs": 3,
  "batch_size": 8,
  "learning_rate": 0.00002,
  "hf_token": "hf_...",
  "groq_api_key": "gsk_..."
}
```

### GET /status/{model_id}
Get training status

Response:
```json
{
  "status": "training",
  "progress": 45.5,
  "current_epoch": 2,
  "total_epochs": 3,
  "metrics": {
    "loss": 0.234,
    "accuracy": 0.89
  },
  "logs": ["Training started...", "Epoch 1/3 completed"]
}
```

## Environment Variables

- `HF_TOKEN` - HuggingFace token (optional, can be passed in request)
- `GROQ_API_KEY` - Groq API key for AI analysis (optional)

## GPU Support

To use GPU training:

1. Install CUDA-enabled PyTorch:
```bash
pip install torch --index-url https://download.pytorch.org/whl/cu118
```

2. Set `compute_type: "gpu"` in training request

## Integration with Next.js

Add to your `.env.local`:
```
PYTHON_SERVICE_URL=http://localhost:8000
```

The Next.js app will automatically connect to this service for real training.

## Production Deployment

### Deploy to Railway/Render/Fly.io

1. Push this directory to a Git repository
2. Connect to your deployment platform
3. Set environment variables
4. Deploy!

### Deploy to AWS/GCP/Azure

Use the provided Dockerfile for container deployment.

## Troubleshooting

### Out of Memory
- Reduce `batch_size`
- Use smaller model
- Enable gradient checkpointing

### Slow Training
- Use GPU (`compute_type: "gpu"`)
- Increase `batch_size`
- Use mixed precision training (automatic with GPU)

### HuggingFace Push Fails
- Verify HF token has write permissions
- Check repository name is valid
- Ensure model files aren't too large

## License

Apache 2.0
