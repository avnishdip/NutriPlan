/**
 * OpenAI Integration Module
 * 
 * This module handles all interactions with the OpenAI API for:
 * - Generating personalized meal plans using GPT-4
 * - Analyzing food photos for nutritional estimation
 * 
 * @module lib/openai
 */

import OpenAI from 'openai'

// Initialize the OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface MealPlanRequest {
  // User profile data
  dailyCalories: number
  dailyProtein: number
  dailyCarbs: number
  dailyFat: number
  
  // Preferences
  dietType: string
  allergies: string[]
  dislikedFoods: string[]
  favoriteCuisines: string[]
  cookingSkill: string
  maxPrepTime: number
  budgetLevel: string
  servingsPerMeal: number
  
  // Plan parameters
  numberOfDays: number
  mealsPerDay: number // 3 or 4 (with snack)
}

export interface GeneratedMeal {
  name: string
  description: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  prepTime: number
  cookTime: number
  servings: number
  difficulty: 'easy' | 'medium' | 'hard'
  
  // Nutrition per serving
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  
  // Recipe details
  ingredients: {
    name: string
    amount: number
    unit: string
  }[]
  instructions: string[]
  
  // Tags
  cuisine: string
  tags: string[]
  estimatedCost: number
}

export interface GeneratedDayPlan {
  day: number
  date: string
  meals: GeneratedMeal[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
}

export interface GeneratedMealPlan {
  name: string
  description: string
  days: GeneratedDayPlan[]
  shoppingList: {
    category: string
    items: {
      name: string
      amount: number
      unit: string
      estimatedCost: number
    }[]
  }[]
  totalEstimatedCost: number
}

/**
 * Generates a personalized meal plan using OpenAI GPT-4
 * 
 * Takes user preferences and nutritional requirements and generates
 * a complete meal plan with recipes and shopping list.
 * 
 * @param request - User's meal plan requirements and preferences
 * @returns Promise containing the generated meal plan with recipes
 */
export async function generateMealPlan(request: MealPlanRequest): Promise<GeneratedMealPlan> {
  // Build the prompt with user's specific requirements
  const prompt = buildMealPlanPrompt(request)
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a professional nutritionist and chef. Generate detailed, practical meal plans with accurate nutritional information. 
        
Always respond with valid JSON matching the exact schema provided. Be precise with measurements and nutritional values.
Consider the user's dietary restrictions, allergies, and preferences carefully.
Make recipes realistic and achievable for home cooks.`
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
    max_tokens: 16000,
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('No response from OpenAI')
  }

  const mealPlan = JSON.parse(content) as GeneratedMealPlan
  return mealPlan
}

function buildMealPlanPrompt(request: MealPlanRequest): string {
  const allergiesText = request.allergies.length > 0 
    ? `ALLERGIES (MUST AVOID): ${request.allergies.join(', ')}` 
    : 'No allergies'
  
  const dislikedText = request.dislikedFoods.length > 0
    ? `Foods to avoid: ${request.dislikedFoods.join(', ')}`
    : ''
  
  const cuisinesText = request.favoriteCuisines.length > 0
    ? `Preferred cuisines: ${request.favoriteCuisines.join(', ')}`
    : 'Any cuisine'

  return `Generate a ${request.numberOfDays}-day meal plan with the following requirements:

## NUTRITION TARGETS (per day)
- Calories: ${request.dailyCalories} kcal
- Protein: ${request.dailyProtein}g
- Carbs: ${request.dailyCarbs}g
- Fat: ${request.dailyFat}g

## DIETARY REQUIREMENTS
- Diet type: ${request.dietType}
- ${allergiesText}
- ${dislikedText}
- ${cuisinesText}

## PREFERENCES
- Cooking skill: ${request.cookingSkill}
- Max prep + cook time: ${request.maxPrepTime} minutes
- Budget: ${request.budgetLevel}
- Servings per meal: ${request.servingsPerMeal}
- Meals per day: ${request.mealsPerDay} (${request.mealsPerDay === 4 ? 'breakfast, lunch, dinner, snack' : 'breakfast, lunch, dinner'})

## OUTPUT FORMAT
Return a JSON object with this exact structure:
{
  "name": "Meal Plan Name",
  "description": "Brief description of the meal plan",
  "days": [
    {
      "day": 1,
      "date": "Day 1",
      "meals": [
        {
          "name": "Meal name",
          "description": "Brief description",
          "mealType": "breakfast|lunch|dinner|snack",
          "prepTime": 10,
          "cookTime": 15,
          "servings": ${request.servingsPerMeal},
          "difficulty": "easy|medium|hard",
          "calories": 400,
          "protein": 25,
          "carbs": 40,
          "fat": 15,
          "fiber": 5,
          "ingredients": [
            {"name": "ingredient", "amount": 100, "unit": "g"}
          ],
          "instructions": ["Step 1", "Step 2"],
          "cuisine": "Italian",
          "tags": ["high-protein", "quick"],
          "estimatedCost": 5.50
        }
      ],
      "totalCalories": 2000,
      "totalProtein": 150,
      "totalCarbs": 200,
      "totalFat": 70
    }
  ],
  "shoppingList": [
    {
      "category": "Produce",
      "items": [
        {"name": "Spinach", "amount": 200, "unit": "g", "estimatedCost": 3.00}
      ]
    }
  ],
  "totalEstimatedCost": 75.00
}

IMPORTANT:
- Ensure daily totals are close to the nutrition targets (within 10%)
- Combine shopping list items across all days (aggregate quantities)
- Use practical measurements (cups, tbsp, pieces, grams)
- Prices should be in USD
- Make recipes varied and interesting
- Consider meal prep efficiency (ingredients used across multiple meals)`
}

// Analyze food photo using GPT-4o Vision
export async function analyzeFoodPhoto(imageBase64: string): Promise<{
  foodName: string
  description: string
  estimatedCalories: number
  estimatedProtein: number
  estimatedCarbs: number
  estimatedFat: number
  confidence: 'low' | 'medium' | 'high'
  suggestions: string[]
}> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a nutrition expert. Analyze food photos and estimate nutritional content.
Always respond with valid JSON. Be conservative with estimates and indicate confidence level.`
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this food photo and provide nutritional estimates. Return JSON:
{
  "foodName": "Name of the dish/food",
  "description": "Brief description of what you see",
  "estimatedCalories": 500,
  "estimatedProtein": 30,
  "estimatedCarbs": 50,
  "estimatedFat": 20,
  "confidence": "low|medium|high",
  "suggestions": ["Any health tips or observations"]
}`
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`
            }
          }
        ]
      }
    ],
    response_format: { type: 'json_object' },
    max_tokens: 1000,
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('No response from OpenAI')
  }

  return JSON.parse(content)
}

export default openai


