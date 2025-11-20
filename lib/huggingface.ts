// HuggingFace API Integration

export interface HFModelConfig {
  name: string
  description?: string
  framework: string
  modelType: string
  taskType: string
  license?: string
  tags?: string[]
}

export interface HFUploadResponse {
  success: boolean
  repoUrl?: string
  error?: string
}

export class HuggingFaceAPI {
  private token: string
  private baseUrl = 'https://huggingface.co/api'

  constructor(token: string) {
    this.token = token
  }

  // Create a new model repository
  async createRepo(repoName: string, config: HFModelConfig): Promise<HFUploadResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: repoName,
          type: 'model',
          private: false,
          description: config.description,
          license: config.license || 'apache-2.0',
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Failed to create repo: ${error}`)
      }

      const result = await response.json()
      return {
        success: true,
        repoUrl: `https://huggingface.co/${result.name}`,
      }
    } catch (error) {
      console.error('HF API Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Upload model files
  async uploadModelFiles(repoName: string, files: { [filename: string]: string }): Promise<boolean> {
    try {
      for (const [filename, content] of Object.entries(files)) {
        const response = await fetch(`${this.baseUrl}/repos/${repoName}/upload/${filename}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/octet-stream',
          },
          body: content,
        })

        if (!response.ok) {
          throw new Error(`Failed to upload ${filename}`)
        }
      }
      return true
    } catch (error) {
      console.error('Upload error:', error)
      return false
    }
  }

  // Generate model card (README.md)
  generateModelCard(config: HFModelConfig, metrics?: any): string {
    const tags = [
      config.framework.toLowerCase(),
      config.modelType.toLowerCase(),
      config.taskType.toLowerCase(),
      'pipeline-ai',
      ...(config.tags || [])
    ]

    return `---
license: apache-2.0
tags:
${tags.map(tag => `- ${tag}`).join('\n')}
pipeline_tag: ${config.taskType === 'classification' ? 'text-classification' : config.taskType}
widget:
- text: "Sample input text"
---

# ${config.name}

${config.description || 'A model trained using Pipeline AI platform.'}

## Model Details

- **Framework**: ${config.framework}
- **Model Type**: ${config.modelType}
- **Task**: ${config.taskType}
- **Training Platform**: [Pipeline AI](https://pipeline-ai.com)

## Usage

\`\`\`python
from transformers import AutoTokenizer, AutoModel

tokenizer = AutoTokenizer.from_pretrained("${config.name}")
model = AutoModel.from_pretrained("${config.name}")

# Your inference code here
\`\`\`

## Training Details

This model was trained using the Pipeline AI platform with the following configuration:

${metrics ? `
### Performance Metrics

- **Final Accuracy**: ${(metrics.final_accuracy * 100).toFixed(2)}%
- **Final Loss**: ${metrics.final_loss.toFixed(4)}
` : ''}

## Citation

If you use this model, please cite:

\`\`\`
@misc{pipeline-ai-model,
  title={${config.name}},
  author={Pipeline AI},
  year={2024},
  url={https://huggingface.co/${config.name}}
}
\`\`\`

---

*This model was created using [Pipeline AI](https://pipeline-ai.com) - the world's first fully automated ML platform.*
`
  }

  // Create a complete model deployment
  async deployModel(
    repoName: string, 
    config: HFModelConfig, 
    modelData: any, 
    metrics?: any
  ): Promise<HFUploadResponse> {
    try {
      // Step 1: Create repository
      const repoResult = await this.createRepo(repoName, config)
      if (!repoResult.success) {
        return repoResult
      }

      // Step 2: Generate model files
      const files: { [filename: string]: string } = {
        'README.md': this.generateModelCard(config, metrics),
        'config.json': JSON.stringify({
          model_type: config.modelType.toLowerCase(),
          task_type: config.taskType,
          framework: config.framework,
          pipeline_tag: config.taskType === 'classification' ? 'text-classification' : config.taskType,
          created_by: 'Pipeline AI',
          ...modelData.config,
        }, null, 2),
      }

      // Add model-specific files based on framework
      if (config.framework.toLowerCase() === 'pytorch') {
        files['pytorch_model.bin'] = modelData.weights || 'mock-model-weights'
        files['tokenizer.json'] = JSON.stringify(modelData.tokenizer || {})
      }

      // Step 3: Upload files
      const uploadSuccess = await this.uploadModelFiles(repoName, files)
      if (!uploadSuccess) {
        return {
          success: false,
          error: 'Failed to upload model files',
        }
      }

      return {
        success: true,
        repoUrl: `https://huggingface.co/${repoName}`,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Deployment failed',
      }
    }
  }

  // Validate token
  async validateToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/whoami`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      })
      return response.ok
    } catch {
      return false
    }
  }
}

// Utility function to create HF API instance
export function createHuggingFaceAPI(token: string): HuggingFaceAPI {
  return new HuggingFaceAPI(token)
}

// Mock deployment for demo purposes
export async function mockHuggingFaceDeployment(
  repoName: string,
  config: HFModelConfig,
  metrics?: any
): Promise<HFUploadResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Simulate success
  return {
    success: true,
    repoUrl: `https://huggingface.co/${repoName}`,
  }
}