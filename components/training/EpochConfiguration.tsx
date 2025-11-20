import { Play } from 'lucide-react'

interface EpochConfigurationProps {
  config: {
    epochs: number
    batchSize: number
    learningRate: number
  }
  onChange: (config: any) => void
  onStart: () => void
}

export default function EpochConfiguration({ config, onChange, onStart }: EpochConfigurationProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Training Configuration</h3>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Number of Epochs
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={config.epochs}
            onChange={(e) => onChange({ ...config, epochs: parseInt(e.target.value) })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-600 mt-1">Recommended: 10-20</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Batch Size
          </label>
          <input
            type="number"
            min="1"
            max="256"
            value={config.batchSize}
            onChange={(e) => onChange({ ...config, batchSize: parseInt(e.target.value) })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-600 mt-1">Recommended: 16-64</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Learning Rate
          </label>
          <input
            type="number"
            step="0.0001"
            min="0.0001"
            max="0.1"
            value={config.learningRate}
            onChange={(e) => onChange({ ...config, learningRate: parseFloat(e.target.value) })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-600 mt-1">Recommended: 0.001</p>
        </div>
      </div>

      <button
        onClick={onStart}
        className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition text-lg font-semibold"
      >
        <Play className="w-5 h-5" />
        <span>Start Training</span>
      </button>
    </div>
  )
}
