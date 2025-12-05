/**
 * Profile Server Actions
 * 
 * Handles user profile operations including:
 * - Profile updates
 * - Onboarding completion with nutrition calculations
 * - Profile data retrieval
 * 
 * @module actions/profile
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { calculateAge, calculateBMR, calculateTDEE, calculateCalorieTarget, calculateMacros } from '@/lib/utils'
import type { Profile, ActionResponse } from '@/types/database'

/**
 * Updates user profile with provided data
 * @param data - Partial profile data to update
 */
export async function updateProfile(
  data: Partial<Profile>
): Promise<ActionResponse<Profile>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error

    return { success: true, data: profile }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update profile' 
    }
  }
}

export async function completeOnboarding(
  onboardingData: Partial<Profile>
): Promise<ActionResponse<Profile>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Calculate nutrition targets
    let calculatedTargets = {}
    
    if (
      onboardingData.date_of_birth &&
      onboardingData.gender &&
      onboardingData.height_cm &&
      onboardingData.current_weight_kg &&
      onboardingData.activity_level &&
      onboardingData.primary_goal &&
      onboardingData.weekly_goal_kg !== undefined
    ) {
      const age = calculateAge(onboardingData.date_of_birth)
      const gender = onboardingData.gender === 'male' ? 'male' : 'female'
      
      const bmr = calculateBMR(
        onboardingData.current_weight_kg,
        onboardingData.height_cm,
        age,
        gender
      )
      
      const tdee = calculateTDEE(bmr, onboardingData.activity_level)
      
      const dailyCalories = calculateCalorieTarget(
        tdee,
        onboardingData.primary_goal,
        onboardingData.weekly_goal_kg ?? 0
      )
      
      const macros = calculateMacros(
        dailyCalories,
        onboardingData.primary_goal,
        onboardingData.current_weight_kg!
      )

      calculatedTargets = {
        daily_calories_target: dailyCalories,
        daily_protein_g: macros.protein,
        daily_carbs_g: macros.carbs,
        daily_fat_g: macros.fat,
      }
    }

    const profileData = {
      ...onboardingData,
      ...calculatedTargets,
      onboarding_completed: true,
      onboarding_step: 5,
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error

    return { success: true, data: profile }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to complete onboarding' 
    }
  }
}

export async function getProfile(): Promise<ActionResponse<Profile>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error

    return { success: true, data: profile }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch profile' 
    }
  }
}


