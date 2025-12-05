# NutriPlan - Setup Guide

> CSI 4900 Honours Project - Personalized Meal Planning & Nutrition App

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- An OpenAI API key (for GPT-4o)

---

## Step 1: Create Next.js Project

```bash
npx create-next-app@latest nutriplan --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd nutriplan
```

When prompted:
- ✅ TypeScript: Yes
- ✅ ESLint: Yes
- ✅ Tailwind CSS: Yes
- ✅ `src/` directory: Yes
- ✅ App Router: Yes
- ✅ Import alias: @/*

---

## Step 2: Install Shadcn UI

```bash
npx shadcn@latest init
```

When prompted, select:
- Style: **Default**
- Base color: **Neutral** (or your preference)
- CSS variables: **Yes**

Then install components we'll need:

```bash
npx shadcn@latest add button card input label select textarea progress avatar dropdown-menu dialog sheet tabs badge separator skeleton toast calendar popover command
```

---

## Step 3: Install Supabase

```bash
npm install @supabase/supabase-js @supabase/ssr
```

Create `.env.local` in your project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

---

## Step 4: Set Up Supabase Client

Create the following files for Supabase SSR integration:

### `src/lib/supabase/client.ts`
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### `src/lib/supabase/server.ts`
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  )
}
```

### `src/middleware.ts`
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect routes - redirect to login if not authenticated
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/signup') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    request.nextUrl.pathname !== '/'
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## Step 5: Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and run the contents of `DATABASE_SCHEMA.sql` (included in this repo)

---

## Step 6: Enable Supabase Storage

1. Go to **Storage** in your Supabase dashboard
2. Create a new bucket called `meal-photos`
3. Set it to **Public** (or configure RLS policies for private access)

---

## Step 7: Additional Dependencies

```bash
# For date handling
npm install date-fns

# For form validation
npm install zod react-hook-form @hookform/resolvers

# For AI integration
npm install openai

# For charts (weight tracking)
npm install recharts
```

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (protected)/
│   │   ├── dashboard/page.tsx
│   │   ├── meal-plans/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── recipes/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── food-log/page.tsx
│   │   ├── shopping-list/page.tsx
│   │   ├── progress/page.tsx
│   │   └── settings/page.tsx
│   ├── onboarding/
│   │   ├── page.tsx
│   │   ├── goals/page.tsx
│   │   ├── body-stats/page.tsx
│   │   ├── dietary/page.tsx
│   │   ├── preferences/page.tsx
│   │   └── complete/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/           # Shadcn components
│   ├── forms/        # Form components
│   ├── layout/       # Layout components
│   └── features/     # Feature-specific components
├── lib/
│   ├── supabase/
│   ├── openai/
│   ├── utils.ts
│   └── constants.ts
├── actions/          # Server actions
├── types/            # TypeScript types
└── hooks/            # Custom hooks
```

---

## Running the Project

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## Next Steps

1. ✅ Set up the project with this guide
2. Run the database schema in Supabase
3. Start building the onboarding flow
4. Implement authentication
5. Build the AI meal plan generator
6. Create the dashboard and meal tracking features

