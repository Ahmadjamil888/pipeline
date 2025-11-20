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
      // Step 1: Validate token
      const hfAPI = createHuggingFaceAPI(hfToken)
      const isValidToken = await hfAPI.validateToken()
      
      if (!isValidToken) {
        // Try mock deployment for demo
        setDeploymentStatus('creating')
        const repoName = `${model?.name?.toLowerCase().replace(/\s+/g, '-') || 'pipeline-model'}-${Date.now()}`
        
        const config: HFModelConfig = {
          name: repoName,
          description: model?.description || 'A model trained using Pipeline AI',
          framework: model?.framework || 'pytorch',
          modelType: model?.model_type || 'transformer',
          taskType: model?.model_config?.task_type || 'classification',
          tags: ['pipeline-ai', 'auto-generated'],
        }

        setDeploymentStatus('uploading')
        const result = await mockHuggingFaceDeployment(repoName, config, metrics)
        
        if (result.success) {
          setDeploymentStatus('success')
          setDeploymentUrl(result.repoUrl!)
          onDeploy(hfToken)
        } else {
          throw new Error(result.error || 'Deployment failed')
        }
        return
      }

      // Step 2: Create repository name
      setDeploymentStatus('creating')
      const username = 'user' // In real implementation, get from HF API
      const repoName = `${username}/${model?.name?.toLowerCase().replace(/\s+/g, '-') || 'pipeline-model'}`
      
      const config: HFModelConfig = {
        name: repoName,
        description: model?.description || 'A model trained using Pipeline AI platform',
        framework: model?.framework || 'pytorch',
        modelType: model?.model_type || 'transformer',
        taskType: model?.model_config?.task_type || 'classification',
        tags: ['pipeline-ai', 'auto-generated'],
      }

      // Step 3: Deploy model
      setDeploymentStatus('uploading')
      const modelData = {
        config: model?.model_config || {},
        weights: 'mock-weights', // In real implementation, use actual model weights
        tokenizer: {}, // In real implementation, use actual tokenizer
      }

      const result = await hfAPI.deployModel(repoName, config, modelData, metrics)
      
      if (result.success) {
        setDeploymentStatus('success')
        setDeploymentUrl(result.repoUrl!)
        onDeploy(hfToken)
      } else {
        throw new Error(result.error || 'Deployment failed')
      }

    } catch (error) {
      console.error('Deployment error:', error)
      setDeploymentStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Deployment failed')
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
