import { createClient } from '@/lib/supabase/server'
import { User, Target, Utensils } from 'lucide-react'
import { SettingsForm } from './settings-form'
import { SignOutButton } from './sign-out-button'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
        {/* Profile Section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <h2 className="font-semibold text-gray-900">Profile</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
              <p className="text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
              <p className="text-gray-900">{profile?.full_name || '—'}</p>
            </div>
          </div>
        </div>

        {/* Goals Section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="font-semibold text-gray-900">Goals & Targets</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Current Weight</p>
              <p className="text-xl font-semibold text-gray-900">{profile?.current_weight_kg || '—'} kg</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Target Weight</p>
              <p className="text-xl font-semibold text-gray-900">{profile?.target_weight_kg || '—'} kg</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Daily Calories</p>
              <p className="text-xl font-semibold text-gray-900">{profile?.daily_calories_target || '—'} kcal</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Goal</p>
              <p className="text-xl font-semibold text-gray-900 capitalize">
                {profile?.primary_goal?.replace('_', ' ') || '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Dietary Preferences */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            <h2 className="font-semibold text-gray-900">Dietary Preferences</h2>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">Diet Type</p>
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                {profile?.diet_type || 'Standard'}
              </span>
            </div>
            
            {profile?.allergies && profile.allergies.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Allergies</p>
                <div className="flex flex-wrap gap-2">
                  {profile.allergies.map((allergy: string) => (
                    <span key={allergy} className="px-3 py-1 rounded-full bg-red-100 text-red-700 capitalize">
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile?.favorite_cuisines && profile.favorite_cuisines.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Favorite Cuisines</p>
                <div className="flex flex-wrap gap-2">
                  {profile.favorite_cuisines.map((cuisine: string) => (
                    <span key={cuisine} className="px-3 py-1 rounded-full bg-green-100 text-green-700 capitalize">
                      {cuisine}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Macros */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Daily Macro Targets</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-2xl font-bold text-blue-700">{profile?.daily_protein_g || '—'}g</p>
              <p className="text-sm text-gray-500">Protein</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-xl">
              <p className="text-2xl font-bold text-amber-700">{profile?.daily_carbs_g || '—'}g</p>
              <p className="text-sm text-gray-500">Carbs</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <p className="text-2xl font-bold text-purple-700">{profile?.daily_fat_g || '—'}g</p>
              <p className="text-sm text-gray-500">Fat</p>
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <SignOutButton />
        </div>
    </main>
  )
}


