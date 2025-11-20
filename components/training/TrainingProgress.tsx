'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Zap, TrendingUp } from 'lucide-react'

interface TrainingProgressProps {
  job: any
  epochs: any[]
  config: any
}

export default function TrainingProgress({ job, epochs, config }: TrainingProgressProps) {
  const chartData = epochs.map(epoch => ({
    epoch: epoch.epoch_number,
    loss: epoch.loss,
    accuracy: epoch.accuracy * 100,
    valLoss: epoch.validation_loss,
    valAccuracy: epoch.validation_accuracy * 100,
  }))

  const latestEpoch = epochs[epochs.length - 1]

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Training in Progress</h3>
            <p className="text-sm text-gray-600">
              Epoch {job?.current_epoch || 0} of {config.epochs}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">{job?.progress || 0}%</p>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${job?.progress || 0}%` }}
          />
        </div>
      </div>

      {/* Current Metrics */}
      {latestEpoch && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">Loss</p>
            <p className="text-2xl font-bold text-gray-900">{latestEpoch.loss.toFixed(4)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">Accuracy</p>
            <p className="text-2xl font-bold text-gray-900">{(latestEpoch.accuracy * 100).toFixed(2)}%</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">Val Loss</p>
            <p className="text-2xl font-bold text-gray-900">{latestEpoch.validation_loss.toFixed(4)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">Val Accuracy</p>
            <p className="text-2xl font-bold text-gray-900">{(latestEpoch.validation_accuracy * 100).toFixed(2)}%</p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Loss Over Time</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="epoch" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="loss" stroke="#2563eb" strokeWidth={2} name="Training Loss" />
              <Line type="monotone" dataKey="valLoss" stroke="#dc2626" strokeWidth={2} name="Validation Loss" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Accuracy Over Time</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="epoch" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="accuracy" stroke="#16a34a" strokeWidth={2} name="Training Accuracy" />
              <Line type="monotone" dataKey="valAccuracy" stroke="#ea580c" strokeWidth={2} name="Validation Accuracy" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sample Models Preview */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Model Checkpoints</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">Checkpoint {i}</p>
              <p className="text-xs text-gray-600">Epoch {Math.floor((config.epochs / 4) * i)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
