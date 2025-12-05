// ============================================
// NutriPlan - Constants & Options
// ============================================

export const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', description: 'Little or no exercise, desk job' },
  { value: 'lightly_active', label: 'Lightly Active', description: 'Light exercise 1-3 days/week' },
  { value: 'moderately_active', label: 'Moderately Active', description: 'Moderate exercise 3-5 days/week' },
  { value: 'very_active', label: 'Very Active', description: 'Hard exercise 6-7 days/week' },
  { value: 'extremely_active', label: 'Extremely Active', description: 'Very hard exercise, physical job' },
] as const

export const PRIMARY_GOALS = [
  { value: 'lose_weight', label: 'Lose Weight', emoji: '🔥', description: 'Reduce body fat and get leaner' },
  { value: 'gain_weight', label: 'Gain Weight', emoji: '📈', description: 'Build mass and size' },
  { value: 'build_muscle', label: 'Build Muscle', emoji: '💪', description: 'Gain lean muscle mass' },
  { value: 'maintain_weight', label: 'Maintain Weight', emoji: '⚖️', description: 'Keep your current weight stable' },
  { value: 'body_recomposition', label: 'Body Recomposition', emoji: '🔄', description: 'Lose fat and gain muscle simultaneously' },
] as const

export const DIET_TYPES = [
  { value: 'standard', label: 'No Restrictions', description: 'I eat everything' },
  { value: 'vegetarian', label: 'Vegetarian', description: 'No meat or fish' },
  { value: 'vegan', label: 'Vegan', description: 'No animal products' },
  { value: 'pescatarian', label: 'Pescatarian', description: 'Vegetarian + seafood' },
  { value: 'keto', label: 'Keto', description: 'Very low carb, high fat' },
  { value: 'paleo', label: 'Paleo', description: 'Whole foods, no processed foods' },
  { value: 'mediterranean', label: 'Mediterranean', description: 'Plant-based with healthy fats' },
  { value: 'halal', label: 'Halal', description: 'Following Islamic dietary laws' },
  { value: 'kosher', label: 'Kosher', description: 'Following Jewish dietary laws' },
] as const

export const COMMON_ALLERGIES = [
  { value: 'dairy', label: 'Dairy' },
  { value: 'eggs', label: 'Eggs' },
  { value: 'peanuts', label: 'Peanuts' },
  { value: 'tree_nuts', label: 'Tree Nuts' },
  { value: 'soy', label: 'Soy' },
  { value: 'wheat', label: 'Wheat/Gluten' },
  { value: 'fish', label: 'Fish' },
  { value: 'shellfish', label: 'Shellfish' },
  { value: 'sesame', label: 'Sesame' },
] as const

export const CUISINES = [
  { value: 'american', label: 'American' },
  { value: 'italian', label: 'Italian' },
  { value: 'mexican', label: 'Mexican' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'korean', label: 'Korean' },
  { value: 'thai', label: 'Thai' },
  { value: 'indian', label: 'Indian' },
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'middle_eastern', label: 'Middle Eastern' },
  { value: 'french', label: 'French' },
  { value: 'greek', label: 'Greek' },
] as const

export const BUDGET_LEVELS = [
  { value: 'budget', label: 'Budget-Friendly', description: 'Keep costs low', emoji: '💵' },
  { value: 'moderate', label: 'Moderate', description: 'Balance of quality and cost', emoji: '💰' },
  { value: 'premium', label: 'Premium', description: 'Best ingredients, no budget limit', emoji: '💎' },
] as const

export const COOKING_SKILLS = [
  { value: 'beginner', label: 'Beginner', description: 'Simple recipes, minimal techniques' },
  { value: 'intermediate', label: 'Intermediate', description: 'Comfortable with most recipes' },
  { value: 'advanced', label: 'Advanced', description: 'Bring on the challenge!' },
] as const

export const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { value: 'lunch', label: 'Lunch', emoji: '☀️' },
  { value: 'dinner', label: 'Dinner', emoji: '🌙' },
  { value: 'snack', label: 'Snack', emoji: '🍎' },
] as const

export const GROCERY_CATEGORIES = [
  'Produce',
  'Meat & Seafood',
  'Dairy & Eggs',
  'Bakery',
  'Frozen',
  'Pantry',
  'Canned Goods',
  'Condiments & Sauces',
  'Snacks',
  'Beverages',
  'Other',
] as const

// Weekly goal ranges based on primary goal
export const WEEKLY_GOAL_OPTIONS = {
  lose_weight: [
    { value: -0.25, label: 'Slow (-0.25 kg/week)' },
    { value: -0.5, label: 'Moderate (-0.5 kg/week)' },
    { value: -0.75, label: 'Fast (-0.75 kg/week)' },
    { value: -1, label: 'Aggressive (-1 kg/week)' },
  ],
  gain_weight: [
    { value: 0.25, label: 'Slow (+0.25 kg/week)' },
    { value: 0.5, label: 'Moderate (+0.5 kg/week)' },
    { value: 0.75, label: 'Fast (+0.75 kg/week)' },
  ],
  build_muscle: [
    { value: 0.25, label: 'Lean Bulk (+0.25 kg/week)' },
    { value: 0.5, label: 'Standard Bulk (+0.5 kg/week)' },
  ],
  maintain_weight: [
    { value: 0, label: 'Maintain' },
  ],
  body_recomposition: [
    { value: 0, label: 'Maintain weight while changing composition' },
  ],
} as const

// Onboarding steps
export const ONBOARDING_STEPS = [
  { step: 1, path: '/onboarding/goals', title: 'Your Goals' },
  { step: 2, path: '/onboarding/body-stats', title: 'Body Stats' },
  { step: 3, path: '/onboarding/dietary', title: 'Dietary Preferences' },
  { step: 4, path: '/onboarding/preferences', title: 'Cooking Preferences' },
  { step: 5, path: '/onboarding/complete', title: 'All Set!' },
] as const


