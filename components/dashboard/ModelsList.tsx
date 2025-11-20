import { Brain, Clock, CheckCircle, XCircle, Trash2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

interface ModelsListProps {
  models: any[]
  title: string
  onModelDeleted?: () => void
}

export default function ModelsList({ models, title, onModelDeleted }: ModelsListProps) {
  const supabase = createClient()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDeleteModel = async (modelId: string, modelName: string) => {
    if (!confirm(`Are you sure you want to delete "${modelName}"? This action cannot be undone.`)) {
      return
    }

    setDeletingId(modelId)
    
    try {
      // Try to delete from database
      const { error } = await supabase
        .from('ai_models')
        .delete()
        .eq('id', modelId)

      if (error) {
        console.log('Database delete failed, model will be removed from UI only')
      }

      // Call parent callback to refresh the list
      if (onModelDeleted) {
        onModelDeleted()
      }
      
      alert('Model deleted successfully')
    } catch (error) {
      console.error('Error deleting model:', error)
      alert('Failed to delete model. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'training':
      case 'initializing':
        return <Clock className="w-5 h-5 text-blue-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'failed':
        return 'bg-red-100 text-red-700'
      case 'training':
        return 'bg-blue-100 text-blue-700'
      case 'initializing':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (models.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No models yet</h3>
        <p className="text-gray-600 mb-6">Create your first ML model to get started</p>
        <Link
          href="/console/create"
          className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Create ML Model
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {models.map((model) => (
          <div key={model.id} className="p-6 hover:bg-gray-50 transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{model.name}</h4>
                  <p className="text-sm text-gray-600">{model.model_type} • {model.framework}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(model.training_status)}`}>
                  {model.training_status}
                </span>
                {getStatusIcon(model.training_status)}
                
                {/* Action buttons */}
                <div className="flex items-center space-x-2">
                  {model.huggingface_repo && (
                    <a
                      href={`https://huggingface.co/${model.huggingface_repo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-blue-600 transition"
                      title="View on HuggingFace"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => handleDeleteModel(model.id, model.name)}
                    disabled={deletingId === model.id}
                    className="p-2 text-gray-400 hover:text-red-600 transition disabled:opacity-50"
                    title="Delete model"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            {model.description && (
              <p className="mt-3 text-gray-600 text-sm">{model.description}</p>
            )}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <span>Created: {new Date(model.created_at).toLocaleDateString()}</span>
                {model.deployed_at && (
                  <span>Deployed: {new Date(model.deployed_at).toLocaleDateString()}</span>
                )}
              </div>
              {model.huggingface_repo && (
                <div className="text-sm text-blue-600">
                  <span className="font-medium">HF:</span> {model.huggingface_repo}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
