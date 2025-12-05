'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { DIET_TYPES, COMMON_ALLERGIES } from '@/lib/constants'
import type { DietType } from '@/types/database'

export default function DietaryPage() {
  const router = useRouter()
  const [dietType, setDietType] = useState<DietType | null>(null)
  const [allergies, setAllergies] = useState<string[]>([])
  const [dislikedFoods, setDislikedFoods] = useState('')

  const toggleAllergy = (allergy: string) => {
    setAllergies(prev => 
      prev.includes(allergy)
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    )
  }

  const canContinue = dietType !== null

  const handleContinue = () => {
    if (!canContinue) return
    
    sessionStorage.setItem('onboarding_dietary', JSON.stringify({
      diet_type: dietType,
      allergies,
      disliked_foods: dislikedFoods.split(',').map(f => f.trim()).filter(Boolean),
    }))
    
    router.push('/onboarding/preferences')
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span>Step 3 of 4</span>
          <span>75%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full w-3/4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        Dietary Preferences
      </h1>
      <p className="text-gray-600 mb-8">
        Help us create meal plans that match your diet and avoid foods you can&apos;t eat.
      </p>

      {/* Form */}
      <div className="space-y-8">
        {/* Diet Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What&apos;s your diet type?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {DIET_TYPES.map((diet) => (
              <button
                key={diet.value}
                onClick={() => setDietType(diet.value)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  dietType === diet.value
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                <p className="font-medium text-gray-900 text-sm">{diet.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Any food allergies? (Select all that apply)
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_ALLERGIES.map((allergy) => (
              <button
                key={allergy.value}
                onClick={() => toggleAllergy(allergy.value)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                  allergies.includes(allergy.value)
                    ? 'border-red-400 bg-red-50 text-red-700'
                    : 'border-gray-100 hover:border-gray-200 bg-white text-gray-700'
                }`}
              >
                {allergies.includes(allergy.value) && (
                  <Check className="w-4 h-4" />
                )}
                {allergy.label}
              </button>
            ))}
          </div>
        </div>

        {/* Disliked Foods */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Foods you don&apos;t like (optional)
          </label>
          <p className="text-sm text-gray-500 mb-3">
            Separate with commas (e.g., olives, mushrooms, liver)
          </p>
          <textarea
            value={dislikedFoods}
            onChange={(e) => setDislikedFoods(e.target.value)}
            placeholder="e.g., olives, mushrooms, liver"
            rows={3}
            className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-green-500 focus:outline-none transition-colors resize-none"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-8">
        <button
          onClick={() => router.push('/onboarding/body-stats')}
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


