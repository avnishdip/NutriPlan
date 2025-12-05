/**
 * Meal Plans Server Actions
 * 
 * Handles all meal plan operations including:
 * - AI-powered meal plan generation
 * - Saving plans to database
 * - Creating associated recipes and shopping lists
 * 
 * @module actions/meal-plans
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { generateMealPlan, type MealPlanRequest, type GeneratedMealPlan } from '@/lib/openai'
import type { ActionResponse, Profile } from '@/types/database'
import { revalidatePath } from 'next/cache'

// Input type for meal plan generation
export interface GenerateMealPlanInput {
  numberOfDays: number
  includeSnacks: boolean
}

/**
 * Generates a personalized meal plan and saves it to the database
 * 
 * This function:
 * 1. Fetches user profile with preferences
 * 2. Calls OpenAI to generate meal plan
 * 3. Saves recipes to database
 * 4. Creates meal plan with items
 * 5. Generates shopping list
 * 
 * @param input - Number of days and snack preference
 * @returns The created meal plan ID or error
 */
export async function generateAndSaveMealPlan(
  input: GenerateMealPlanInput
): Promise<ActionResponse<{ mealPlanId: string }>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return { success: false, error: 'Profile not found' }
    }

    // Build request from profile
    const request: MealPlanRequest = {
      dailyCalories: profile.daily_calories_target || 2000,
      dailyProtein: profile.daily_protein_g || 150,
      dailyCarbs: profile.daily_carbs_g || 200,
      dailyFat: profile.daily_fat_g || 70,
      dietType: profile.diet_type || 'standard',
      allergies: profile.allergies || [],
      dislikedFoods: profile.disliked_foods || [],
      favoriteCuisines: profile.favorite_cuisines || [],
      cookingSkill: profile.cooking_skill || 'intermediate',
      maxPrepTime: profile.meal_prep_time_minutes || 45,
      budgetLevel: profile.budget_level || 'moderate',
      servingsPerMeal: profile.servings_per_meal || 1,
      numberOfDays: input.numberOfDays,
      mealsPerDay: input.includeSnacks ? 4 : 3,
    }

    // Generate meal plan with AI
    const generatedPlan = await generateMealPlan(request)

    // Calculate dates
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + input.numberOfDays - 1)

    // Save meal plan to database
    const { data: mealPlan, error: mealPlanError } = await supabase
      .from('meal_plans')
      .insert({
        user_id: user.id,
        name: generatedPlan.name,
        description: generatedPlan.description,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        total_days: input.numberOfDays,
        avg_daily_calories: profile.daily_calories_target,
        avg_daily_protein_g: profile.daily_protein_g,
        avg_daily_carbs_g: profile.daily_carbs_g,
        avg_daily_fat_g: profile.daily_fat_g,
        estimated_total_cost: generatedPlan.totalEstimatedCost,
        is_active: true,
        generation_prompt: JSON.stringify(request),
      })
      .select()
      .single()

    if (mealPlanError || !mealPlan) {
      throw new Error('Failed to save meal plan')
    }

    // Deactivate other meal plans
    await supabase
      .from('meal_plans')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .neq('id', mealPlan.id)

    // Save recipes and meal plan items
    for (const day of generatedPlan.days) {
      const planDate = new Date(startDate)
      planDate.setDate(planDate.getDate() + day.day - 1)
      const dateStr = planDate.toISOString().split('T')[0]

      for (const meal of day.meals) {
        // Insert recipe
        const { data: recipe, error: recipeError } = await supabase
          .from('recipes')
          .insert({
            name: meal.name,
            description: meal.description,
            prep_time_minutes: meal.prepTime,
            cook_time_minutes: meal.cookTime,
            servings: meal.servings,
            difficulty: meal.difficulty,
            calories: meal.calories,
            protein_g: meal.protein,
            carbs_g: meal.carbs,
            fat_g: meal.fat,
            fiber_g: meal.fiber,
            ingredients: meal.ingredients,
            instructions: meal.instructions.map((text, i) => ({ step: i + 1, text })),
            cuisine: meal.cuisine,
            meal_type: meal.mealType,
            tags: meal.tags,
            estimated_cost: meal.estimatedCost,
            cost_per_serving: meal.estimatedCost / meal.servings,
            is_ai_generated: true,
            created_by: user.id,
          })
          .select()
          .single()

        if (recipeError) {
          console.error('Failed to save recipe:', recipeError)
          continue
        }

        // Insert meal plan item
        await supabase
          .from('meal_plan_items')
          .insert({
            meal_plan_id: mealPlan.id,
            recipe_id: recipe.id,
            plan_date: dateStr,
            meal_type: meal.mealType,
            servings: meal.servings,
            recipe_name: meal.name,
            calories: meal.calories,
          })
      }
    }

    // Save shopping list
    const { data: shoppingList } = await supabase
      .from('shopping_lists')
      .insert({
        user_id: user.id,
        meal_plan_id: mealPlan.id,
        name: `Shopping List - ${generatedPlan.name}`,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        estimated_total_cost: generatedPlan.totalEstimatedCost,
      })
      .select()
      .single()

    if (shoppingList) {
      for (const category of generatedPlan.shoppingList) {
        for (const item of category.items) {
          await supabase
            .from('shopping_list_items')
            .insert({
              shopping_list_id: shoppingList.id,
              ingredient_name: item.name,
              quantity: item.amount,
              unit: item.unit,
              category: category.category,
              estimated_cost: item.estimatedCost,
            })
        }
      }
    }

    revalidatePath('/dashboard')
    revalidatePath('/meal-plans')
    revalidatePath('/shopping-list')

    return { success: true, data: { mealPlanId: mealPlan.id } }
  } catch (error) {
    console.error('Error generating meal plan:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate meal plan' 
    }
  }
}

export async function getMealPlans(): Promise<ActionResponse<any[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch meal plans' 
    }
  }
}

export async function getMealPlanWithItems(mealPlanId: string): Promise<ActionResponse<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get meal plan
    const { data: mealPlan, error: planError } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('id', mealPlanId)
      .eq('user_id', user.id)
      .single()

    if (planError || !mealPlan) {
      return { success: false, error: 'Meal plan not found' }
    }

    // Get meal plan items with recipes
    const { data: items, error: itemsError } = await supabase
      .from('meal_plan_items')
      .select(`
        *,
        recipe:recipes(*)
      `)
      .eq('meal_plan_id', mealPlanId)
      .order('plan_date', { ascending: true })
      .order('meal_type', { ascending: true })

    if (itemsError) throw itemsError

    return { success: true, data: { ...mealPlan, items } }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch meal plan' 
    }
  }
}

export async function getActiveMealPlan(): Promise<ActionResponse<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data: mealPlan, error } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      throw error
    }

    if (!mealPlan) {
      return { success: true, data: null }
    }

    // Get items for today
    const today = new Date().toISOString().split('T')[0]
    const { data: todayItems } = await supabase
      .from('meal_plan_items')
      .select(`
        *,
        recipe:recipes(*)
      `)
      .eq('meal_plan_id', mealPlan.id)
      .eq('plan_date', today)
      .order('meal_type', { ascending: true })

    return { success: true, data: { ...mealPlan, todayItems: todayItems || [] } }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch active meal plan' 
    }
  }
}

export async function toggleMealItemComplete(itemId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get current state
    const { data: item } = await supabase
      .from('meal_plan_items')
      .select('is_completed')
      .eq('id', itemId)
      .single()

    if (!item) {
      return { success: false, error: 'Item not found' }
    }

    // Toggle
    const { error } = await supabase
      .from('meal_plan_items')
      .update({ 
        is_completed: !item.is_completed,
        completed_at: !item.is_completed ? new Date().toISOString() : null
      })
      .eq('id', itemId)

    if (error) throw error

    revalidatePath('/dashboard')
    revalidatePath('/meal-plans')

    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update item' 
    }
  }
}


