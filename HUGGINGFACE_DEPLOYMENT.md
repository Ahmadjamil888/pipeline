## 🚀 HuggingFace Model Deployment Guide

This guide explains how Pipeline AI deploys models to HuggingFace and how to upload your actual trained model weights.

## 📋 What Pipeline AI Creates

When you deploy a model through Pipeline AI, we automatically create:

1. **Model Repository** on HuggingFace Hub
2. **README.md** - Comprehensive model card with:
   - Model description and metadata
   - Training details and metrics
   - Usage examples
   - Citation information
3. **config.json** - Model configuration
4. **tokenizer_config.json** - Tokenizer settings
5. **training_args.json** - Training parameters
6. **pytorch_model.bin** - Placeholder model file

## ⚠️ Important: Uploading Actual Model Weights

The `pytorch_model.bin` file created by Pipeline AI is a **placeholder**. To make your model functional for inference, you need to upload your actual trained model weights.

## 🔧 Method 1: Using Python Script (Recommended)

### Step 1: Download the Upload Script

Download `upload_model.py` from your Pipeline AI deployment or use this command:

```bash
curl -O https://your-pipeline-url.com/upload_model.py
```

### Step 2: Install Requirements

```bash
pip install huggingface_hub torch
```

### Step 3: Upload Your Model

```bash
python upload_model.py \
  --token YOUR_HF_TOKEN \
  --repo username/model-name \
  --model path/to/your/trained_model.pth
```

**Example:**
```bash
python upload_model.py \
  --token hf_xxxxxxxxxxxxx \
  --repo johndoe/my-classifier-1234567890 \
  --model ./models/best_model.pth
```

### Step 4: Upload Entire Folder (Optional)

If you have multiple files (model, tokenizer, config):

```bash
python upload_model.py \
  --token YOUR_HF_TOKEN \
  --repo username/model-name \
  --folder ./my_model_folder
```

## 🔧 Method 2: Using HuggingFace Hub Library

### Complete Python Example

```python
import os
import torch
from huggingface_hub import HfApi, upload_file

# Your credentials
HF_TOKEN = "hf_xxxxxxxxxxxxx"
REPO_ID = "username/model-name"

# Initialize API
api = HfApi()
api.set_access_token(HF_TOKEN)

# Load your trained model
model = YourModelClass()
model.load_state_dict(torch.load("trained_model.pth"))

# Save model
torch.save(model.state_dict(), "pytorch_model.bin")

# Upload to HuggingFace
upload_file(
    path_or_fileobj="pytorch_model.bin",
    path_in_repo="pytorch_model.bin",
    repo_id=REPO_ID,
    repo_type="model",
    token=HF_TOKEN
)

print(f"✅ Model uploaded to https://huggingface.co/{REPO_ID}")
```

## 🔧 Method 3: Using HuggingFace CLI

### Step 1: Install and Login

```bash
pip install huggingface_hub
huggingface-cli login
```

### Step 2: Upload Files

```bash
huggingface-cli upload username/model-name ./pytorch_model.bin pytorch_model.bin
```

## 📦 What to Upload

### Minimum Required Files:
- `pytorch_model.bin` or `model.pth` - Your trained model weights

### Recommended Files:
- `pytorch_model.bin` - Model weights
- `config.json` - Model configuration (already created by Pipeline AI)
- `tokenizer.json` - Tokenizer (if using transformers)
- `vocab.txt` - Vocabulary file (if applicable)

### Optional Files:
- `optimizer.pt` - Optimizer state
- `scheduler.pt` - Learning rate scheduler
- `training_args.json` - Training arguments (already created)

## 🎯 Model File Formats

Pipeline AI supports these model formats:

| Format | Extension | Framework | Description |
|--------|-----------|-----------|-------------|
| PyTorch State Dict | `.pth`, `.pt` | PyTorch | Most common format |
| PyTorch Full Model | `.pth` | PyTorch | Includes architecture |
| TensorFlow SavedModel | `.pb` | TensorFlow | TF saved model |
| TensorFlow HDF5 | `.h5` | TensorFlow/Keras | Keras model |
| ONNX | `.onnx` | Cross-platform | Optimized format |
| SafeTensors | `.safetensors` | Any | Safe serialization |

## 📊 Verifying Your Upload

After uploading, verify your model:

1. Visit `https://huggingface.co/username/model-name`
2. Check the "Files and versions" tab
3. Verify `pytorch_model.bin` is present and has a reasonable size
4. Test inference using the model card examples

## 🧪 Testing Your Model

```python
from transformers import AutoTokenizer, AutoModelForSequenceClassification

model_name = "username/model-name"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)

# Test inference
text = "This is a test"
inputs = tokenizer(text, return_tensors="pt")
outputs = model(**inputs)
print(outputs)
```

## 🔒 Security Best Practices

1. **Never commit tokens to git**
   ```bash
   # Use environment variables
   export HF_TOKEN="your_token_here"
   ```

2. **Use write tokens only when needed**
   - Create separate read/write tokens
   - Revoke tokens after use if temporary

3. **Keep model files secure**
   - Don't include sensitive data in model files
   - Review model cards before making public

## 🐛 Troubleshooting

### Issue: "Repository not found"
**Solution:** Verify the repository was created successfully on HuggingFace

### Issue: "Authentication failed"
**Solution:** Check your HF token has write permissions

### Issue: "File too large"
**Solution:** HuggingFace has file size limits. For large models:
```python
# Use Git LFS for files > 5GB
git lfs install
git lfs track "*.bin"
```

### Issue: "Model not loading"
**Solution:** Ensure you uploaded the correct model format:
```python
# Verify model can be loaded
import torch
model = torch.load("pytorch_model.bin", map_location='cpu')
print(type(model))  # Should be dict or OrderedDict
```

## 📚 Additional Resources

- [HuggingFace Hub Documentation](https://huggingface.co/docs/hub)
- [HuggingFace Hub Python Library](https://huggingface.co/docs/huggingface_hub)
- [Model Cards Guide](https://huggingface.co/docs/hub/model-cards)
- [Pipeline AI Documentation](https://docs.pipeline-ai.com)

## 💡 Pro Tips

1. **Use descriptive model names** - Include task type and date
2. **Add comprehensive model cards** - Pipeline AI creates a great template
3. **Tag your models properly** - Makes them discoverable
4. **Version your models** - Use git tags for different versions
5. **Test before deploying** - Always test locally first

## 🎉 Success!

Once uploaded, your model will be:
- ✅ Publicly accessible (or private if you chose)
- ✅ Ready for inference via Transformers library
- ✅ Discoverable on HuggingFace Hub
- ✅ Citable with the provided BibTeX

---

**Need help?** Contact Pipeline AI support or visit our documentation.
