// ============================================
// NutriPlan - Database Types
// Auto-sync these with your Supabase schema
// ============================================

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'

export type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'extremely_active'

export type PrimaryGoal =
  | 'lose_weight'
  | 'gain_weight'
  | 'build_muscle'
  | 'maintain_weight'
  | 'body_recomposition'

export type DietType =
  | 'standard'
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian'
  | 'keto'
  | 'paleo'
  | 'mediterranean'
  | 'halal'
  | 'kosher'

export type BudgetLevel = 'budget' | 'moderate' | 'premium'

export type CookingSkill = 'beginner' | 'intermediate' | 'advanced'

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export type Difficulty = 'easy' | 'medium' | 'hard'

export type Mood = 'great' | 'good' | 'okay' | 'bad'

// ============================================
// Profile / User
// ============================================
export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null

  // Body Stats
  date_of_birth: string | null
  gender: Gender | null
  height_cm: number | null
  current_weight_kg: number | null
  target_weight_kg: number | null
  activity_level: ActivityLevel | null

  // Goals
  primary_goal: PrimaryGoal | null
  weekly_goal_kg: number | null
  target_date: string | null

  // Dietary Preferences
  diet_type: DietType | null
  allergies: string[]
  disliked_foods: string[]
  favorite_cuisines: string[]

  // Budget & Preferences
  budget_level: BudgetLevel | null
  cooking_skill: CookingSkill | null
  meal_prep_time_minutes: number | null
  servings_per_meal: number

  // Calculated Nutrition Targets
  daily_calories_target: number | null
  daily_protein_g: number | null
  daily_carbs_g: number | null
  daily_fat_g: number | null

  // Onboarding
  onboarding_completed: boolean
  onboarding_step: number

  // Timestamps
  created_at: string
  updated_at: string
}

// ============================================
// Weight Log
// ============================================
export interface WeightLog {
  id: string
  user_id: string
  weight_kg: number
  logged_at: string
  notes: string | null
  created_at: string
}

// ============================================
// Meal Plan
// ============================================
export interface MealPlan {
  id: string
  user_id: string
  name: string
  description: string | null
  start_date: string
  end_date: string
  total_days: number
  avg_daily_calories: number | null
  avg_daily_protein_g: number | null
  avg_daily_carbs_g: number | null
  avg_daily_fat_g: number | null
  estimated_total_cost: number | null
  is_active: boolean
  generation_prompt: string | null
  created_at: string
  updated_at: string
}

// ============================================
// Recipe
// ============================================
export interface RecipeIngredient {
  name: string
  amount: number
  unit: string
  notes?: string
}

export interface RecipeInstruction {
  step: number
  text: string
}

export interface Recipe {
  id: string
  name: string
  description: string | null
  image_url: string | null

  // Cooking Details
  prep_time_minutes: number | null
  cook_time_minutes: number | null
  total_time_minutes: number | null
  servings: number
  difficulty: Difficulty | null

  // Nutrition (per serving)
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  fiber_g: number | null
  sugar_g: number | null
  sodium_mg: number | null

  // Ingredients & Instructions
  ingredients: RecipeIngredient[]
  instructions: RecipeInstruction[]

  // Categorization
  cuisine: string | null
  meal_type: MealType | null
  tags: string[]

  // Diet Compatibility
  is_vegetarian: boolean
  is_vegan: boolean
  is_gluten_free: boolean
  is_dairy_free: boolean
  is_keto: boolean
  allergens: string[]

  // Cost
  estimated_cost: number | null
  cost_per_serving: number | null

  // Source
  is_ai_generated: boolean
  source_url: string | null
  created_by: string | null

  // Timestamps
  created_at: string
  updated_at: string
}

// ============================================
// Meal Plan Item
// ============================================
export interface MealPlanItem {
  id: string
  meal_plan_id: string
  recipe_id: string | null
  plan_date: string
  meal_type: MealType
  meal_order: number
  servings: number
  recipe_name: string | null
  calories: number | null
  is_completed: boolean
  completed_at: string | null
  created_at: string
}

// ============================================
// Shopping List
// ============================================
export interface ShoppingList {
  id: string
  user_id: string
  meal_plan_id: string | null
  name: string
  start_date: string | null
  end_date: string | null
  estimated_total_cost: number | null
  created_at: string
  updated_at: string
}

export interface ShoppingListItem {
  id: string
  shopping_list_id: string
  ingredient_name: string
  quantity: number
  unit: string
  category: string | null
  estimated_cost: number | null
  notes: string | null
  is_purchased: boolean
  purchased_at: string | null
  created_at: string
}

// ============================================
// Food Log
// ============================================
export interface FoodLog {
  id: string
  user_id: string
  logged_at: string
  meal_type: MealType
  recipe_id: string | null
  food_name: string
  description: string | null
  servings: number
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  photo_url: string | null
  photo_analysis: string | null
  notes: string | null
  mood: Mood | null
  created_at: string
  updated_at: string
}

// ============================================
// Saved Recipe
// ============================================
export interface SavedRecipe {
  id: string
  user_id: string
  recipe_id: string
  folder_name: string
  notes: string | null
  saved_at: string
}

// ============================================
// API Response Types
// ============================================
export interface ActionResponse<T = void> {
  success: boolean
  data?: T
  error?: string
}

// ============================================
// Onboarding Form Types
// ============================================
export interface OnboardingGoalsData {
  primary_goal: PrimaryGoal
  weekly_goal_kg: number
  target_date: string
}

export interface OnboardingBodyStatsData {
  date_of_birth: string
  gender: Gender
  height_cm: number
  current_weight_kg: number
  target_weight_kg: number
  activity_level: ActivityLevel
}

export interface OnboardingDietaryData {
  diet_type: DietType
  allergies: string[]
  disliked_foods: string[]
}

export interface OnboardingPreferencesData {
  favorite_cuisines: string[]
  budget_level: BudgetLevel
  cooking_skill: CookingSkill
  meal_prep_time_minutes: number
  servings_per_meal: number
}


