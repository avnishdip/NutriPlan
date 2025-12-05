import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Clock, Flame, Users, ChefHat } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function RecipeDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: recipe, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !recipe) {
    notFound()
  }

  const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)
  const ingredients = recipe.ingredients as { name: string; amount: number; unit: string }[]
  const instructions = recipe.instructions as { step: number; text: string }[]

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Hero */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
          <div className="h-48 bg-gradient-to-br from-green-100 to-emerald-50 flex items-center justify-center">
            <span className="text-6xl">🍽️</span>
          </div>
          
          <div className="p-6">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-gray-100 capitalize">{recipe.meal_type}</span>
              <span className="px-2 py-0.5 rounded-full bg-gray-100">{recipe.cuisine}</span>
              <span className="px-2 py-0.5 rounded-full bg-gray-100 capitalize">{recipe.difficulty}</span>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{recipe.name}</h1>
            <p className="text-gray-600 mb-4">{recipe.description}</p>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <Clock className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                <p className="font-semibold text-gray-900">{totalTime}m</p>
                <p className="text-xs text-gray-500">Total Time</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <Flame className="w-5 h-5 mx-auto mb-1 text-orange-400" />
                <p className="font-semibold text-gray-900">{recipe.calories}</p>
                <p className="text-xs text-gray-500">Calories</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <Users className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                <p className="font-semibold text-gray-900">{recipe.servings}</p>
                <p className="text-xs text-gray-500">Servings</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <ChefHat className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                <p className="font-semibold text-gray-900 capitalize">{recipe.difficulty}</p>
                <p className="text-xs text-gray-500">Difficulty</p>
              </div>
            </div>
          </div>
        </div>

        {/* Nutrition */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Nutrition per Serving</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-xl">
              <p className="text-xl font-bold text-green-700">{recipe.calories}</p>
              <p className="text-xs text-gray-500">Calories</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <p className="text-xl font-bold text-blue-700">{recipe.protein_g}g</p>
              <p className="text-xs text-gray-500">Protein</p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-xl">
              <p className="text-xl font-bold text-amber-700">{recipe.carbs_g}g</p>
              <p className="text-xs text-gray-500">Carbs</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-xl">
              <p className="text-xl font-bold text-purple-700">{recipe.fat_g}g</p>
              <p className="text-xs text-gray-500">Fat</p>
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            Ingredients
            <span className="text-sm font-normal text-gray-400 ml-2">({ingredients.length} items)</span>
          </h2>
          <ul className="space-y-2">
            {ingredients.map((ing, i) => (
              <li key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                <span className="text-gray-900">
                  <span className="font-medium">{ing.amount} {ing.unit}</span> {ing.name}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Instructions</h2>
          <ol className="space-y-4">
            {instructions.map((inst, i) => (
              <li key={i} className="flex gap-4">
                <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0 font-semibold">
                  {inst.step || i + 1}
                </span>
                <p className="text-gray-700 pt-1">{inst.text}</p>
              </li>
            ))}
          </ol>
        </div>
    </main>
  )
}


