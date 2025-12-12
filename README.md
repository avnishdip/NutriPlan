# NutriPlan - AI-Powered Meal Planning Application

A personalized meal planning and nutrition tracking web application built as part of CSI 4900 Honours Project at the University of Ottawa.

## Overview

NutriPlan helps users achieve their health and fitness goals through AI-generated personalized meal plans. The application considers user preferences, dietary restrictions, allergies, and fitness goals to create customized nutrition plans.

## Features

- **User Authentication**: Secure signup/login with Supabase Auth
- **Personalized Onboarding**: Multi-step survey to collect user preferences
- **AI Meal Plan Generation**: GPT-5 powered meal plan creation based on user profile
- **Recipe Management**: Detailed recipes with nutritional information
- **Smart Shopping Lists**: Auto-generated grocery lists with exact quantities
- **Food Logging**: Track daily meals with photo upload support
- **Progress Tracking**: Weight tracking with visual charts
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui (Radix Primitives), Lucide React icons
- **Backend/Database**: Supabase (PostgreSQL, Auth, Storage)
- **AI Integration**: OpenAI API (GPT-5)
- **Charts**: Recharts

## Project Structure

```
nutriplan/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (protected)/       # Protected routes (dashboard, etc.)
│   │   └── onboarding/        # User onboarding flow
│   ├── actions/               # Server actions for data mutations
│   ├── components/            # Reusable UI components
│   ├── lib/                   # Utility functions and configurations
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
└── DATABASE_SCHEMA.sql        # Database schema for Supabase
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/nutriplan.git
cd nutriplan
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your credentials to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

5. Set up the database:
   - Go to Supabase SQL Editor
   - Run the contents of `DATABASE_SCHEMA.sql`

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000)

## Database Schema

The application uses the following main tables:
- `profiles` - User profile and preferences
- `meal_plans` - Generated meal plans
- `recipes` - Individual recipes
- `meal_plan_items` - Links recipes to meal plans
- `shopping_lists` - Generated shopping lists
- `food_logs` - User food journal entries
- `weight_logs` - Weight tracking data

## API Integration

### OpenAI
The application uses GPT-5 to generate personalized meal plans based on:
- User's caloric and macro targets
- Dietary restrictions and allergies
- Cuisine preferences
- Cooking skill level


