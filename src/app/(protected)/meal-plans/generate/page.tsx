'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Loader2, Calendar, Coffee } from 'lucide-react'
import { generateAndSaveMealPlan } from '@/actions/meal-plans'

export default function GenerateMealPlanPage() {
  const router = useRouter()
  const [numberOfDays, setNumberOfDays] = useState(7)
  const [includeSnacks, setIncludeSnacks] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('')

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setStatus('Analyzing your preferences...')

    try {
      // Simulate progress updates
      setTimeout(() => setStatus('Generating personalized recipes...'), 2000)
      setTimeout(() => setStatus('Calculating nutrition...'), 4000)
      setTimeout(() => setStatus('Creating shopping list...'), 6000)

      const result = await generateAndSaveMealPlan({
        numberOfDays,
        includeSnacks,
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      setStatus('Done! Redirecting...')
      router.push(`/meal-plans/${result.data?.mealPlanId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate meal plan')
      setLoading(false)
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-white animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Creating Your Meal Plan
            </h1>
            <p className="text-gray-600 mb-4">{status}</p>
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-green-600" />
              <span className="text-sm text-gray-500">This may take a minute...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Title */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Generate Meal Plan
              </h1>
              <p className="text-gray-600">
                AI will create a personalized meal plan based on your profile
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
                {error}
              </div>
            )}

            {/* Options */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
              {/* Number of Days */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <Calendar className="w-4 h-4" />
                  Plan Duration
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[3, 5, 7, 14].map((days) => (
                    <button
                      key={days}
                      onClick={() => setNumberOfDays(days)}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        numberOfDays === days
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <p className="text-2xl font-bold text-gray-900">{days}</p>
                      <p className="text-sm text-gray-500">days</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Include Snacks */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <Coffee className="w-4 h-4" />
                  Include Snacks
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setIncludeSnacks(true)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      includeSnacks
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <p className="font-medium text-gray-900">Yes</p>
                    <p className="text-sm text-gray-500">4 meals/day</p>
                  </button>
                  <button
                    onClick={() => setIncludeSnacks(false)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      !includeSnacks
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <p className="font-medium text-gray-900">No</p>
                    <p className="text-sm text-gray-500">3 meals/day</p>
                  </button>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Your Plan Will Include:</h3>
              <ul className="space-y-1 text-gray-600">
                <li>✓ {numberOfDays * (includeSnacks ? 4 : 3)} personalized recipes</li>
                <li>✓ Matched to your calorie & macro targets</li>
                <li>✓ Respects your dietary restrictions</li>
                <li>✓ Auto-generated shopping list</li>
                <li>✓ Estimated costs for budgeting</li>
              </ul>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold text-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Generate My Meal Plan
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Generation typically takes 30-60 seconds
            </p>
          </>
        )}
    </main>
  )
}


