/**
 * Utility Functions Module
 * 
 * Contains helper functions for:
 * - CSS class name merging (Tailwind)
 * - Nutrition calculations (BMR, TDEE, Macros)
 * - Date and formatting utilities
 * 
 * @module lib/utils
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges Tailwind CSS classes intelligently
 * Handles class conflicts and deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculate BMR using Mifflin-St Jeor Equation
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  ageYears: number,
  gender: 'male' | 'female'
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears
  return gender === 'male' ? base + 5 : base - 161
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 */
export function calculateTDEE(bmr: number, activityLevel: string): number {
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extremely_active: 1.9,
  }
  return Math.round(bmr * (multipliers[activityLevel] || 1.2))
}

/**
 * Calculate daily calorie target based on goal
 */
export function calculateCalorieTarget(
  tdee: number,
  primaryGoal: string,
  weeklyGoalKg: number
): number {
  // 1 kg of fat ≈ 7700 calories
  const dailyDeficitOrSurplus = (weeklyGoalKg * 7700) / 7

  switch (primaryGoal) {
    case 'lose_weight':
      return Math.round(tdee + dailyDeficitOrSurplus) // weeklyGoalKg is negative
    case 'gain_weight':
    case 'build_muscle':
      return Math.round(tdee + dailyDeficitOrSurplus)
    case 'maintain_weight':
    case 'body_recomposition':
    default:
      return Math.round(tdee)
  }
}

/**
 * Calculate macronutrient targets
 */
export function calculateMacros(
  calorieTarget: number,
  primaryGoal: string,
  weightKg: number
): { protein: number; carbs: number; fat: number } {
  let proteinGramsPerKg: number
  let fatPercentage: number

  switch (primaryGoal) {
    case 'build_muscle':
      proteinGramsPerKg = 2.0
      fatPercentage = 0.25
      break
    case 'lose_weight':
    case 'body_recomposition':
      proteinGramsPerKg = 1.8
      fatPercentage = 0.25
      break
    case 'gain_weight':
      proteinGramsPerKg = 1.6
      fatPercentage = 0.3
      break
    default:
      proteinGramsPerKg = 1.4
      fatPercentage = 0.3
  }

  const protein = Math.round(weightKg * proteinGramsPerKg)
  const fat = Math.round((calorieTarget * fatPercentage) / 9)
  const carbCalories = calorieTarget - (protein * 4) - (fat * 9)
  const carbs = Math.round(carbCalories / 4)

  return { protein, carbs, fat }
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: string): number {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Format weight with unit
 */
export function formatWeight(kg: number): string {
  return `${kg.toFixed(1)} kg`
}

/**
 * Format calories
 */
export function formatCalories(cal: number): string {
  return `${cal.toLocaleString()} kcal`
}

/**
 * Get greeting based on time of day
 */
export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

/**
 * Get current meal type based on time
 */
export function getCurrentMealType(): 'breakfast' | 'lunch' | 'dinner' | 'snack' {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 11) return 'breakfast'
  if (hour >= 11 && hour < 15) return 'lunch'
  if (hour >= 15 && hour < 18) return 'snack'
  return 'dinner'
}
