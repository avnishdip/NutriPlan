'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface WeightChartProps {
  data: { date: string; weight: number }[]
  targetWeight: number
}

export function WeightChart({ data, targetWeight }: WeightChartProps) {
  // Format dates for display
  const formattedData = data.map(d => ({
    ...d,
    displayDate: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }))

  // Calculate Y axis domain with some padding
  const weights = data.map(d => d.weight)
  const minWeight = Math.min(...weights, targetWeight) - 2
  const maxWeight = Math.max(...weights, targetWeight) + 2

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="displayDate" 
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            domain={[minWeight, maxWeight]}
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(value) => `${value}kg`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value: number) => [`${value} kg`, 'Weight']}
            labelFormatter={(label) => label}
          />
          <ReferenceLine 
            y={targetWeight} 
            stroke="#10b981" 
            strokeDasharray="5 5"
            label={{ 
              value: 'Target', 
              position: 'right',
              fill: '#10b981',
              fontSize: 12,
            }}
          />
          <Line 
            type="monotone" 
            dataKey="weight" 
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#3b82f6' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}


