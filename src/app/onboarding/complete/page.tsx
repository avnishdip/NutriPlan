'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react'
import { completeOnboarding } from '@/actions/profile'

export default function CompletePage() {
  const router = useRouter()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [message, setMessage] = useState('Saving your preferences...')

  useEffect(() => {
    const saveProfile = async () => {
      try {
        // Gather all onboarding data from session storage
        const goalsData = sessionStorage.getItem('onboarding_goals')
        const bodyStatsData = sessionStorage.getItem('onboarding_body_stats')
        const dietaryData = sessionStorage.getItem('onboarding_dietary')
        const preferencesData = sessionStorage.getItem('onboarding_preferences')

        if (!goalsData || !bodyStatsData || !dietaryData || !preferencesData) {
          throw new Error('Missing onboarding data')
        }

        const profileData = {
          ...JSON.parse(goalsData),
          ...JSON.parse(bodyStatsData),
          ...JSON.parse(dietaryData),
          ...JSON.parse(preferencesData),
        }

        setMessage('Calculating your nutrition targets...')
        
        // Save to database using server action
        const result = await completeOnboarding(profileData)
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to save profile')
        }

        setMessage('Setting up your dashboard...')
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Clear session storage
        sessionStorage.removeItem('onboarding_goals')
        sessionStorage.removeItem('onboarding_body_stats')
        sessionStorage.removeItem('onboarding_dietary')
        sessionStorage.removeItem('onboarding_preferences')

        setStatus('success')
        setMessage('All set! Redirecting to your dashboard...')

        // Redirect to dashboard after brief delay
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 1500)

      } catch (error) {
        console.error('Onboarding error:', error)
        setStatus('error')
        setMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
      }
    }

    saveProfile()
  }, [router])

  return (
    <div className="text-center py-12">
      {status === 'processing' && (
        <>
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Setting up your profile
          </h1>
          <p className="text-gray-600">{message}</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            You&apos;re all set! 🎉
          </h1>
          <p className="text-gray-600 mb-6">{message}</p>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Your AI meal plan is ready
          </div>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-4xl">😔</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Oops!
          </h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <button
            onClick={() => router.push('/onboarding')}
            className="px-6 py-3 rounded-full bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors"
          >
            Start Over
          </button>
        </>
      )}
    </div>
  )
}

