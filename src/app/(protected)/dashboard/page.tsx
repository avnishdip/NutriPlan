import { createClient } from '@/lib/supabase/server'
import { getGreeting, getCurrentMealType } from '@/lib/utils'
import { ShoppingCart, TrendingUp, Camera, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { TodaysMeals } from './todays-meals'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  const greeting = getGreeting()
  const currentMealType = getCurrentMealType()
  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  return (
    <>
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {greeting}, {firstName}! 👋
          </h1>
          <p className="text-gray-600">
            Ready for {currentMealType}? Here&apos;s what&apos;s on your plan today.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Daily Calories', value: profile?.daily_calories_target || '—', unit: 'kcal', color: 'bg-green-100 text-green-600' },
            { label: 'Protein', value: profile?.daily_protein_g || '—', unit: 'g', color: 'bg-blue-100 text-blue-600' },
            { label: 'Carbs', value: profile?.daily_carbs_g || '—', unit: 'g', color: 'bg-amber-100 text-amber-600' },
            { label: 'Fat', value: profile?.daily_fat_g || '—', unit: 'g', color: 'bg-purple-100 text-purple-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">
                {stat.value}
                <span className="text-sm font-normal text-gray-500 ml-1">{stat.unit}</span>
              </p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Link 
            href="/food-log"
            className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Log a Meal</p>
              <p className="text-sm text-gray-500">Snap a photo or add manually</p>
            </div>
          </Link>

          <Link 
            href="/shopping-list"
            className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Shopping List</p>
              <p className="text-sm text-gray-500">View your grocery list</p>
            </div>
          </Link>

          <Link 
            href="/recipes"
            className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Recipe Book</p>
              <p className="text-sm text-gray-500">Browse your saved recipes</p>
            </div>
          </Link>
        </div>

        {/* Today's Meals */}
        <TodaysMeals />

        {/* Weight Progress - Placeholder */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Weight Progress</h2>
            </div>
            <Link 
              href="/progress"
              className="text-green-600 font-medium hover:text-green-700"
            >
              View details
            </Link>
          </div>

          {/* Current Weight Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Current</p>
              <p className="text-2xl font-bold text-gray-900">
                {profile?.current_weight_kg || '—'} kg
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Target</p>
              <p className="text-2xl font-bold text-gray-900">
                {profile?.target_weight_kg || '—'} kg
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">To Go</p>
              <p className="text-2xl font-bold text-green-600">
                {profile?.current_weight_kg && profile?.target_weight_kg 
                  ? `${Math.abs(profile.current_weight_kg - profile.target_weight_kg).toFixed(1)} kg`
                  : '—'
                }
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

