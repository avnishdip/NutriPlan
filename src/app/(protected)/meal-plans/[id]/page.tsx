import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, DollarSign, ShoppingCart, Flame } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { MealCard } from './meal-card'

interface Props {
  params: Promise<{ id: string }>
}

export default async function MealPlanDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get meal plan
  const { data: mealPlan, error } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('id', id)
    .eq('user_id', user?.id)
    .single()

  if (error || !mealPlan) {
    notFound()
  }

  // Get meal plan items with recipes
  const { data: items } = await supabase
    .from('meal_plan_items')
    .select(`
      *,
      recipe:recipes(*)
    `)
    .eq('meal_plan_id', id)
    .order('plan_date', { ascending: true })
    .order('meal_type', { ascending: true })

  // Group items by date
  const itemsByDate = (items || []).reduce((acc, item) => {
    const date = item.plan_date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(item)
    return acc
  }, {} as Record<string, typeof items>)

  // Get shopping list for this plan
  const { data: shoppingList } = await supabase
    .from('shopping_lists')
    .select('id')
    .eq('meal_plan_id', id)
    .single()

  const dates = Object.keys(itemsByDate).sort()

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Plan Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {mealPlan.is_active && (
                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                  Active
                </span>
              )}
              <h1 className="text-2xl font-bold text-gray-900">{mealPlan.name}</h1>
            </div>
            <p className="text-gray-600">{mealPlan.description}</p>
          </div>

          {shoppingList && (
            <Link
              href="/shopping-list"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              Shopping List
            </Link>
          )}
        </div>

        {/* Stats Bar */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <Calendar className="w-4 h-4" />
            {formatDate(mealPlan.start_date)} - {formatDate(mealPlan.end_date)}
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Flame className="w-4 h-4" />
            {mealPlan.avg_daily_calories} kcal/day
          </div>
          {mealPlan.estimated_total_cost && (
            <div className="flex items-center gap-1 text-gray-600">
              <DollarSign className="w-4 h-4" />
              ${mealPlan.estimated_total_cost.toFixed(2)} estimated
            </div>
          )}
        </div>
      </div>
        {/* Daily Plans */}
        <div className="space-y-8">
          {dates.map((date, index) => {
            const dayItems = itemsByDate[date]
            const dayNumber = index + 1
            const totalCalories = dayItems?.reduce((sum: number, item) => sum + (item.calories || 0), 0) || 0
            const isToday = date === new Date().toISOString().split('T')[0]
            const completedCount = dayItems?.filter(i => i.is_completed).length || 0

            return (
              <div key={date} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {/* Day Header */}
                <div className={`px-6 py-4 border-b border-gray-100 ${isToday ? 'bg-green-50' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        isToday 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {dayNumber}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Day {dayNumber}
                          {isToday && <span className="ml-2 text-green-600">• Today</span>}
                        </p>
                        <p className="text-sm text-gray-500">{formatDate(date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{totalCalories} kcal</p>
                      <p className="text-sm text-gray-500">
                        {completedCount}/{dayItems?.length || 0} completed
                      </p>
                    </div>
                  </div>
                </div>

                {/* Meals */}
                <div className="divide-y divide-gray-100">
                  {dayItems?.map((item) => (
                    <MealCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
    </main>
  )
}


