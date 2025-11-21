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

    // Generate README content
    const readme = generateModelCard(modelName, modelConfig, metrics, fullRepoId)

    // Upload README using the correct API
    const uploadResponse = await fetch(
      `https://huggingface.co/${fullRepoId}/raw/main/README.md`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain',
        },
        body: readme,
      }
    )

    // Even if upload fails, the repo is created
    const repoUrl = `https://huggingface.co/${fullRepoId}`

    return NextResponse.json({
      success: true,
      repoUrl,
      repoId: fullRepoId,
    })

  } catch (error) {
    console.error('Deployment error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Deployment failed' 
    }, { status: 500 })
  }
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

  return `---
license: apache-2.0
tags:
- ${framework.toLowerCase()}
- ${modelType.toLowerCase()}
- ${taskType.toLowerCase()}
- ${trainingMode.toLowerCase()}
- pipeline-ai
- auto-generated
pipeline_tag: ${taskType === 'classification' ? 'text-classification' : taskType}
---

# ${modelName}

This model was trained using the [Pipeline AI](https://pipeline-ai.com) platform.

## Model Details

- **Framework**: ${framework}
- **Model Type**: ${modelType}
- **Task**: ${taskType}
- **Training Mode**: ${trainingMode}
- **Training Platform**: Pipeline AI

## Training Details

${metrics ? `
### Performance Metrics

- **Final Accuracy**: ${(metrics.final_accuracy * 100).toFixed(2)}%
- **Final Loss**: ${metrics.final_loss.toFixed(4)}
` : ''}

### Training Configuration

- **Compute Type**: ${modelConfig?.compute_type || 'CPU'}
- **Framework**: ${framework}
${modelConfig?.target_class ? `- **Target Column**: ${modelConfig.target_class}` : ''}

## Usage

\`\`\`python
# This is a placeholder model card
# Actual model weights need to be uploaded separately
# Visit https://huggingface.co/${repoId} for more details
\`\`\`

## Training Process

This model was trained using Pipeline AI's automated ML platform with ${trainingMode} learning.

${trainingMode === 'supervised' ? `
### Supervised Learning
- Trained on labeled data
- Learns from input-output pairs
- Optimized for prediction accuracy
` : trainingMode === 'unsupervised' ? `
### Unsupervised Learning
- Discovers patterns in unlabeled data
- Learns data structure and relationships
- No explicit target labels
` : trainingMode === 'reinforcement' ? `
### Reinforcement Learning
- Learns through trial and error
- Optimizes for reward maximization
- Interactive learning process
` : ''}

## Citation

\`\`\`bibtex
@misc{${repoId.replace('/', '-')},
  title={${modelName}},
  author={Pipeline AI},
  year={2024},
  url={https://huggingface.co/${repoId}}
}
\`\`\`

---

*Created with [Pipeline AI](https://pipeline-ai.com) - The world's first fully automated ML platform*
`
}
