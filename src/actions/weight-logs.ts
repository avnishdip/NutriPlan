'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResponse } from '@/types/database'
import { revalidatePath } from 'next/cache'

export async function logWeight(weightKg: number, notes?: string): Promise<ActionResponse<{ id: string }>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    const today = new Date().toISOString().split('T')[0]

    // Upsert - update if exists for today, insert if not
    const { data, error } = await supabase
      .from('weight_logs')
      .upsert(
        {
          user_id: user.id,
          weight_kg: weightKg,
          logged_at: today,
          notes: notes || null,
        },
        {
          onConflict: 'user_id,logged_at',
        }
      )
      .select()
      .single()

    if (error) throw error

    // Also update current weight in profile
    await supabase
      .from('profiles')
      .update({ current_weight_kg: weightKg })
      .eq('id', user.id)

    revalidatePath('/progress')
    revalidatePath('/dashboard')

    return { success: true, data: { id: data.id } }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to log weight' 
    }
  }
}

export async function getWeightLogs(days: number = 30): Promise<ActionResponse<any[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_at', startDate.toISOString().split('T')[0])
      .order('logged_at', { ascending: true })

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch weight logs' 
    }
  }
}

export async function deleteWeightLog(id: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('weight_logs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    revalidatePath('/progress')

    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete weight log' 
    }
  }
}


