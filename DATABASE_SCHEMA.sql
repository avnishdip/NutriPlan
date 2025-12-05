-- ============================================
-- NutriPlan Database Schema
-- CSI 4900 Honours Project - uOttawa
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- Stores user profile and onboarding data
-- ============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    
    -- Body Stats (from onboarding)
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    height_cm DECIMAL(5,2),
    current_weight_kg DECIMAL(5,2),
    target_weight_kg DECIMAL(5,2),
    activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
    
    -- Goals
    primary_goal TEXT CHECK (primary_goal IN ('lose_weight', 'gain_weight', 'build_muscle', 'maintain_weight', 'body_recomposition')),
    weekly_goal_kg DECIMAL(3,2), -- e.g., -0.5 kg/week for weight loss
    target_date DATE,
    
    -- Dietary Preferences
    diet_type TEXT CHECK (diet_type IN ('standard', 'vegetarian', 'vegan', 'pescatarian', 'keto', 'paleo', 'mediterranean', 'halal', 'kosher')),
    allergies TEXT[], -- Array of allergies: ['peanuts', 'shellfish', 'dairy', etc.]
    disliked_foods TEXT[], -- Foods user doesn't want
    favorite_cuisines TEXT[], -- ['italian', 'mexican', 'asian', etc.]
    
    -- Budget & Preferences
    budget_level TEXT CHECK (budget_level IN ('budget', 'moderate', 'premium')),
    cooking_skill TEXT CHECK (cooking_skill IN ('beginner', 'intermediate', 'advanced')),
    meal_prep_time_minutes INTEGER, -- Max time willing to spend cooking
    servings_per_meal INTEGER DEFAULT 1,
    
    -- Calculated Nutrition Targets (updated by AI or formulas)
    daily_calories_target INTEGER,
    daily_protein_g INTEGER,
    daily_carbs_g INTEGER,
    daily_fat_g INTEGER,
    
    -- Onboarding Status
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_step INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WEIGHT LOGS TABLE
-- Track daily weight entries
-- ============================================
CREATE TABLE weight_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    weight_kg DECIMAL(5,2) NOT NULL,
    logged_at DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- One entry per day per user
    UNIQUE(user_id, logged_at)
);

-- ============================================
-- MEAL PLANS TABLE
-- AI-generated meal plans
-- ============================================
CREATE TABLE meal_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Plan Details
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Plan Stats (totals/averages)
    total_days INTEGER NOT NULL,
    avg_daily_calories INTEGER,
    avg_daily_protein_g INTEGER,
    avg_daily_carbs_g INTEGER,
    avg_daily_fat_g INTEGER,
    estimated_total_cost DECIMAL(10,2),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    generation_prompt TEXT, -- Store the prompt used to generate this plan
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RECIPES TABLE
-- Individual recipes (can be AI-generated or user-added)
-- ============================================
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Recipe Info
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    
    -- Cooking Details
    prep_time_minutes INTEGER,
    cook_time_minutes INTEGER,
    total_time_minutes INTEGER GENERATED ALWAYS AS (prep_time_minutes + cook_time_minutes) STORED,
    servings INTEGER DEFAULT 1,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    
    -- Nutrition (per serving)
    calories INTEGER,
    protein_g DECIMAL(6,2),
    carbs_g DECIMAL(6,2),
    fat_g DECIMAL(6,2),
    fiber_g DECIMAL(6,2),
    sugar_g DECIMAL(6,2),
    sodium_mg DECIMAL(8,2),
    
    -- Ingredients & Instructions (stored as JSON for flexibility)
    ingredients JSONB NOT NULL, -- [{name, amount, unit, notes}]
    instructions JSONB NOT NULL, -- [{step, text}]
    
    -- Categorization
    cuisine TEXT,
    meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    tags TEXT[], -- ['quick', 'meal-prep-friendly', 'high-protein', etc.]
    
    -- Diet Compatibility
    is_vegetarian BOOLEAN DEFAULT FALSE,
    is_vegan BOOLEAN DEFAULT FALSE,
    is_gluten_free BOOLEAN DEFAULT FALSE,
    is_dairy_free BOOLEAN DEFAULT FALSE,
    is_keto BOOLEAN DEFAULT FALSE,
    allergens TEXT[], -- ['peanuts', 'tree_nuts', 'dairy', etc.]
    
    -- Cost
    estimated_cost DECIMAL(8,2),
    cost_per_serving DECIMAL(8,2),
    
    -- Source
    is_ai_generated BOOLEAN DEFAULT TRUE,
    source_url TEXT,
    created_by UUID REFERENCES profiles(id),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MEAL PLAN ITEMS TABLE
-- Links recipes to meal plans for specific days/meals
-- ============================================
CREATE TABLE meal_plan_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE NOT NULL,
    recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
    
    -- When & What
    plan_date DATE NOT NULL,
    meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')) NOT NULL,
    meal_order INTEGER DEFAULT 1, -- For multiple snacks or ordering
    
    -- Servings (can differ from recipe default)
    servings DECIMAL(4,2) DEFAULT 1,
    
    -- Quick reference (denormalized for performance)
    recipe_name TEXT,
    calories INTEGER,
    
    -- Status
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SHOPPING LISTS TABLE
-- Generated from meal plans
-- ============================================
CREATE TABLE shopping_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE SET NULL,
    
    -- List Details
    name TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    
    -- Stats
    estimated_total_cost DECIMAL(10,2),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SHOPPING LIST ITEMS TABLE
-- Individual items on a shopping list
-- ============================================
CREATE TABLE shopping_list_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shopping_list_id UUID REFERENCES shopping_lists(id) ON DELETE CASCADE NOT NULL,
    
    -- Item Details
    ingredient_name TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit TEXT NOT NULL,
    category TEXT, -- 'produce', 'dairy', 'meat', 'pantry', etc.
    
    -- Optional
    estimated_cost DECIMAL(8,2),
    notes TEXT,
    
    -- Status
    is_purchased BOOLEAN DEFAULT FALSE,
    purchased_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FOOD LOGS TABLE
-- Daily food/meal logging with photo uploads
-- ============================================
CREATE TABLE food_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Log Details
    logged_at TIMESTAMPTZ DEFAULT NOW(),
    meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')) NOT NULL,
    
    -- Food Info (can be from recipe or manual entry)
    recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
    food_name TEXT NOT NULL,
    description TEXT,
    servings DECIMAL(4,2) DEFAULT 1,
    
    -- Nutrition (actual consumed)
    calories INTEGER,
    protein_g DECIMAL(6,2),
    carbs_g DECIMAL(6,2),
    fat_g DECIMAL(6,2),
    
    -- Photo Journal
    photo_url TEXT,
    photo_analysis TEXT, -- AI analysis of the food photo
    
    -- Notes
    notes TEXT,
    mood TEXT CHECK (mood IN ('great', 'good', 'okay', 'bad')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SAVED RECIPES TABLE
-- User's favorited/saved recipes
-- ============================================
CREATE TABLE saved_recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
    
    -- Optional Organization
    folder_name TEXT DEFAULT 'Favorites',
    notes TEXT,
    
    -- Timestamps
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- One save per user per recipe
    UNIQUE(user_id, recipe_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_weight_logs_user_date ON weight_logs(user_id, logged_at DESC);
CREATE INDEX idx_meal_plans_user_active ON meal_plans(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_meal_plan_items_plan_date ON meal_plan_items(meal_plan_id, plan_date);
CREATE INDEX idx_food_logs_user_date ON food_logs(user_id, logged_at DESC);
CREATE INDEX idx_recipes_meal_type ON recipes(meal_type);
CREATE INDEX idx_recipes_diet ON recipes(is_vegetarian, is_vegan, is_gluten_free);
CREATE INDEX idx_shopping_list_items_list ON shopping_list_items(shopping_list_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Weight Logs: Users can only access their own logs
CREATE POLICY "Users can manage own weight logs" ON weight_logs FOR ALL USING (auth.uid() = user_id);

-- Meal Plans: Users can only access their own plans
CREATE POLICY "Users can manage own meal plans" ON meal_plans FOR ALL USING (auth.uid() = user_id);

-- Meal Plan Items: Access through meal plan ownership
CREATE POLICY "Users can manage own meal plan items" ON meal_plan_items FOR ALL 
    USING (EXISTS (SELECT 1 FROM meal_plans WHERE meal_plans.id = meal_plan_items.meal_plan_id AND meal_plans.user_id = auth.uid()));

-- Recipes: Public read, users can create their own
CREATE POLICY "Anyone can view recipes" ON recipes FOR SELECT USING (true);
CREATE POLICY "Users can create recipes" ON recipes FOR INSERT WITH CHECK (auth.uid() = created_by OR created_by IS NULL);
CREATE POLICY "Users can update own recipes" ON recipes FOR UPDATE USING (auth.uid() = created_by);

-- Shopping Lists: Users can only access their own
CREATE POLICY "Users can manage own shopping lists" ON shopping_lists FOR ALL USING (auth.uid() = user_id);

-- Shopping List Items: Access through list ownership
CREATE POLICY "Users can manage own shopping list items" ON shopping_list_items FOR ALL 
    USING (EXISTS (SELECT 1 FROM shopping_lists WHERE shopping_lists.id = shopping_list_items.shopping_list_id AND shopping_lists.user_id = auth.uid()));

-- Food Logs: Users can only access their own logs
CREATE POLICY "Users can manage own food logs" ON food_logs FOR ALL USING (auth.uid() = user_id);

-- Saved Recipes: Users can only access their own saves
CREATE POLICY "Users can manage own saved recipes" ON saved_recipes FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON meal_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shopping_lists_updated_at BEFORE UPDATE ON shopping_lists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_food_logs_updated_at BEFORE UPDATE ON food_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SAMPLE DATA COMMENTS
-- ============================================
-- To populate with sample recipes, you can insert them after running this schema.
-- The AI will generate recipes on-demand based on user preferences.

