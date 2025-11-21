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

  // Get user info
  async getUserInfo(): Promise<{ username: string } | null> {
    try {
      const response = await fetch(`${this.baseUrl}/whoami-v2`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      return { username: data.name || data.username }
    } catch (error) {
      console.error('Failed to get user info:', error)
      return null
    }
  }

  // Create a new model repository using the correct API
  async createRepo(repoName: string, config: HFModelConfig): Promise<HFUploadResponse> {
    try {
      // Use the correct HuggingFace API endpoint
      const response = await fetch(`${this.baseUrl}/repos/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'model',
          name: repoName,
          organization: null,
          private: false,
          sdk: 'gradio',
          hardware: 'cpu-basic',
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('HF API Error:', errorText)
        throw new Error(`Failed to create repo: ${response.status} ${errorText}`)
      }

      const result = await response.json()
      return {
        success: true,
        repoUrl: result.url || `https://huggingface.co/${repoName}`,
      }
    } catch (error) {
      console.error('HF API Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Upload file to repository using HuggingFace Hub API
  async uploadFile(repoId: string, filename: string, content: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://huggingface.co/api/repos/${repoId}/upload/main/${filename}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/x-ndjson',
          },
          body: JSON.stringify({
            content: content,
            encoding: 'utf-8',
          }),
        }
      )

      if (!response.ok) {
        console.error(`Failed to upload ${filename}:`, await response.text())
        return false
      }

      return true
    } catch (error) {
      console.error(`Upload error for ${filename}:`, error)
      return false
    }
  }

  // Generate model card (README.md)
  generateModelCard(config: HFModelConfig, metrics?: any, repoName?: string): string {
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

tokenizer = AutoTokenizer.from_pretrained("${repoName || config.name}")
model = AutoModel.from_pretrained("${repoName || config.name}")

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
  url={https://huggingface.co/${repoName || config.name}}
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
      // Step 1: Get user info to create proper repo name
      const userInfo = await this.getUserInfo()
      if (!userInfo) {
        throw new Error('Failed to authenticate with HuggingFace. Please check your token.')
      }

      const fullRepoName = `${userInfo.username}/${repoName}`

      // Step 2: Create repository
      const repoResult = await this.createRepo(fullRepoName, config)
      if (!repoResult.success) {
        return repoResult
      }

      // Step 3: Upload README.md (model card)
      const readme = this.generateModelCard(config, metrics, fullRepoName)
      const readmeSuccess = await this.uploadFile(fullRepoName, 'README.md', readme)
      
      if (!readmeSuccess) {
        console.warn('Failed to upload README.md, but repo was created')
      }

      // Step 4: Upload config.json
      const configJson = JSON.stringify({
        model_type: config.modelType.toLowerCase(),
        task_type: config.taskType,
        framework: config.framework,
        pipeline_tag: config.taskType === 'classification' ? 'text-classification' : config.taskType,
        created_by: 'Pipeline AI',
        architectures: [config.modelType],
        ...modelData.config,
      }, null, 2)
      
      await this.uploadFile(fullRepoName, 'config.json', configJson)

      return {
        success: true,
        repoUrl: `https://huggingface.co/${fullRepoName}`,
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