'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { CUISINES, BUDGET_LEVELS, COOKING_SKILLS } from '@/lib/constants'
import type { BudgetLevel, CookingSkill } from '@/types/database'

export default function PreferencesPage() {
  const router = useRouter()
  const [cuisines, setCuisines] = useState<string[]>([])
  const [budgetLevel, setBudgetLevel] = useState<BudgetLevel | null>(null)
  const [cookingSkill, setCookingSkill] = useState<CookingSkill | null>(null)
  const [prepTime, setPrepTime] = useState('30')
  const [servings, setServings] = useState('1')

  const toggleCuisine = (cuisine: string) => {
    setCuisines(prev => 
      prev.includes(cuisine)
        ? prev.filter(c => c !== cuisine)
        : [...prev, cuisine]
    )
  }

  const canContinue = budgetLevel && cookingSkill

  const handleContinue = () => {
    if (!canContinue) return
    
    sessionStorage.setItem('onboarding_preferences', JSON.stringify({
      favorite_cuisines: cuisines,
      budget_level: budgetLevel,
      cooking_skill: cookingSkill,
      meal_prep_time_minutes: parseInt(prepTime),
      servings_per_meal: parseInt(servings),
    }))
    
    router.push('/onboarding/complete')
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span>Step 4 of 4</span>
          <span>100%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full w-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        Cooking Preferences
      </h1>
      <p className="text-gray-600 mb-8">
        Almost there! Let&apos;s customize your meal plans to your lifestyle.
      </p>

      {/* Form */}
      <div className="space-y-8">
        {/* Favorite Cuisines */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Favorite cuisines (select as many as you like)
          </label>
          <div className="flex flex-wrap gap-2">
            {CUISINES.map((cuisine) => (
              <button
                key={cuisine.value}
                onClick={() => toggleCuisine(cuisine.value)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                  cuisines.includes(cuisine.value)
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-100 hover:border-gray-200 bg-white text-gray-700'
                }`}
              >
                {cuisines.includes(cuisine.value) && (
                  <Check className="w-4 h-4" />
                )}
                {cuisine.label}
              </button>
            ))}
          </div>
        </div>

        {/* Budget Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What&apos;s your grocery budget?
          </label>
          <div className="grid grid-cols-3 gap-3">
            {BUDGET_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => setBudgetLevel(level.value)}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  budgetLevel === level.value
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                <span className="text-2xl block mb-1">{level.emoji}</span>
                <p className="font-medium text-gray-900 text-sm">{level.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Cooking Skill */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Cooking skill level
          </label>
          <div className="space-y-2">
            {COOKING_SKILLS.map((skill) => (
              <button
                key={skill.value}
                onClick={() => setCookingSkill(skill.value)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  cookingSkill === skill.value
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                <p className="font-medium text-gray-900">{skill.label}</p>
                <p className="text-sm text-gray-500">{skill.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Prep Time & Servings */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max cooking time (minutes)
            </label>
            <select
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-green-500 focus:outline-none transition-colors bg-white"
            >
              <option value="15">15 min</option>
              <option value="30">30 min</option>
              <option value="45">45 min</option>
              <option value="60">60 min</option>
              <option value="90">90+ min</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Servings per meal
            </label>
            <select
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-green-500 focus:outline-none transition-colors bg-white"
            >
              <option value="1">1 person</option>
              <option value="2">2 people</option>
              <option value="3">3 people</option>
              <option value="4">4 people</option>
              <option value="5">5+ people</option>
            </select>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-8">
        <button
          onClick={() => router.push('/onboarding/dietary')}
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
          Complete Setup
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}


