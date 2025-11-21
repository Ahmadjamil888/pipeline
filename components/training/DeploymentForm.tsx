'use client'

import { useState } from 'react'
import { Rocket, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react'
import { createHuggingFaceAPI, mockHuggingFaceDeployment, type HFModelConfig } from '@/lib/huggingface'

interface DeploymentFormProps {
  onDeploy: (token: string) => void
  model?: any
  metrics?: any
}

export default function DeploymentForm({ onDeploy, model, metrics }: DeploymentFormProps) {
  const [hfToken, setHfToken] = useState('')
  const [showTest, setShowTest] = useState(false)
  const [deploying, setDeploying] = useState(false)
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'validating' | 'creating' | 'uploading' | 'success' | 'error'>('idle')
  const [deploymentUrl, setDeploymentUrl] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleLaunch = async () => {
    if (!hfToken.trim()) {
      alert('Please enter your HuggingFace token')
      return
    }

    setDeploying(true)
    setDeploymentStatus('validating')
    setErrorMessage('')

    try {
      setDeploymentStatus('creating')

      // Call our API route to handle deployment
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: hfToken,
          modelName: model?.name || 'Pipeline Model',
          modelConfig: {
            ...model?.model_config,
            framework: model?.framework,
            model_type: model?.model_type,
            training_mode: model?.training_mode || model?.model_config?.training_mode || 'supervised',
            compute_type: model?.model_config?.compute_type,
            target_class: model?.model_config?.target_class,
          },
          metrics: metrics,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Deployment failed')
      }

      setDeploymentStatus('success')
      setDeploymentUrl(result.repoUrl)
      
      // Show detailed success message
      const uploadInfo = result.uploadResults 
        ? `\n\n📦 Files uploaded: ${result.uploadResults.successful}/${result.uploadResults.total}`
        : ''
      
      setTimeout(() => {
        alert(`✅ Model deployed successfully!${uploadInfo}\n\n🔗 Repository: ${result.repoUrl}\n\n📝 What's included:\n• Model card (README.md)\n• Configuration files\n• Training metadata\n• Placeholder model weights\n\n⚠️ Next steps:\n1. Visit your repository\n2. Upload your trained model weights (.pth file)\n3. The model will be ready for inference!\n\n💡 Tip: Use the HuggingFace Hub Python library to upload your actual trained model weights.`)
      }, 500)
      
      onDeploy(hfToken)

    } catch (error) {
      console.error('Deployment error:', error)
      setDeploymentStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Deployment failed. Please check your token and try again.')
    } finally {
      setDeploying(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Rocket className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Deploy to HuggingFace</h3>
            <p className="text-sm text-gray-600">Push your trained model to HuggingFace Hub</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              HuggingFace Token *
            </label>
            <input
              type="password"
              value={hfToken}
              onChange={(e) => setHfToken(e.target.value)}
              className="form-input"
              placeholder="hf_..."
              disabled={deploying}
            />
            <p className="text-xs text-gray-600 mt-1">
              Get your token from{' '}
              <a
                href="https://huggingface.co/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover-underline"
              >
                HuggingFace Settings
              </a>
            </p>
          </div>

          {/* Deployment Status */}
          {deploymentStatus !== 'idle' && (
            <div className="p-4 border rounded-lg">
              {deploymentStatus === 'validating' && (
                <div className="flex items-center space-x-3">
                  <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  <span className="text-sm text-gray-700">Validating HuggingFace token...</span>
                </div>
              )}
              {deploymentStatus === 'creating' && (
                <div className="flex items-center space-x-3">
                  <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  <span className="text-sm text-gray-700">Creating model repository...</span>
                </div>
              )}
              {deploymentStatus === 'uploading' && (
                <div className="flex items-center space-x-3">
                  <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  <span className="text-sm text-gray-700">Uploading model files...</span>
                </div>
              )}
              {deploymentStatus === 'success' && (
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <span className="text-sm text-green-700 font-medium">Deployment successful!</span>
                    <div className="mt-2">
                      <a
                        href={deploymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 text-blue-600 hover-underline text-sm"
                      >
                        <span>View on HuggingFace</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
              {deploymentStatus === 'error' && (
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <div className="flex-1">
                    <span className="text-sm text-red-700 font-medium">Deployment failed</span>
                    <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={() => setShowTest(!showTest)}
              disabled={deploying}
              className="btn btn-secondary flex-1 disabled-opacity-50"
            >
              Test Model
            </button>
            <button
              onClick={handleLaunch}
              disabled={deploying || !hfToken.trim()}
              className="btn btn-primary flex-1 disabled-opacity-50"
            >
              {deploying ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  <span>Deploying...</span>
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5 mr-2" />
                  <span>Launch & Deploy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {showTest && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Test Your Model</h4>
          <div className="space-y-4">
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Enter test input..."
            />
            <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
              Run Inference
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
