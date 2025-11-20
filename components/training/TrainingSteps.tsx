import { CheckCircle, Circle } from 'lucide-react'

interface TrainingStepsProps {
  currentStage: string
}

export default function TrainingSteps({ currentStage }: TrainingStepsProps) {
  const steps = [
    { id: 'analyzing', label: 'Analyzing Dataset' },
    { id: 'configuring', label: 'Configure Training' },
    { id: 'training', label: 'Training Model' },
    { id: 'completed', label: 'Completed' },
  ]

  const getStepIndex = (stage: string) => {
    return steps.findIndex(s => s.id === stage)
  }

  const currentIndex = getStepIndex(currentStage)

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index <= currentIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {index < currentIndex ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <Circle className="w-6 h-6" />
                )}
              </div>
              <span
                className={`mt-2 text-sm font-medium ${
                  index <= currentIndex ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-4 ${
                  index < currentIndex ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
