'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { PRIMARY_GOALS, WEEKLY_GOAL_OPTIONS } from '@/lib/constants'
import type { PrimaryGoal } from '@/types/database'

export default function GoalsPage() {
  const router = useRouter()
  const [selectedGoal, setSelectedGoal] = useState<PrimaryGoal | null>(null)
  const [weeklyGoal, setWeeklyGoal] = useState<number | null>(null)

  const weeklyOptions = selectedGoal 
    ? WEEKLY_GOAL_OPTIONS[selectedGoal] 
    : []

  const canContinue = selectedGoal && weeklyGoal !== null

  const handleContinue = () => {
    if (!canContinue) return
    
    // Store in session/state (will be saved to DB after all steps)
    sessionStorage.setItem('onboarding_goals', JSON.stringify({
      primary_goal: selectedGoal,
      weekly_goal_kg: weeklyGoal,
    }))
    
    router.push('/onboarding/body-stats')
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span>Step 1 of 4</span>
          <span>25%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full w-1/4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        What&apos;s your main goal?
      </h1>
      <p className="text-gray-600 mb-8">
        This helps us calculate your ideal calorie and macro targets.
      </p>

      {/* Goal Selection */}
      <div className="space-y-3 mb-8">
        {PRIMARY_GOALS.map((goal) => (
          <button
            key={goal.value}
            onClick={() => {
              setSelectedGoal(goal.value)
              setWeeklyGoal(null) // Reset weekly goal when main goal changes
            }}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              selectedGoal === goal.value
                ? 'border-green-500 bg-green-50'
                : 'border-gray-100 hover:border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{goal.emoji}</span>
              <div>
                <p className="font-semibold text-gray-900">{goal.label}</p>
                <p className="text-sm text-gray-500">{goal.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Weekly Goal Selection */}
      {selectedGoal && weeklyOptions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            How fast do you want to progress?
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {weeklyOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setWeeklyGoal(option.value)}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  weeklyGoal === option.value
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                <p className="font-medium text-gray-900">{option.label}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={() => router.push('/onboarding')}
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
            canContinue
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}


