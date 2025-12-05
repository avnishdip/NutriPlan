'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { ACTIVITY_LEVELS } from '@/lib/constants'
import type { Gender, ActivityLevel } from '@/types/database'

export default function BodyStatsPage() {
  const router = useRouter()
  const [gender, setGender] = useState<Gender | null>(null)
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [currentWeight, setCurrentWeight] = useState('')
  const [targetWeight, setTargetWeight] = useState('')
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null)

  const canContinue = 
    gender && 
    dateOfBirth && 
    heightCm && 
    currentWeight && 
    targetWeight && 
    activityLevel

  const handleContinue = () => {
    if (!canContinue) return
    
    sessionStorage.setItem('onboarding_body_stats', JSON.stringify({
      gender,
      date_of_birth: dateOfBirth,
      height_cm: parseFloat(heightCm),
      current_weight_kg: parseFloat(currentWeight),
      target_weight_kg: parseFloat(targetWeight),
      activity_level: activityLevel,
    }))
    
    router.push('/onboarding/dietary')
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span>Step 2 of 4</span>
          <span>50%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full w-2/4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        Tell us about yourself
      </h1>
      <p className="text-gray-600 mb-8">
        We&apos;ll use this to calculate your personalized nutrition targets.
      </p>

      {/* Form */}
      <div className="space-y-6">
        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(['male', 'female'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`p-4 rounded-xl border-2 text-center capitalize transition-all ${
                  gender === g
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth
          </label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-green-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Height */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Height (cm)
          </label>
          <input
            type="number"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            placeholder="e.g., 175"
            className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-green-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Weight Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Weight (kg)
            </label>
            <input
              type="number"
              value={currentWeight}
              onChange={(e) => setCurrentWeight(e.target.value)}
              placeholder="e.g., 75"
              step="0.1"
              className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-green-500 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Weight (kg)
            </label>
            <input
              type="number"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              placeholder="e.g., 70"
              step="0.1"
              className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-green-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Activity Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Activity Level
          </label>
          <div className="space-y-2">
            {ACTIVITY_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => setActivityLevel(level.value)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  activityLevel === level.value
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                <p className="font-medium text-gray-900">{level.label}</p>
                <p className="text-sm text-gray-500">{level.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-8">
        <button
          onClick={() => router.push('/onboarding/goals')}
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


