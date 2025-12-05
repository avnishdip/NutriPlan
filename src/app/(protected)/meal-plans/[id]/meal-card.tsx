'use client'

import { useState } from 'react'
import { Clock, Flame, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { toggleMealItemComplete } from '@/actions/meal-plans'

interface MealCardProps {
  item: {
    id: string
    meal_type: string
    is_completed: boolean
    servings: number
    recipe: {
      id: string
      name: string
      description: string
      prep_time_minutes: number
      cook_time_minutes: number
      calories: number
      protein_g: number
      carbs_g: number
      fat_g: number
      ingredients: { name: string; amount: number; unit: string }[]
      instructions: { step: number; text: string }[]
      difficulty: string
      cuisine: string
    } | null
  }
}

const mealTypeLabels: Record<string, { label: string; emoji: string }> = {
  breakfast: { label: 'Breakfast', emoji: '🌅' },
  lunch: { label: 'Lunch', emoji: '☀️' },
  dinner: { label: 'Dinner', emoji: '🌙' },
  snack: { label: 'Snack', emoji: '🍎' },
}

export function MealCard({ item }: MealCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isCompleted, setIsCompleted] = useState(item.is_completed)
  const [loading, setLoading] = useState(false)

  const recipe = item.recipe
  if (!recipe) return null

  const mealInfo = mealTypeLabels[item.meal_type] || { label: item.meal_type, emoji: '🍽️' }
  const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)

  const handleToggleComplete = async () => {
    setLoading(true)
    const result = await toggleMealItemComplete(item.id)
    if (result.success) {
      setIsCompleted(!isCompleted)
    }
    setLoading(false)
  }

  return (
    <div className={`${isCompleted ? 'bg-gray-50' : ''}`}>
      {/* Main Row */}
      <div className="px-6 py-4 flex items-center gap-4">
        {/* Complete Button */}
        <button
          onClick={handleToggleComplete}
          disabled={loading}
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
            isCompleted
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-green-500'
          }`}
        >
          {isCompleted && <Check className="w-4 h-4" />}
        </button>

        {/* Meal Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{mealInfo.emoji}</span>
            <span className="text-xs font-medium text-gray-500 uppercase">{mealInfo.label}</span>
          </div>
          <h3 className={`font-semibold text-gray-900 ${isCompleted ? 'line-through opacity-60' : ''}`}>
            {recipe.name}
          </h3>
          <p className="text-sm text-gray-500 truncate">{recipe.description}</p>
        </div>

        {/* Quick Stats */}
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

        {/* Expand Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-100 pt-4 ml-12">
          {/* Nutrition Grid */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-green-50 rounded-xl">
              <p className="text-lg font-bold text-green-700">{recipe.calories}</p>
              <p className="text-xs text-gray-500">kcal</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <p className="text-lg font-bold text-blue-700">{recipe.protein_g}g</p>
              <p className="text-xs text-gray-500">protein</p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-xl">
              <p className="text-lg font-bold text-amber-700">{recipe.carbs_g}g</p>
              <p className="text-xs text-gray-500">carbs</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-xl">
              <p className="text-lg font-bold text-purple-700">{recipe.fat_g}g</p>
              <p className="text-xs text-gray-500">fat</p>
            </div>
          </div>

          {/* Ingredients */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">Ingredients</h4>
            <ul className="grid sm:grid-cols-2 gap-1">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  {ing.amount} {ing.unit} {ing.name}
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Instructions</h4>
            <ol className="space-y-2">
              {recipe.instructions.map((inst, i) => (
                <li key={i} className="text-sm text-gray-600 flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-xs font-medium">
                    {inst.step || i + 1}
                  </span>
                  {inst.text}
                </li>
              ))}
            </ol>
          </div>

          {/* Meta */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
            <span className="px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-600">
              {recipe.difficulty}
            </span>
            <span className="px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-600">
              {recipe.cuisine}
            </span>
            <span className="px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-600">
              {recipe.prep_time_minutes}m prep
            </span>
            <span className="px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-600">
              {recipe.cook_time_minutes}m cook
            </span>
          </div>
        </div>
      )}
    </div>
  )
}


