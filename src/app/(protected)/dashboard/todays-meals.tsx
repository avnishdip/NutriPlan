import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Calendar, Utensils, Plus, Clock, Flame, Check } from 'lucide-react'

const mealTypeLabels: Record<string, { label: string; emoji: string }> = {
  breakfast: { label: 'Breakfast', emoji: '🌅' },
  lunch: { label: 'Lunch', emoji: '☀️' },
  dinner: { label: 'Dinner', emoji: '🌙' },
  snack: { label: 'Snack', emoji: '🍎' },
}

export async function TodaysMeals() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get active meal plan
  const { data: mealPlan } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('user_id', user?.id)
    .eq('is_active', true)
    .single()

  if (!mealPlan) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Today&apos;s Meals</h2>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Utensils className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No meal plan yet</h3>
          <p className="text-gray-500 mb-6">Generate your first AI-powered meal plan to get started.</p>
          <Link
            href="/meal-plans/generate"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            Generate Meal Plan
          </Link>
        </div>
      </div>
    )
  }

  // Get today's meals
  const today = new Date().toISOString().split('T')[0]
  const { data: todayItems } = await supabase
    .from('meal_plan_items')
    .select(`
      *,
      recipe:recipes(*)
    `)
    .eq('meal_plan_id', mealPlan.id)
    .eq('plan_date', today)
    .order('meal_type', { ascending: true })

  const completedCount = todayItems?.filter(i => i.is_completed).length || 0
  const totalCalories = todayItems?.reduce((sum, item) => sum + (item.calories || 0), 0) || 0

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Today&apos;s Meals</h2>
            <p className="text-sm text-gray-500">
              {completedCount}/{todayItems?.length || 0} completed • {totalCalories} kcal
            </p>
          </div>
        </div>
        <Link 
          href={`/meal-plans/${mealPlan.id}`}
          className="text-green-600 font-medium hover:text-green-700"
        >
          View full plan
        </Link>
      </div>

      {todayItems && todayItems.length > 0 ? (
        <div className="space-y-3">
          {todayItems.map((item) => {
            const recipe = item.recipe
            if (!recipe) return null
            
            const mealInfo = mealTypeLabels[item.meal_type] || { label: item.meal_type, emoji: '🍽️' }
            const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)

            return (
              <Link
                key={item.id}
                href={`/meal-plans/${mealPlan.id}`}
                className={`block p-4 rounded-xl border transition-all ${
                  item.is_completed 
                    ? 'bg-gray-50 border-gray-100' 
                    : 'border-gray-100 hover:border-green-200 hover:bg-green-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Status */}
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    item.is_completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300'
                  }`}>
                    {item.is_completed && <Check className="w-4 h-4" />}
                  </div>

                  {/* Meal Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span>{mealInfo.emoji}</span>
                      <span className="text-xs font-medium text-gray-500 uppercase">{mealInfo.label}</span>
                    </div>
                    <h3 className={`font-semibold text-gray-900 truncate ${item.is_completed ? 'line-through opacity-60' : ''}`}>
                      {recipe.name}
                    </h3>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {totalTime}m
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4" />
                      {recipe.calories} kcal
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No meals scheduled for today.</p>
          <Link
            href={`/meal-plans/${mealPlan.id}`}
            className="text-green-600 font-medium hover:text-green-700"
          >
            View your meal plan
          </Link>
        </div>
      )}
    </div>
  )
}


