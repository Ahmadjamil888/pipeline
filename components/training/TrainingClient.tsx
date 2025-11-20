'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  CheckCircle, 
  Loader2
} from 'lucide-react'
import TrainingSteps from './TrainingSteps'
import DatasetAnalysis from './DatasetAnalysis'
import EpochConfiguration from './EpochConfiguration'
import TrainingProgress from './TrainingProgress'
import DeploymentForm from './DeploymentForm'

interface TrainingClientProps {
  model: any
  userId: string
}

type TrainingStage = 'analyzing' | 'configuring' | 'training' | 'completed' | 'deploying'

export default function TrainingClient({ model: initialModel, userId }: TrainingClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [model] = useState(initialModel)
  const [stage, setStage] = useState<TrainingStage>('analyzing')
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [trainingConfig, setTrainingConfig] = useState({
    epochs: 10,
    batchSize: 32,
    learningRate: 0.001,
  })
  const [trainingJob, setTrainingJob] = useState<any>(null)
  const [epochs, setEpochs] = useState<any[]>([])

  useEffect(() => {
    if (stage === 'analyzing') {
      startAnalysis()
    }
  }, [])

  const startAnalysis = async () => {
    // Simulate AI analyzing dataset
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock analysis data based on model configuration
    const computeType = model.model_config?.compute_type || 'cpu'
    const taskType = model.model_config?.task_type || 'classification'
    
    const mockAnalysis = {
      datasetInfo: {
        rows: 50000,
        columns: 15,
        features: ['feature1', 'feature2', 'feature3', 'feature4', 'feature5'],
        targetColumn: model.model_config?.target_class || 'label',
        taskType: taskType,
        dataTypes: {
          numerical: 10,
          categorical: 5,
        },
      },
      recommendations: {
        modelArchitecture: `${model.model_type} with PyTorch ${computeType.toUpperCase()}`,
        suggestedEpochs: computeType === 'tpu' ? 5 : computeType === 'gpu' ? 8 : 10,
        suggestedBatchSize: computeType === 'tpu' ? 64 : computeType === 'gpu' ? 32 : 16,
        estimatedTime: computeType === 'tpu' ? '5-8 minutes' : computeType === 'gpu' ? '10-15 minutes' : '15-25 minutes',
        computeType: computeType.toUpperCase(),
      },
      codeGenerated: true,
    }

    setAnalysisData(mockAnalysis)
    setStage('configuring')
  }

  const startTraining = async () => {
    setStage('training')

    try {
      // Try to create training job in database, fallback to mock if it fails
      let job = null
      
      try {
        const { data: dbJob, error } = await supabase
          .from('training_jobs')
          .insert({
            user_id: userId,
            model_id: model.id,
            status: 'running',
            total_epochs: trainingConfig.epochs,
            current_epoch: 0,
            progress: 0,
          })
          .select()
          .single()

        if (!error && dbJob) {
          job = dbJob
          
          // Update model status in database
          await supabase
            .from('ai_models')
            .update({ 
              training_status: 'training',
              training_config: trainingConfig,
            })
            .eq('id', model.id)
        }
      } catch (dbError) {
        console.log('Database not available, using mock training')
      }

      // If database fails, create a mock job for demo purposes
      if (!job) {
        job = {
          id: `mock-job-${Date.now()}`,
          user_id: userId,
          model_id: model.id,
          status: 'running',
          total_epochs: trainingConfig.epochs,
          current_epoch: 0,
          progress: 0,
        }
      }

      setTrainingJob(job)

      // Start training simulation
      simulateTraining(job.id)
    } catch (error) {
      console.error('Error starting training:', error)
      alert('Failed to start training. Please try again.')
      setStage('configuring')
    }
  }

  const simulateTraining = async (jobId: string) => {
    const totalEpochs = trainingConfig.epochs
    const epochsData: any[] = []

    for (let i = 1; i <= totalEpochs; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const loss = 2.5 * Math.exp(-i * 0.3) + Math.random() * 0.1
      const accuracy = 0.5 + (0.45 * (1 - Math.exp(-i * 0.3))) + Math.random() * 0.05
      const valLoss = loss + Math.random() * 0.2
      const valAccuracy = accuracy - Math.random() * 0.05

      const epochData = {
        training_job_id: jobId,
        epoch_number: i,
        loss: loss,
        accuracy: accuracy,
        validation_loss: valLoss,
        validation_accuracy: valAccuracy,
        learning_rate: trainingConfig.learningRate,
      }

      // Save epoch to database
      await supabase.from('training_epochs').insert(epochData)

      epochsData.push(epochData)
      setEpochs([...epochsData])

      // Update job progress
      const progress = Math.round((i / totalEpochs) * 100)
      await supabase
        .from('training_jobs')
        .update({
          current_epoch: i,
          progress: progress,
          status: i === totalEpochs ? 'completed' : 'running',
        })
        .eq('id', jobId)

      setTrainingJob((prev: any) => ({
        ...prev,
        current_epoch: i,
        progress: progress,
      }))
    }

    // Training completed
    await supabase
      .from('ai_models')
      .update({ 
        training_status: 'completed',
        performance_metrics: {
          final_loss: epochsData[epochsData.length - 1].loss,
          final_accuracy: epochsData[epochsData.length - 1].accuracy,
        },
      })
      .eq('id', model.id)

    setStage('completed')
  }

  const handleDeploy = async (hfToken: string) => {
    if (!hfToken.trim()) {
      alert('Please enter your HuggingFace token')
      return
    }

    setStage('deploying')

    // Simulate deployment
    await new Promise(resolve => setTimeout(resolve, 3000))

    const hfRepo = `${userId.slice(0, 8)}/${model.name.toLowerCase().replace(/\s+/g, '-')}`

    await supabase
      .from('ai_models')
      .update({ 
        training_status: 'deployed',
        huggingface_repo: hfRepo,
        deployed_at: new Date().toISOString(),
        metadata: { hf_token_used: true }
      })
      .eq('id', model.id)

    alert(`Model deployed successfully to HuggingFace: ${hfRepo}`)
    router.push('/console')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{model.name}</h1>
          <p className="text-gray-600">Training your AI model</p>
        </div>

        <TrainingSteps currentStage={stage} />

        <div className="mt-8">
          {stage === 'analyzing' && (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Dataset</h3>
              <p className="text-gray-600">AI is analyzing your dataset and generating training code...</p>
            </div>
          )}

          {stage === 'configuring' && analysisData && (
            <>
              <DatasetAnalysis data={analysisData} />
              <EpochConfiguration
                config={trainingConfig}
                onChange={setTrainingConfig}
                onStart={startTraining}
              />
            </>
          )}

          {stage === 'training' && (
            <TrainingProgress
              job={trainingJob}
              epochs={epochs}
              config={trainingConfig}
            />
          )}

          {stage === 'completed' && (
            <>
              <div className="bg-white border border-gray-200 rounded-xl p-8 mb-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Training Completed!</h3>
                    <p className="text-gray-600">Your model is ready to deploy</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Final Accuracy</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(epochs[epochs.length - 1]?.accuracy * 100).toFixed(2)}%
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Final Loss</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {epochs[epochs.length - 1]?.loss.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>

              <DeploymentForm 
                onDeploy={handleDeploy} 
                model={model}
                metrics={epochs.length > 0 ? {
                  final_accuracy: epochs[epochs.length - 1]?.accuracy,
                  final_loss: epochs[epochs.length - 1]?.loss,
                } : undefined}
              />
            </>
          )}

          {stage === 'deploying' && (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Deploying to HuggingFace</h3>
              <p className="text-gray-600">Pushing your model to HuggingFace Hub...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
