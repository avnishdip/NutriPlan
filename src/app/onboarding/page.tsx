import Link from 'next/link'
import { ArrowRight, Target, Activity, Salad, ChefHat } from 'lucide-react'

export default function OnboardingStartPage() {
  const steps = [
    { icon: Target, title: 'Your Goals', description: 'Tell us what you want to achieve' },
    { icon: Activity, title: 'Body Stats', description: 'Height, weight, and activity level' },
    { icon: Salad, title: 'Dietary Preferences', description: 'Allergies and diet type' },
    { icon: ChefHat, title: 'Cooking Style', description: 'Budget and skill level' },
  ]

  return (
    <div className="text-center">
      {/* Welcome Message */}
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Let&apos;s personalize your experience
        </h1>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          Answer a few quick questions so we can create the perfect meal plan for you.
        </p>
      </div>

      {/* Steps Preview */}
      <div className="grid sm:grid-cols-2 gap-4 mb-12">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
              <step.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{step.title}</p>
              <p className="text-sm text-gray-500">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Time Estimate */}
      <p className="text-sm text-gray-500 mb-6">
        ⏱️ Takes about 2 minutes
      </p>

      {/* Start Button */}
      <Link
        href="/onboarding/goals"
        className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold text-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/25"
      >
        Get Started
        <ArrowRight className="w-5 h-5" />
      </Link>
    </div>
  )
}


