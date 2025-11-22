'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, ArrowRight, Upload, Link as LinkIcon, File, Cpu, Zap, CheckCircle } from 'lucide-react'

export default function CreateModelPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    creationMode: 'fine-tune', // 'fine-tune' or 'from-scratch'
    trainingMode: 'supervised', // 'supervised', 'unsupervised', 'reinforcement'
    modelDescription: '', // AI prompt for from-scratch
    modelType: '',
    taskType: '',
    targetClass: '',
    framework: 'pytorch',
    computeType: 'cpu',
    datasetSource: '',
    datasetUrl: '',
    datasetFile: null as File | null,
    baseModel: '',
    baseModelUrl: '',
    baseModelFile: null as File | null,
    customModelUpload: false,
    autoFindDataset: false,
  })
  
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileUpload = (file: File, type: 'dataset' | 'model') => {
    if (type === 'dataset') {
      setFormData({ ...formData, datasetFile: file })
    } else {
      setFormData({ ...formData, baseModelFile: file })
    }
    
    // Simulate upload progress
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Create model record (with fallback for demo)
      let model = null
      
      const modelData = {
        user_id: user?.id || 'demo-user',
        name: formData.name,
        description: formData.description,
        model_type: formData.modelType || (formData.creationMode === 'from-scratch' ? 'custom' : 'transformer'),
        framework: formData.framework,
        base_model: formData.creationMode === 'fine-tune' ? formData.baseModel : null,
        dataset_source: formData.autoFindDataset ? 'auto' : formData.datasetSource,
        dataset_name: formData.datasetUrl,
        training_status: 'pending',
        training_mode: formData.creationMode === 'from-scratch' ? formData.trainingMode : 'fine_tuning',
        model_config: {
          creation_mode: formData.creationMode,
          training_mode: formData.trainingMode,
          task_type: formData.taskType,
          target_class: formData.targetClass,
          compute_type: formData.computeType,
          custom_model_upload: formData.customModelUpload,
          auto_find_dataset: formData.autoFindDataset,
        },
        training_config: {},
      }
      
      try {
        if (user) {
          const { data: dbModel, error } = await supabase
            .from('ai_models')
            .insert(modelData)
            .select()
            .single()

          if (!error && dbModel) {
            model = dbModel
          }
        }
      } catch (dbError) {
        console.log('Database not available, using mock model')
      }

      // If database fails, create a mock model for demo
      if (!model) {
        model = {
          id: `mock-model-${Date.now()}`,
          ...modelData,
        }
      }

      // Redirect to training page
      router.push(`/console/train/${model.id}`)
    } catch (error) {
      console.error('Error creating model:', error)
      alert('Failed to create model. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create ML Model</h1>
          <p className="text-gray-600 mb-8">Fill in the details to train your custom AI model</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Creation Mode */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Creation Mode *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, creationMode: 'fine-tune' })}
                  className={`p-4 border rounded-lg text-left transition ${
                    formData.creationMode === 'fine-tune' 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-300 hover-bg-gray-50'
                  }`}
                >
                  <div className="font-semibold text-gray-900 mb-1">Fine-tune Existing Model</div>
                  <div className="text-sm text-gray-600">Start with a pre-trained model and adapt it to your data</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, creationMode: 'from-scratch' })}
                  className={`p-4 border rounded-lg text-left transition ${
                    formData.creationMode === 'from-scratch' 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-300 hover-bg-gray-50'
                  }`}
                >
                  <div className="font-semibold text-gray-900 mb-1">Create from Scratch</div>
                  <div className="text-sm text-gray-600">Build and train a completely new model architecture</div>
                </button>
              </div>
            </div>

            {/* Training Mode (for from-scratch) */}
            {formData.creationMode === 'from-scratch' && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Training Mode *
                </label>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, trainingMode: 'supervised' })}
                    className={`w-full p-4 border rounded-lg text-left transition ${
                      formData.trainingMode === 'supervised' 
                        ? 'border-blue-600 bg-blue-50' 
                        : 'border-gray-300 hover-bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-gray-900 mb-1">Supervised Learning</div>
                        <div className="text-sm text-gray-600">
                          Train on labeled data with input-output pairs. Best for classification, regression, and instruction-following tasks.
                        </div>
                      </div>
                      {formData.trainingMode === 'supervised' && (
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 ml-2" />
                      )}
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, trainingMode: 'unsupervised' })}
                    className={`w-full p-4 border rounded-lg text-left transition ${
                      formData.trainingMode === 'unsupervised' 
                        ? 'border-blue-600 bg-blue-50' 
                        : 'border-gray-300 hover-bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-gray-900 mb-1">Unsupervised Learning</div>
                        <div className="text-sm text-gray-600">
                          Discover patterns in unlabeled data. Best for clustering, anomaly detection, and feature learning.
                        </div>
                      </div>
                      {formData.trainingMode === 'unsupervised' && (
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 ml-2" />
                      )}
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, trainingMode: 'reinforcement' })}
                    className={`w-full p-4 border rounded-lg text-left transition ${
                      formData.trainingMode === 'reinforcement' 
                        ? 'border-blue-600 bg-blue-50' 
                        : 'border-gray-300 hover-bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-gray-900 mb-1">Reinforcement Learning (RLHF)</div>
                        <div className="text-sm text-gray-600">
                          Learn through trial and error with rewards. Best for decision-making, game AI, and preference optimization.
                        </div>
                      </div>
                      {formData.trainingMode === 'reinforcement' && (
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 ml-2" />
                      )}
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* AI Model Description (for from-scratch) */}
            {formData.creationMode === 'from-scratch' && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  🤖 Describe Your Model to AI *
                </label>
                <textarea
                  required
                  value={formData.modelDescription}
                  onChange={(e) => setFormData({ ...formData, modelDescription: e.target.value })}
                  className="form-textarea"
                  rows={4}
                  placeholder="Example: I want to build a sentiment analysis model that can classify movie reviews as positive or negative. It should be accurate and fast, suitable for real-time applications..."
                />
                <p className="text-xs text-gray-600 mt-1">
                  💡 Describe what you want your model to do. AI will analyze and suggest the best configuration.
                </p>
              </div>
            )}

            {/* Model Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Model Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
                placeholder="My Awesome Model"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Describe what your model does..."
              />
            </div>

            {/* Model Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Model Type *
              </label>
              <select
                required
                value={formData.modelType}
                onChange={(e) => setFormData({ ...formData, modelType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select model type</option>
                <option value="transformer">Transformer</option>
                <option value="lstm">LSTM</option>
                <option value="cnn">CNN</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {/* Task Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Task Type *
              </label>
              <select
                required
                value={formData.taskType}
                onChange={(e) => setFormData({ ...formData, taskType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select task type</option>
                <option value="classification">Classification</option>
                <option value="regression">Regression</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Target Class (for classification/regression) */}
            {(formData.taskType === 'classification' || formData.taskType === 'regression') && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Target Column *
                </label>
                <input
                  type="text"
                  required
                  value={formData.targetClass}
                  onChange={(e) => setFormData({ ...formData, targetClass: e.target.value })}
                  className="form-input"
                  placeholder={formData.taskType === 'classification' ? 'e.g., label, category, class' : 'e.g., price, score, value'}
                />
                <p className="text-xs text-gray-600 mt-1">
                  {formData.taskType === 'classification' 
                    ? 'Column containing class labels' 
                    : 'Column containing numerical values to predict'
                  }
                </p>
              </div>
            )}

            {/* Compute Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Compute Type *
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, computeType: 'cpu' })}
                  className={`p-4 border rounded-lg text-center transition ${
                    formData.computeType === 'cpu' 
                      ? 'border-blue-600 bg-blue-50 text-blue-600' 
                      : 'border-gray-300 hover-bg-gray-50'
                  }`}
                >
                  <Cpu className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">CPU</div>
                  <div className="text-xs text-gray-600">Standard training</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, computeType: 'gpu' })}
                  className={`p-4 border rounded-lg text-center transition ${
                    formData.computeType === 'gpu' 
                      ? 'border-blue-600 bg-blue-50 text-blue-600' 
                      : 'border-gray-300 hover-bg-gray-50'
                  }`}
                >
                  <Zap className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">GPU</div>
                  <div className="text-xs text-gray-600">Faster training</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, computeType: 'tpu' })}
                  className={`p-4 border rounded-lg text-center transition ${
                    formData.computeType === 'tpu' 
                      ? 'border-blue-600 bg-blue-50 text-blue-600' 
                      : 'border-gray-300 hover-bg-gray-50'
                  }`}
                >
                  <Zap className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">TPU</div>
                  <div className="text-xs text-gray-600">Ultra fast</div>
                </button>
              </div>
            </div>

            {/* Dataset Source */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Dataset Source *
              </label>
              
              {formData.creationMode === 'from-scratch' && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.autoFindDataset}
                      onChange={(e) => setFormData({ ...formData, autoFindDataset: e.target.checked })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-medium text-blue-900">
                      🤖 Auto-find and optimize dataset using AI
                    </span>
                  </label>
                  <p className="text-xs text-blue-700 mt-1 ml-6">
                    AI will search for the best dataset, clean it, and prepare it for training
                  </p>
                </div>
              )}
              
              <select
                required={!formData.autoFindDataset}
                value={formData.datasetSource}
                onChange={(e) => setFormData({ ...formData, datasetSource: e.target.value })}
                className="form-select"
                disabled={formData.autoFindDataset}
              >
                <option value="">
                  {formData.autoFindDataset ? 'AI will find the best dataset' : 'Select source'}
                </option>
                <option value="huggingface">HuggingFace Dataset</option>
                <option value="kaggle">Kaggle Dataset</option>
                <option value="upload">Upload Custom Dataset</option>
                <option value="url">Dataset URL</option>
              </select>
            </div>

            {/* Dataset URL/Name */}
            {(formData.datasetSource === 'huggingface' || formData.datasetSource === 'kaggle') && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Dataset Name *
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.datasetUrl}
                    onChange={(e) => setFormData({ ...formData, datasetUrl: e.target.value })}
                    className="form-input pl-10"
                    placeholder={
                      formData.datasetSource === 'huggingface'
                        ? 'e.g., imdb, squad, glue'
                        : 'e.g., username/dataset-name'
                    }
                  />
                </div>
              </div>
            )}

            {/* Dataset URL */}
            {formData.datasetSource === 'url' && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Dataset URL *
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    required
                    value={formData.datasetUrl}
                    onChange={(e) => setFormData({ ...formData, datasetUrl: e.target.value })}
                    className="form-input pl-10"
                    placeholder="https://example.com/dataset.csv"
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Supported formats: CSV, JSON, Parquet
                </p>
              </div>
            )}

            {/* Dataset File Upload */}
            {formData.datasetSource === 'upload' && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Upload Dataset *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover-bg-gray-50 transition">
                  <input
                    type="file"
                    accept=".csv,.json,.parquet,.xlsx"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file, 'dataset')
                    }}
                    className="hidden"
                    id="dataset-upload"
                  />
                  <label htmlFor="dataset-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900">
                      {formData.datasetFile ? formData.datasetFile.name : 'Click to upload dataset'}
                    </p>
                    <p className="text-xs text-gray-600">
                      CSV, JSON, Parquet, Excel files up to 100MB
                    </p>
                  </label>
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-4">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{uploadProgress}% uploaded</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Base Model Options (only for fine-tune mode) */}
            {formData.creationMode === 'fine-tune' && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Base Model (Optional)
              </label>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="pretrained-model"
                    name="modelSource"
                    checked={!formData.customModelUpload}
                    onChange={() => setFormData({ ...formData, customModelUpload: false })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <label htmlFor="pretrained-model" className="text-sm font-medium text-gray-900">
                    Use Pre-trained Model
                  </label>
                </div>
                
                {!formData.customModelUpload && (
                  <div className="ml-7 space-y-4">
                    <input
                      type="text"
                      value={formData.baseModel}
                      onChange={(e) => setFormData({ ...formData, baseModel: e.target.value })}
                      className="form-input"
                      placeholder="e.g., bert-base-uncased, gpt2, resnet50"
                    />
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        HuggingFace Model URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={formData.baseModelUrl}
                        onChange={(e) => setFormData({ ...formData, baseModelUrl: e.target.value })}
                        className="form-input"
                        placeholder="https://huggingface.co/model-name"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="custom-model"
                    name="modelSource"
                    checked={formData.customModelUpload}
                    onChange={() => setFormData({ ...formData, customModelUpload: true })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <label htmlFor="custom-model" className="text-sm font-medium text-gray-900">
                    Upload Custom Model
                  </label>
                </div>

                {formData.customModelUpload && (
                  <div className="ml-7">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover-bg-gray-50 transition">
                      <input
                        type="file"
                        accept=".pth,.pt,.h5,.pb,.onnx,.safetensors"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(file, 'model')
                        }}
                        className="hidden"
                        id="model-upload"
                      />
                      <label htmlFor="model-upload" className="cursor-pointer">
                        <File className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900">
                          {formData.baseModelFile ? formData.baseModelFile.name : 'Upload model file'}
                        </p>
                        <p className="text-xs text-gray-600">
                          PyTorch (.pth, .pt), TensorFlow (.h5, .pb), ONNX, SafeTensors
                        </p>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
            )}

            {/* From Scratch Info */}
            {formData.creationMode === 'from-scratch' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-green-900 mb-1">
                      Building from Scratch with {formData.trainingMode === 'supervised' ? 'Supervised' : formData.trainingMode === 'unsupervised' ? 'Unsupervised' : 'Reinforcement'} Learning
                    </div>
                    <div className="text-sm text-green-700">
                      {formData.trainingMode === 'supervised' && (
                        <>
                          <p className="mb-2">Your model will learn from labeled examples:</p>
                          <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>Instruction following and task completion</li>
                            <li>Pattern recognition from input-output pairs</li>
                            <li>Supervised fine-tuning (SFT) for optimal performance</li>
                            <li>Safety alignment and refusal training</li>
                          </ul>
                        </>
                      )}
                      {formData.trainingMode === 'unsupervised' && (
                        <>
                          <p className="mb-2">Your model will discover patterns without labels:</p>
                          <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>Automatic feature extraction and clustering</li>
                            <li>Anomaly detection and outlier identification</li>
                            <li>Dimensionality reduction and representation learning</li>
                            <li>Self-supervised pre-training</li>
                          </ul>
                        </>
                      )}
                      {formData.trainingMode === 'reinforcement' && (
                        <>
                          <p className="mb-2">Your model will learn through rewards (RLHF):</p>
                          <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>Reinforcement Learning from Human Feedback</li>
                            <li>Reward model training from preferences</li>
                            <li>Policy optimization for better responses</li>
                            <li>Continuous improvement through interaction</li>
                          </ul>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                <span>{loading ? 'Creating...' : 'Train & Deploy'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
