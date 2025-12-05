import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Camera, Flame } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { FoodLogForm } from './food-log-form'
import { FoodLogCard } from './food-log-card'

export default async function FoodLogPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get profile for targets
  const { data: profile } = await supabase
    .from('profiles')
    .select('daily_calories_target, daily_protein_g, daily_carbs_g, daily_fat_g')
    .eq('id', user?.id)
    .single()

  // Get today's food logs
  const today = new Date().toISOString().split('T')[0]
  const { data: todayLogs } = await supabase
    .from('food_logs')
    .select('*')
    .eq('user_id', user?.id)
    .gte('logged_at', `${today}T00:00:00`)
    .lt('logged_at', `${today}T23:59:59`)
    .order('logged_at', { ascending: false })

  // Get recent logs (last 7 days)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const { data: recentLogs } = await supabase
    .from('food_logs')
    .select('*')
    .eq('user_id', user?.id)
    .gte('logged_at', weekAgo.toISOString())
    .order('logged_at', { ascending: false })
    .limit(20)

  // Calculate today's totals
  const todayTotals = (todayLogs || []).reduce(
    (acc, log) => ({
      calories: acc.calories + (log.calories || 0),
      protein: acc.protein + (log.protein_g || 0),
      carbs: acc.carbs + (log.carbs_g || 0),
      fat: acc.fat + (log.fat_g || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  const calorieTarget = profile?.daily_calories_target || 2000
  const calorieProgress = Math.min((todayTotals.calories / calorieTarget) * 100, 100)

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Food Journal</h1>
        {/* Today's Progress */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Today&apos;s Intake</h2>
            <span className="text-sm text-gray-500">{formatDate(new Date())}</span>
          </div>

          {/* Calorie Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="font-medium text-gray-900">{todayTotals.calories} / {calorieTarget} kcal</span>
              </div>
              <span className="text-sm text-gray-500">{Math.round(calorieProgress)}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all"
                style={{ width: `${calorieProgress}%` }}
              />
            </div>
          </div>

          {/* Macro Progress */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-blue-600">{Math.round(todayTotals.protein)}g</p>
              <p className="text-xs text-gray-500">Protein</p>
              <p className="text-xs text-gray-400">/ {profile?.daily_protein_g || 150}g</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-amber-600">{Math.round(todayTotals.carbs)}g</p>
              <p className="text-xs text-gray-500">Carbs</p>
              <p className="text-xs text-gray-400">/ {profile?.daily_carbs_g || 200}g</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-purple-600">{Math.round(todayTotals.fat)}g</p>
              <p className="text-xs text-gray-500">Fat</p>
              <p className="text-xs text-gray-400">/ {profile?.daily_fat_g || 70}g</p>
            </div>
          </div>
        </div>

        {/* Add Food Form */}
        <FoodLogForm />

        {/* Today's Logs */}
        {todayLogs && todayLogs.length > 0 && (
          <div className="mb-8">
            <h2 className="font-semibold text-gray-900 mb-4">Today</h2>
            <div className="space-y-3">
              {todayLogs.map((log) => (
                <FoodLogCard key={log.id} log={log} />
              ))}
            </div>
          </div>
        )}

        {/* Recent Logs */}
        {recentLogs && recentLogs.length > 0 && (
          <div>
            <h2 className="font-semibold text-gray-900 mb-4">Recent</h2>
            <div className="space-y-3">
              {recentLogs
                .filter(log => !log.logged_at.startsWith(today))
                .slice(0, 10)
                .map((log) => (
                  <FoodLogCard key={log.id} log={log} showDate />
                ))}
            </div>
          </div>
        )}
    </main>
  )
}


