'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResponse, MealType } from '@/types/database'
import { revalidatePath } from 'next/cache'

export interface CreateFoodLogInput {
  mealType: MealType
  foodName: string
  description?: string
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  photoUrl?: string
  notes?: string
  mood?: 'great' | 'good' | 'okay' | 'bad'
}

export async function createFoodLog(input: CreateFoodLogInput): Promise<ActionResponse<{ id: string }>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('food_logs')
      .insert({
        user_id: user.id,
        meal_type: input.mealType,
        food_name: input.foodName,
        description: input.description,
        calories: input.calories,
        protein_g: input.protein,
        carbs_g: input.carbs,
        fat_g: input.fat,
        photo_url: input.photoUrl,
        notes: input.notes,
        mood: input.mood,
        logged_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/food-log')
    revalidatePath('/dashboard')

    return { success: true, data: { id: data.id } }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create food log' 
    }
  }
}

export async function getFoodLogs(date?: string): Promise<ActionResponse<any[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    let query = supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: false })

    if (date) {
      query = query
        .gte('logged_at', `${date}T00:00:00`)
        .lt('logged_at', `${date}T23:59:59`)
    }

    const { data, error } = await query.limit(50)

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch food logs' 
    }
  }
}

export async function deleteFoodLog(id: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('food_logs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    revalidatePath('/food-log')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete food log' 
    }
  }
}

export async function getTodayStats(): Promise<ActionResponse<{
  calories: number
  protein: number
  carbs: number
  fat: number
  mealCount: number
}>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('food_logs')
      .select('calories, protein_g, carbs_g, fat_g')
      .eq('user_id', user.id)
      .gte('logged_at', `${today}T00:00:00`)
      .lt('logged_at', `${today}T23:59:59`)

    if (error) throw error

    const stats = (data || []).reduce(
      (acc, log) => ({
        calories: acc.calories + (log.calories || 0),
        protein: acc.protein + (log.protein_g || 0),
        carbs: acc.carbs + (log.carbs_g || 0),
        fat: acc.fat + (log.fat_g || 0),
        mealCount: acc.mealCount + 1,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, mealCount: 0 }
    )

    return { success: true, data: stats }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch stats' 
    }
  }
}


