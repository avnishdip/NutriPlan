'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { User, LogOut, Target, Scale, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ProfileData {
  full_name: string | null
  age: number | null
  current_weight_kg: number | null
  target_weight_kg: number | null
  primary_goal: string | null
}

export function ProfileDropdown() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, age, current_weight_kg, target_weight_kg, primary_goal')
          .eq('id', user.id)
          .single()
        
        setProfile(data)
      }
      setLoading(false)
    }

    fetchProfile()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const formatGoal = (goal: string | null) => {
    if (!goal) return 'Not set'
    return goal.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (loading) {
    return (
      <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm">
          {getInitials(profile?.full_name)}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 hidden sm:block transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
          {/* Profile Header */}
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                {getInitials(profile?.full_name)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {profile?.full_name || 'User'}
                </p>
                {profile?.age && (
                  <p className="text-sm text-gray-500">{profile.age} years old</p>
                )}
              </div>
            </div>
          </div>

          {/* Profile Stats */}
          <div className="p-3">
            <div className="space-y-2">
              {/* Weight */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Scale className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Current Weight</p>
                  <p className="font-semibold text-gray-900">
                    {profile?.current_weight_kg ? `${profile.current_weight_kg} kg` : 'Not set'}
                  </p>
                </div>
                {profile?.target_weight_kg && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Target</p>
                    <p className="font-semibold text-green-600">{profile.target_weight_kg} kg</p>
                  </div>
                )}
              </div>

              {/* Goal */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Goal</p>
                  <p className="font-semibold text-gray-900">
                    {formatGoal(profile?.primary_goal)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-2 border-t border-gray-100">
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">
                {signingOut ? 'Signing out...' : 'Sign Out'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

