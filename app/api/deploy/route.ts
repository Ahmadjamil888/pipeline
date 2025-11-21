import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { token, modelName, modelConfig, metrics } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'HuggingFace token is required' }, { status: 400 })
    }

    // Get user info from HuggingFace
    const whoamiResponse = await fetch('https://huggingface.co/api/whoami-v2', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!whoamiResponse.ok) {
      return NextResponse.json({ error: 'Invalid HuggingFace token' }, { status: 401 })
    }

    const userData = await whoamiResponse.json()
    const username = userData.name || userData.username

    // Create repository name
    const timestamp = Date.now()
    const cleanName = modelName.toLowerCase().replace(/[^a-z0-9-]/g, '-')
    const repoName = `${cleanName}-${timestamp}`
    const fullRepoId = `${username}/${repoName}`

    // Create repository
    const createRepoResponse = await fetch('https://huggingface.co/api/repos/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'model',
        name: repoName,
        private: false,
      }),
    })

    if (!createRepoResponse.ok) {
      const errorText = await createRepoResponse.text()
      return NextResponse.json({ 
        error: `Failed to create repository: ${errorText}` 
      }, { status: 500 })
    }

    // Generate all necessary files
    const readme = generateModelCard(modelName, modelConfig, metrics, fullRepoId)
    const config = generateConfigJson(modelConfig, metrics)
    const modelFile = generateMockModelFile(modelConfig)
    const tokenizerConfig = generateTokenizerConfig()
    const trainingArgs = generateTrainingArgs(modelConfig, metrics)

    // Upload files using HuggingFace Hub API with proper content
    const files = [
      { path: 'README.md', content: readme, contentType: 'text/markdown' },
      { path: 'config.json', content: config, contentType: 'application/json' },
      { path: 'tokenizer_config.json', content: tokenizerConfig, contentType: 'application/json' },
      { path: 'training_args.json', content: trainingArgs, contentType: 'application/json' },
      { path: 'pytorch_model.bin', content: modelFile, contentType: 'application/octet-stream' },
    ]

    // Upload each file with retry logic
    const uploadResults = []
    for (const file of files) {
      try {
        const result = await uploadFileWithRetry(token, fullRepoId, file.path, file.content, file.contentType)
        uploadResults.push({ file: file.path, success: true })
      } catch (uploadError) {
        console.error(`Failed to upload ${file.path}:`, uploadError)
        uploadResults.push({ file: file.path, success: false, error: uploadError })
        // Continue with other files even if one fails
      }
    }

    const repoUrl = `https://huggingface.co/${fullRepoId}`
    
    const successfulUploads = uploadResults.filter(r => r.success).length
    const totalFiles = uploadResults.length

    return NextResponse.json({
      success: true,
      repoUrl,
      repoId: fullRepoId,
      uploadResults: {
        successful: successfulUploads,
        total: totalFiles,
        files: uploadResults
      },
      message: `Repository created successfully. ${successfulUploads}/${totalFiles} files uploaded. You can now upload your trained model weights (.pth file) to complete the deployment.`
    })

  } catch (error) {
    console.error('Deployment error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Deployment failed' 
    }, { status: 500 })
  }
}

// Upload file to HuggingFace using the Hub API with proper encoding
async function uploadFileWithRetry(
  token: string, 
  repoId: string, 
  filePath: string, 
  content: string,
  contentType: string,
  retries: number = 3
): Promise<any> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Use the HuggingFace Hub API endpoint for file uploads
      const url = `https://huggingface.co/api/models/${repoId}/upload/main/${filePath}`
      
      // Convert content to base64 for reliable transmission
      const base64Content = Buffer.from(content).toString('base64')
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: base64Content,
          encoding: 'base64',
          path: filePath,
          branch: 'main',
        }),
      })

      if (response.ok) {
        return await response.json()
      }

      // If not ok, try alternative method
      const formData = new FormData()
      const blob = new Blob([content], { type: contentType })
      formData.append('file', blob, filePath)

      const altResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      if (altResponse.ok) {
        return await altResponse.json()
      }

      if (attempt === retries - 1) {
        const errorText = await altResponse.text()
        throw new Error(`Failed after ${retries} attempts: ${errorText}`)
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
    } catch (error) {
      if (attempt === retries - 1) {
        throw error
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
    }
  }
  
  throw new Error('Upload failed after all retries')
}

// Generate config.json
function generateConfigJson(modelConfig: any, metrics: any): string {
  const taskType = modelConfig?.task_type || 'classification'
  const framework = modelConfig?.framework || 'pytorch'
  const modelType = modelConfig?.model_type || 'transformer'
  const trainingMode = modelConfig?.training_mode || 'supervised'

  return JSON.stringify({
    "model_type": modelType.toLowerCase(),
    "task": taskType,
    "framework": framework,
    "training_mode": trainingMode,
    "architectures": [modelType],
    "torch_dtype": "float32",
    "transformers_version": "4.36.0",
    "pipeline_tag": taskType === 'classification' ? 'text-classification' : 
                    taskType === 'regression' ? 'text-generation' : taskType,
    "library_name": "transformers",
    "tags": [
      framework.toLowerCase(),
      modelType.toLowerCase(),
      taskType.toLowerCase(),
      trainingMode.toLowerCase(),
      "pipeline-ai"
    ],
    "metrics": metrics ? {
      "accuracy": metrics.final_accuracy,
      "loss": metrics.final_loss
    } : {},
    "created_by": "Pipeline AI",
    "created_at": new Date().toISOString(),
  }, null, 2)
}

// Generate a mock model file (in production, this would be the actual trained model)
function generateMockModelFile(modelConfig: any): string {
  // Create a minimal PyTorch model structure
  // In production, this would be replaced with actual trained weights
  const modelStructure = {
    "model_state_dict": {
      "embeddings.weight": "tensor_placeholder",
      "encoder.layer.0.weight": "tensor_placeholder",
      "classifier.weight": "tensor_placeholder",
      "classifier.bias": "tensor_placeholder"
    },
    "optimizer_state_dict": {
      "state": {},
      "param_groups": []
    },
    "epoch": 10,
    "loss": 0.1,
    "metadata": {
      "framework": modelConfig?.framework || "pytorch",
      "model_type": modelConfig?.model_type || "transformer",
      "task": modelConfig?.task_type || "classification",
      "training_mode": modelConfig?.training_mode || "supervised",
      "created_by": "Pipeline AI",
      "created_at": new Date().toISOString(),
      "note": "This is a placeholder model file. To use this model in production, upload your actual trained PyTorch model weights (.pth or .bin file) to replace this file."
    }
  }
  
  return JSON.stringify(modelStructure, null, 2)
}

// Generate tokenizer configuration
function generateTokenizerConfig(): string {
  return JSON.stringify({
    "tokenizer_class": "AutoTokenizer",
    "model_max_length": 512,
    "padding_side": "right",
    "truncation_side": "right",
    "special_tokens": {
      "bos_token": "<s>",
      "eos_token": "</s>",
      "unk_token": "<unk>",
      "sep_token": "</s>",
      "pad_token": "<pad>",
      "cls_token": "<s>",
      "mask_token": "<mask>"
    },
    "clean_up_tokenization_spaces": true,
    "tokenize_chinese_chars": true,
    "strip_accents": null,
    "do_lower_case": false
  }, null, 2)
}

// Generate training arguments
function generateTrainingArgs(modelConfig: any, metrics: any): string {
  return JSON.stringify({
    "output_dir": "./results",
    "num_train_epochs": 10,
    "per_device_train_batch_size": modelConfig?.compute_type === 'tpu' ? 64 : 
                                     modelConfig?.compute_type === 'gpu' ? 32 : 16,
    "per_device_eval_batch_size": 8,
    "warmup_steps": 500,
    "weight_decay": 0.01,
    "logging_dir": "./logs",
    "logging_steps": 10,
    "evaluation_strategy": "steps",
    "eval_steps": 500,
    "save_steps": 1000,
    "save_total_limit": 2,
    "load_best_model_at_end": true,
    "metric_for_best_model": "accuracy",
    "greater_is_better": true,
    "learning_rate": 2e-5,
    "adam_epsilon": 1e-8,
    "max_grad_norm": 1.0,
    "fp16": modelConfig?.compute_type === 'gpu' || modelConfig?.compute_type === 'tpu',
    "dataloader_num_workers": 4,
    "remove_unused_columns": true,
    "label_names": ["labels"],
    "push_to_hub": false,
    "framework": modelConfig?.framework || "pytorch",
    "training_mode": modelConfig?.training_mode || "supervised",
    "final_metrics": metrics ? {
      "accuracy": metrics.final_accuracy,
      "loss": metrics.final_loss
    } : null,
    "created_by": "Pipeline AI",
    "created_at": new Date().toISOString()
  }, null, 2)
}

function generateModelCard(
  modelName: string,
  modelConfig: any,
  metrics: any,
  repoId: string
): string {
  const taskType = modelConfig?.task_type || 'classification'
  const framework = modelConfig?.framework || 'pytorch'
  const modelType = modelConfig?.model_type || 'transformer'
  const trainingMode = modelConfig?.training_mode || 'supervised'
  const computeType = modelConfig?.compute_type || 'cpu'
  const creationMode = modelConfig?.creation_mode || 'fine-tune'

  return `---
license: apache-2.0
base_model: ${modelConfig?.base_model || 'custom'}
tags:
- ${framework.toLowerCase()}
- ${modelType.toLowerCase()}
- ${taskType.toLowerCase()}
- ${trainingMode.toLowerCase()}
- pipeline-ai
- ${creationMode === 'from-scratch' ? 'from-scratch' : 'fine-tuned'}
- ${computeType.toLowerCase()}
language:
- en
pipeline_tag: ${taskType === 'classification' ? 'text-classification' : 
                taskType === 'regression' ? 'text-generation' : 
                taskType === 'question-answering' ? 'question-answering' : 'text-generation'}
library_name: transformers
datasets:
- custom
metrics:
${metrics ? `- accuracy: ${(metrics.final_accuracy * 100).toFixed(2)}
- loss: ${metrics.final_loss.toFixed(4)}` : '- accuracy\n- loss'}
model-index:
- name: ${modelName}
  results:
  - task:
      type: ${taskType}
      name: ${taskType.charAt(0).toUpperCase() + taskType.slice(1)}
    metrics:
${metrics ? `    - type: accuracy
      value: ${(metrics.final_accuracy * 100).toFixed(2)}
      name: Accuracy
    - type: loss
      value: ${metrics.final_loss.toFixed(4)}
      name: Loss` : '    - type: accuracy\n      name: Accuracy'}
---

# ${modelName}

<div align="center">
  <img src="https://img.shields.io/badge/Framework-${framework}-blue" alt="Framework">
  <img src="https://img.shields.io/badge/Task-${taskType}-green" alt="Task">
  <img src="https://img.shields.io/badge/Training-${trainingMode}-orange" alt="Training Mode">
  <img src="https://img.shields.io/badge/Compute-${computeType.toUpperCase()}-red" alt="Compute">
</div>

## 📋 Model Description

This model was ${creationMode === 'from-scratch' ? 'built from scratch' : 'fine-tuned'} using the [Pipeline AI](https://pipeline-ai.com) platform - the world's first fully automated ML training platform.

**Model Type:** ${modelType}  
**Task:** ${taskType.charAt(0).toUpperCase() + taskType.slice(1)}  
**Training Mode:** ${trainingMode.charAt(0).toUpperCase() + trainingMode.slice(1)} Learning  
**Framework:** ${framework}  
**Compute:** ${computeType.toUpperCase()}

## 🎯 Intended Use

This model is designed for ${taskType} tasks. It can be used for:

${taskType === 'classification' ? `
- Text classification
- Sentiment analysis
- Category prediction
- Label assignment
` : taskType === 'regression' ? `
- Value prediction
- Numerical estimation
- Continuous output generation
` : `
- General ${taskType} tasks
- Custom predictions
`}

## 📊 Training Details

### Training Configuration

- **Creation Mode**: ${creationMode === 'from-scratch' ? 'Built from scratch' : 'Fine-tuned from pre-trained model'}
- **Training Mode**: ${trainingMode.charAt(0).toUpperCase() + trainingMode.slice(1)} Learning
- **Framework**: ${framework}
- **Compute Type**: ${computeType.toUpperCase()}
${modelConfig?.target_class ? `- **Target Column**: \`${modelConfig.target_class}\`` : ''}
${modelConfig?.base_model ? `- **Base Model**: ${modelConfig.base_model}` : ''}

### Performance Metrics

${metrics ? `
| Metric | Value |
|--------|-------|
| Accuracy | ${(metrics.final_accuracy * 100).toFixed(2)}% |
| Loss | ${metrics.final_loss.toFixed(4)} |
` : `
Training metrics will be available after model training completes.
`}

## 💻 Usage

### Installation

\`\`\`bash
pip install transformers torch
\`\`\`

### Quick Start

\`\`\`python
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

# Load model and tokenizer
model_name = "${repoId}"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)

# Example inference
text = "Your input text here"
inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True)

with torch.no_grad():
    outputs = model(**inputs)
    predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
    
print(f"Predictions: {predictions}")
\`\`\`

### Advanced Usage

\`\`\`python
# For batch processing
texts = ["Text 1", "Text 2", "Text 3"]
inputs = tokenizer(texts, return_tensors="pt", padding=True, truncation=True)

with torch.no_grad():
    outputs = model(**inputs)
    predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)

# Get predicted classes
predicted_classes = torch.argmax(predictions, dim=-1)
print(f"Predicted classes: {predicted_classes}")
\`\`\`

## 🔬 Training Process

This model was trained using **${trainingMode} learning**:

${trainingMode === 'supervised' ? `
### Supervised Learning Approach

1. **Data Preparation**: Labeled dataset with input-output pairs
2. **Model Architecture**: ${modelType} architecture optimized for ${taskType}
3. **Training Process**: 
   - Learns from explicit examples
   - Optimizes for prediction accuracy
   - Uses labeled data for guidance
4. **Optimization**: Supervised fine-tuning (SFT) for instruction following
5. **Validation**: Continuous evaluation on validation set

**Key Features:**
- ✅ Instruction following capability
- ✅ High accuracy on labeled data
- ✅ Predictable and consistent outputs
- ✅ Safety alignment and refusal training
` : trainingMode === 'unsupervised' ? `
### Unsupervised Learning Approach

1. **Data Preparation**: Unlabeled dataset for pattern discovery
2. **Model Architecture**: ${modelType} architecture for feature learning
3. **Training Process**:
   - Discovers hidden patterns automatically
   - Learns data structure and relationships
   - No explicit labels required
4. **Optimization**: Self-supervised learning objectives
5. **Evaluation**: Clustering quality and reconstruction metrics

**Key Features:**
- ✅ Automatic pattern discovery
- ✅ Feature extraction and representation learning
- ✅ Anomaly detection capabilities
- ✅ Dimensionality reduction
` : trainingMode === 'reinforcement' ? `
### Reinforcement Learning (RLHF) Approach

1. **Initial Training**: Supervised fine-tuning (SFT) phase
2. **Reward Model**: Trained on human preferences
3. **Policy Optimization**: 
   - Learns through trial and error
   - Maximizes reward signals
   - Continuous improvement through feedback
4. **RLHF Pipeline**:
   - Multiple response generation
   - Human rating and preference collection
   - Reward model training
   - Policy optimization (PPO/DPO)
5. **Post-Training**: Safety alignment and preference optimization

**Key Features:**
- ✅ Human feedback integration
- ✅ Preference-aligned outputs
- ✅ Continuous improvement capability
- ✅ Safety and helpfulness optimization
` : ''}

## ⚠️ Limitations and Bias

- This model was trained on a specific dataset and may not generalize to all scenarios
- Performance may vary depending on input data distribution
- The model should be evaluated on your specific use case before production deployment
- Consider potential biases in the training data

## 📝 Citation

If you use this model in your research or application, please cite:

\`\`\`bibtex
@misc{${repoId.replace('/', '-')},
  title={${modelName}},
  author={Pipeline AI},
  year={${new Date().getFullYear()}},
  publisher={HuggingFace},
  url={https://huggingface.co/${repoId}},
  note={Trained using Pipeline AI platform}
}
\`\`\`

## 🔗 Links

- **Model Repository**: [https://huggingface.co/${repoId}](https://huggingface.co/${repoId})
- **Pipeline AI Platform**: [https://pipeline-ai.com](https://pipeline-ai.com)
- **Documentation**: [Pipeline AI Docs](https://docs.pipeline-ai.com)
- **Support**: [support@pipeline-ai.com](mailto:support@pipeline-ai.com)

## 📄 License

This model is released under the Apache 2.0 License.

---

<div align="center">
  <strong>🚀 Created with <a href="https://pipeline-ai.com">Pipeline AI</a></strong><br>
  <em>The world's first fully automated ML training platform</em>
</div>
`
}
