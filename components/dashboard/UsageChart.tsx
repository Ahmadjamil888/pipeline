'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface UsageChartProps {
  data: any[]
}

export default function UsageChart({ data }: UsageChartProps) {
  // Group data by date
  const chartData = data.reduce((acc: any[], item) => {
    const date = new Date(item.created_at).toLocaleDateString()
    const existing = acc.find(d => d.date === date)
    if (existing) {
      existing.calls += 1
      existing.tokens += item.total_tokens || 0
    } else {
      acc.push({
        date,
        calls: 1,
        tokens: item.total_tokens || 0
      })
    }
    return acc
  }, []).slice(-7) // Last 7 days

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">API Usage (Last 7 Days)</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Line type="monotone" dataKey="calls" stroke="#2563eb" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
