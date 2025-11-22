# 🚀 Pipeline AI - Complete Setup Guide

## Real PyTorch Training + HuggingFace Deployment

This is the **complete production-ready setup** for Pipeline AI with:
- ✅ **Real PyTorch training** (not simulated)
- ✅ **Automatic HuggingFace deployment** using Trainer API
- ✅ **AI-powered model analysis** (Groq)
- ✅ **GPU/CPU/TPU support**
- ✅ **Real-time training progress**
- ✅ **Professional model cards**

## 🎯 Quick Start (Docker - Recommended)

```bash
# 1. Clone and navigate
cd pipeline

# 2. Set environment variables
cp .env.example .env
# Edit .env with your API keys

# 3. Start everything
docker-compose up
```

That's it! Visit:
- Frontend: http://localhost:3000
- Training API: http://localhost:8000

## 📋 Manual Setup

### Prerequisites

- Node.js 18+
- Python 3.10+
- (Optional) CUDA for GPU training

### Step 1: Python Training Service

```bash
cd python-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run service
python main.py
```

Service runs on http://localhost:8000

### Step 2: Next.js Frontend

```bash
# In main pipeline directory
npm install
npm run dev
```

App runs on http://localhost:3000

### Step 3: Configure Environment

Create `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key

# AI APIs
GROQ_API_KEY=gsk_your_key
DEEPSEEK_API_KEY=your_key

# HuggingFace
HUGGINGFACE_API_KEY=hf_your_key

# Python Service
PYTHON_SERVICE_URL=http://localhost:8000
NEXT_PUBLIC_PYTHON_SERVICE_URL=http://localhost:8000
```

## 🎨 How to Use

### 1. Create a Model

1. Go to http://localhost:3000
2. Sign in with Google
3. Click "Create ML Model"

### 2. Choose Creation Mode

**Option A: Fine-tune Existing Model**
- Select a pre-trained model (BERT, GPT-2, etc.)
- Provide your dataset
- Train quickly with transfer learning

**Option B: Create from Scratch** ⭐
- Describe your model in natural language
- AI analyzes and suggests configuration
- Build completely custom architecture

### 3. Describe Your Model (From-Scratch Only)

Example prompts:
```
"Build a sentiment analysis model for movie reviews that classifies them as positive or negative with high accuracy"

"Create a text classifier that can categorize customer support tickets into urgent, normal, and low priority"

"I need a model that can detect spam emails with high precision and recall"
```

AI will analyze and suggest:
- Best base architecture
- Optimal hyperparameters
- Recommended datasets
- Training strategy

### 4. Configure Training

- **Model Type**: Transformer, LSTM, CNN, Custom
- **Task Type**: Classification, Regression, Other
- **Training Mode**: Supervised, Unsupervised, Reinforcement
- **Compute**: CPU, GPU, TPU
- **Dataset**: HuggingFace, Kaggle, Upload, Auto-find
- **Hyperparameters**: Epochs, batch size, learning rate

### 5. Train & Deploy

Click "Train & Deploy" and watch:
- ✅ Real-time training progress
- ✅ Live loss/accuracy graphs
- ✅ Epoch-by-epoch metrics
- ✅ AI analysis insights
- ✅ Automatic HuggingFace push

### 6. Use Your Model

Once deployed, your model is on HuggingFace:

```python
from transformers import pipeline

classifier = pipeline("text-classification", 
                     model="username/your-model-name")

result = classifier("This movie was amazing!")
print(result)
# [{'label': 'POSITIVE', 'score': 0.9456}]
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│  - User Interface                                        │
│  - Form handling                                         │
│  - Real-time progress display                            │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ HTTP API
                 ▼
┌─────────────────────────────────────────────────────────┐
│              Python Training Service                     │
│  - Real PyTorch training                                 │
│  - Transformers Trainer API                              │
│  - AI analysis (Groq)                                    │
│  - Progress tracking                                     │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ push_to_hub=True
                 ▼
┌─────────────────────────────────────────────────────────┐
│                 HuggingFace Hub                          │
│  - Model repository                                      │
│  - Trained weights                                       │
│  - Model card                                            │
│  - Inference API                                         │
└─────────────────────────────────────────────────────────┘
```

## 🔥 Key Features

### Real Training
- Actual PyTorch backpropagation
- Real gradient descent
- Genuine model weights
- True convergence

### Automatic Deployment
```python
# This happens automatically!
trainer = Trainer(
    model=model,
    args=TrainingArguments(
        push_to_hub=True,  # ← Magic happens here
        hub_model_id="your-model",
        hub_token=hf_token
    ),
    ...
)
trainer.train()
trainer.push_to_hub()  # Uploads everything!
```

### AI-Powered Analysis
- Groq AI analyzes your model description
- Suggests optimal configuration
- Recommends datasets
- Provides training strategy

### Real-Time Progress
- Live training metrics
- Epoch-by-epoch updates
- Loss/accuracy graphs
- Detailed logs

## 📊 Training Modes Explained

### Supervised Learning
```
Input: "This movie is great!" → Label: Positive
Input: "Terrible film" → Label: Negative

Model learns: Input → Output mapping
```

**Use cases:**
- Classification
- Regression
- Named Entity Recognition
- Question Answering

### Unsupervised Learning
```
Input: Unlabeled text data

Model learns: Hidden patterns, clusters, representations
```

**Use cases:**
- Clustering
- Anomaly detection
- Dimensionality reduction
- Feature learning

### Reinforcement Learning (RLHF)
```
1. Generate multiple responses
2. Human rates which is better
3. Train reward model
4. Optimize policy

Model learns: To maximize human preferences
```

**Use cases:**
- Instruction following
- Dialogue systems
- Preference alignment
- Safety training

## 🎯 Example Workflows

### Workflow 1: Sentiment Analysis

1. **Create from Scratch**
2. **Describe**: "Sentiment classifier for product reviews"
3. **AI suggests**: DistilBERT, 3 epochs, batch size 16
4. **Dataset**: Auto-find (uses Amazon reviews)
5. **Train**: 15 minutes on GPU
6. **Deploy**: Automatic to HuggingFace
7. **Use**: `pipeline("sentiment-analysis", model="user/model")`

### Workflow 2: Custom Classifier

1. **Fine-tune** existing model
2. **Base**: `bert-base-uncased`
3. **Dataset**: Upload CSV with labels
4. **Target**: `category` column
5. **Train**: 10 minutes
6. **Deploy**: Ready for inference

### Workflow 3: RLHF Chatbot

1. **Create from Scratch**
2. **Mode**: Reinforcement Learning
3. **Describe**: "Helpful assistant that follows instructions"
4. **AI suggests**: GPT-2 base, RLHF pipeline
5. **Train**: Multi-stage (SFT → Reward → PPO)
6. **Deploy**: Production-ready chatbot

## 🐛 Troubleshooting

### Python Service Not Starting

```bash
# Check Python version
python --version  # Should be 3.10+

# Reinstall dependencies
pip install --upgrade -r requirements.txt

# Check port availability
lsof -i :8000  # On Mac/Linux
netstat -ano | findstr :8000  # On Windows
```

### Training Fails

**Out of Memory:**
- Reduce batch size to 4 or 8
- Use smaller model
- Enable gradient checkpointing

**Dataset Not Found:**
- Check dataset name spelling
- Verify HuggingFace dataset exists
- Try auto-find option

**HuggingFace Push Fails:**
- Verify token has write permissions
- Check repository name is valid
- Ensure model files aren't corrupted

### Frontend Can't Connect

```bash
# Check Python service is running
curl http://localhost:8000

# Check environment variable
echo $PYTHON_SERVICE_URL

# Restart both services
docker-compose restart
```

## 🚀 Production Deployment

### Deploy Python Service

**Railway:**
```bash
cd python-service
railway init
railway up
```

**Render:**
1. Connect GitHub repo
2. Select `python-service` directory
3. Set environment variables
4. Deploy!

**AWS ECS:**
```bash
docker build -t pipeline-training python-service/
docker tag pipeline-training:latest your-ecr-repo
docker push your-ecr-repo
```

### Deploy Next.js App

**Vercel:**
```bash
vercel --prod
```

Set environment variable:
```
PYTHON_SERVICE_URL=https://your-training-service.railway.app
```

## 📈 Performance

| Setup | Training Speed | Cost | Best For |
|-------|---------------|------|----------|
| CPU Local | 1x | Free | Development |
| GPU Local | 10-20x | Hardware cost | Testing |
| Cloud GPU | 10-20x | $0.50-2/hour | Production |
| Cloud TPU | 50-100x | $1-8/hour | Large models |

## 🎓 Learning Resources

- [Transformers Documentation](https://huggingface.co/docs/transformers)
- [PyTorch Tutorials](https://pytorch.org/tutorials/)
- [RLHF Explained](https://huggingface.co/blog/rlhf)
- [Pipeline AI Docs](https://docs.pipeline-ai.com)

## 🎉 Success Checklist

- [ ] Python service running on port 8000
- [ ] Next.js app running on port 3000
- [ ] Environment variables configured
- [ ] HuggingFace token has write permissions
- [ ] Groq API key is valid
- [ ] Can create and train a test model
- [ ] Model appears on HuggingFace
- [ ] Can run inference on deployed model

## 💡 Pro Tips

1. **Start small**: Test with 100 samples first
2. **Use GPU**: 10-20x faster training
3. **Monitor logs**: Watch for errors early
4. **Save checkpoints**: Don't lose progress
5. **Test locally**: Before deploying to production

## 📞 Support

- **Documentation**: See `REAL_TRAINING_SETUP.md`
- **Issues**: Check troubleshooting section
- **Community**: Join our Discord
- **Email**: support@pipeline-ai.com

---

**You're now ready to train real AI models!** 🚀
