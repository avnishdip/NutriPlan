import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { BookOpen, Clock, Flame, Search } from 'lucide-react'

export default async function RecipesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get all recipes created for this user
  const { data: recipes } = await supabase
    .from('recipes')
    .select('*')
    .eq('created_by', user?.id)
    .order('created_at', { ascending: false })

  // Group by meal type
  const recipesByType = (recipes || []).reduce((acc, recipe) => {
    const type = recipe.meal_type || 'other'
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(recipe)
    return acc
  }, {} as Record<string, typeof recipes>)

  const mealTypeLabels: Record<string, { label: string; emoji: string }> = {
    breakfast: { label: 'Breakfast', emoji: '🌅' },
    lunch: { label: 'Lunch', emoji: '☀️' },
    dinner: { label: 'Dinner', emoji: '🌙' },
    snack: { label: 'Snacks', emoji: '🍎' },
    other: { label: 'Other', emoji: '🍽️' },
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recipe Book</h1>
          <p className="text-sm text-gray-500">{recipes?.length || 0} recipes</p>
        </div>
      </div>
        {recipes && recipes.length > 0 ? (
          <div className="space-y-8">
            {Object.entries(mealTypeLabels).map(([type, info]) => {
              const typeRecipes = recipesByType[type]
              if (!typeRecipes || typeRecipes.length === 0) return null

              return (
                <div key={type}>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span>{info.emoji}</span>
                    {info.label}
                    <span className="text-sm font-normal text-gray-400">({typeRecipes.length})</span>
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {typeRecipes.map((recipe) => (
                      <Link
                        key={recipe.id}
                        href={`/recipes/${recipe.id}`}
                        className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all group"
                      >
                        {/* Image placeholder */}
                        <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                          <span className="text-4xl opacity-50">🍽️</span>
                        </div>
                        
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                            {recipe.name}
                          </h3>
                          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                            {recipe.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {recipe.total_time_minutes || (recipe.prep_time_minutes + recipe.cook_time_minutes)}m
                            </div>
                            <div className="flex items-center gap-1">
                              <Flame className="w-4 h-4" />
                              {recipe.calories} kcal
                            </div>
                          </div>

                          {/* Macros */}
                          <div className="mt-3 flex gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs">
                              {recipe.protein_g}g protein
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-xs">
                              {recipe.carbs_g}g carbs
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No recipes yet</h2>
            <p className="text-gray-500 mb-6">Generate a meal plan to get your first recipes.</p>
            <Link
              href="/meal-plans/generate"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold"
            >
              Generate Meal Plan
            </Link>
          </div>
        )}
    </main>
  )
}


