import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { TrendingUp, TrendingDown, Target, Scale } from 'lucide-react'
import { WeightChart } from './weight-chart'
import { WeightLogForm } from './weight-log-form'
import { formatDate } from '@/lib/utils'

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('current_weight_kg, target_weight_kg, primary_goal')
    .eq('id', user?.id)
    .single()

  // Get weight logs (last 90 days)
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 90)
  
  const { data: weightLogs } = await supabase
    .from('weight_logs')
    .select('*')
    .eq('user_id', user?.id)
    .gte('logged_at', startDate.toISOString().split('T')[0])
    .order('logged_at', { ascending: true })

  // Calculate stats
  const currentWeight = profile?.current_weight_kg || 0
  const targetWeight = profile?.target_weight_kg || 0
  const weightDiff = currentWeight - targetWeight
  const isLosingGoal = profile?.primary_goal === 'lose_weight'
  
  // Progress calculation
  const firstLog = weightLogs?.[0]
  const startingWeight = firstLog?.weight_kg || currentWeight
  const totalChange = currentWeight - startingWeight
  const progressToGoal = startingWeight !== targetWeight 
    ? Math.abs((startingWeight - currentWeight) / (startingWeight - targetWeight)) * 100
    : 0

  // Format data for chart
  const chartData = (weightLogs || []).map(log => ({
    date: log.logged_at,
    weight: log.weight_kg,
  }))

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Progress</h1>
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Scale className="w-4 h-4" />
              <span className="text-sm">Current</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{currentWeight} kg</p>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Target className="w-4 h-4" />
              <span className="text-sm">Target</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{targetWeight} kg</p>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              {totalChange <= 0 ? (
                <TrendingDown className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingUp className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm">Change</span>
            </div>
            <p className={`text-2xl font-bold ${totalChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalChange > 0 ? '+' : ''}{totalChange.toFixed(1)} kg
            </p>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <span className="text-sm">To Goal</span>
            </div>
            <p className={`text-2xl font-bold ${Math.abs(weightDiff) < 1 ? 'text-green-600' : 'text-gray-900'}`}>
              {Math.abs(weightDiff).toFixed(1)} kg
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-900">Progress to Goal</span>
            <span className="text-sm text-gray-500">{Math.min(progressToGoal, 100).toFixed(0)}%</span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all"
              style={{ width: `${Math.min(progressToGoal, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
            <span>Started: {startingWeight} kg</span>
            <span>Target: {targetWeight} kg</span>
          </div>
        </div>

        {/* Log Weight */}
        <WeightLogForm currentWeight={currentWeight} />

        {/* Weight Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Weight History</h2>
          {chartData.length > 1 ? (
            <WeightChart data={chartData} targetWeight={targetWeight} />
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Scale className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Log your weight regularly to see your progress chart</p>
            </div>
          )}
        </div>

        {/* Recent Logs */}
        {weightLogs && weightLogs.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Recent Logs</h2>
            <div className="space-y-2">
              {[...weightLogs].reverse().slice(0, 10).map((log, index, arr) => {
                const prevLog = arr[index + 1]
                const change = prevLog ? log.weight_kg - prevLog.weight_kg : 0
                
                return (
                  <div key={log.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{log.weight_kg} kg</p>
                      <p className="text-sm text-gray-500">{formatDate(log.logged_at)}</p>
                    </div>
                    {change !== 0 && (
                      <span className={`text-sm font-medium ${change < 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {change > 0 ? '+' : ''}{change.toFixed(1)} kg
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
    </main>
  )
}


