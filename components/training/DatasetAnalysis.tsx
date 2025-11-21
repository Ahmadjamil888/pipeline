import { Database, Code, CheckCircle } from 'lucide-react'

interface DatasetAnalysisProps {
  data: any
}

export default function DatasetAnalysis({ data }: DatasetAnalysisProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Dataset Analysis Complete</h3>
          <p className="text-sm text-gray-600">AI has analyzed your dataset and generated training code</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Database className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">Dataset Information</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Rows:</span>
              <span className="font-semibold text-gray-900">{data.datasetInfo.rows.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Columns:</span>
              <span className="font-semibold text-gray-900">{data.datasetInfo.columns}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Numerical Features:</span>
              <span className="font-semibold text-gray-900">{data.datasetInfo.dataTypes.numerical}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Categorical Features:</span>
              <span className="font-semibold text-gray-900">{data.datasetInfo.dataTypes.categorical}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Target Column:</span>
              <span className="font-semibold text-gray-900">{data.datasetInfo.targetColumn}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Task Type:</span>
              <span className="font-semibold text-gray-900 capitalize">{data.datasetInfo.taskType}</span>
            </div>
            {data.datasetInfo.trainingMode && (
              <div className="flex justify-between">
                <span className="text-gray-600">Training Mode:</span>
                <span className="font-semibold text-gray-900 capitalize">{data.datasetInfo.trainingMode}</span>
              </div>
            )}
            {data.datasetInfo.creationMode && (
              <div className="flex justify-between">
                <span className="text-gray-600">Creation Mode:</span>
                <span className="font-semibold text-gray-900 capitalize">{data.datasetInfo.creationMode === 'from-scratch' ? 'From Scratch' : 'Fine-tune'}</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Code className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">AI Recommendations</h4>
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-gray-600 block mb-1">Model Architecture:</span>
              <span className="text-sm font-medium text-gray-900">{data.recommendations.modelArchitecture}</span>
            </div>
            <div>
              <span className="text-gray-600 block mb-1">Suggested Epochs:</span>
              <span className="text-sm font-medium text-gray-900">{data.recommendations.suggestedEpochs}</span>
            </div>
            <div>
              <span className="text-gray-600 block mb-1">Suggested Batch Size:</span>
              <span className="text-sm font-medium text-gray-900">{data.recommendations.suggestedBatchSize}</span>
            </div>
            <div>
              <span className="text-gray-600 block mb-1">Training Mode:</span>
              <span className="text-sm font-medium text-gray-900">{data.recommendations.trainingMode}</span>
            </div>
            <div>
              <span className="text-gray-600 block mb-1">Compute Type:</span>
              <span className="text-sm font-medium text-gray-900">{data.recommendations.computeType}</span>
            </div>
            <div>
              <span className="text-gray-600 block mb-1">Estimated Training Time:</span>
              <span className="text-sm font-medium text-gray-900">{data.recommendations.estimatedTime}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Code Generated:</strong> AI has automatically generated optimized PyTorch training code based on your dataset characteristics.
        </p>
      </div>
    </div>
  )
}
