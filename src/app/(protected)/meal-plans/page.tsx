import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Calendar, DollarSign, Utensils, ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function MealPlansPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: mealPlans } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Meal Plans</h1>
        <Link
          href="/meal-plans/generate"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium hover:from-green-600 hover:to-emerald-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Plan
        </Link>
      </div>

        {mealPlans && mealPlans.length > 0 ? (
          <div className="space-y-4">
            {mealPlans.map((plan) => (
              <Link
                key={plan.id}
                href={`/meal-plans/${plan.id}`}
                className="block bg-white rounded-2xl border border-gray-100 p-6 hover:border-gray-200 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {plan.is_active && (
                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                          Active
                        </span>
                      )}
                      <h2 className="text-xl font-semibold text-gray-900">
                        {plan.name}
                      </h2>
                    </div>
                    <p className="text-gray-600 mb-4">{plan.description}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(plan.start_date)} - {formatDate(plan.end_date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Utensils className="w-4 h-4" />
                        {plan.total_days} days
                      </div>
                      {plan.estimated_total_cost && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          ${plan.estimated_total_cost.toFixed(2)} est.
                        </div>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                </div>

                {/* Nutrition Preview */}
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">{plan.avg_daily_calories}</p>
                    <p className="text-xs text-gray-500">kcal/day</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-blue-600">{plan.avg_daily_protein_g}g</p>
                    <p className="text-xs text-gray-500">protein</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-amber-600">{plan.avg_daily_carbs_g}g</p>
                    <p className="text-xs text-gray-500">carbs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-purple-600">{plan.avg_daily_fat_g}g</p>
                    <p className="text-xs text-gray-500">fat</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No meal plans yet</h2>
            <p className="text-gray-500 mb-6">Generate your first AI-powered meal plan to get started.</p>
            <Link
              href="/meal-plans/generate"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition-all"
            >
              <Plus className="w-5 h-5" />
              Generate Meal Plan
            </Link>
          </div>
        )}
    </main>
  )
}


