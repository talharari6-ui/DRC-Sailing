# DRC Sailing Club Management System

## Project Overview
Hebrew-language (RTL) sailing club management app for Daniel Center (מרכז דניאל).
Coaches manage schedules, sailors, attendance, and work hours. Admins manage all resources.

## Tech Stack
- **Framework**: Next.js 14 (App Router) with React 18.2
- **Language**: JavaScript/JSX (TypeScript migration planned, tsconfig ready)
- **Database**: Supabase (PostgreSQL) via `@supabase/supabase-js`
- **UI Components**: shadcn/ui (migration in progress from inline styles)
- **Styling**: Tailwind CSS — ALL styling must use Tailwind utility classes
- **Deployment**: Vercel
- **Package Manager**: npm

## Mandatory Standards

### Styling Rules (STRICT)
- **ONLY use Tailwind CSS utility classes** for all styling. Never use inline `style={{}}` objects
- **Use shadcn/ui components** for all UI elements (Button, Card, Dialog, Input, Select, Badge, etc.)
- When a shadcn component exists for a UI pattern, use it. Do not build custom alternatives
- Use `cn()` utility from `@/lib/utils` for conditional class merging
- Define theme colors in `tailwind.config.js` and `globals.css` CSS variables — never hardcode color values
- RTL support: use Tailwind logical properties (`ps-4`, `pe-4`, `ms-auto`, `me-auto`) instead of `pl-`, `pr-`, `ml-`, `mr-`

### Next.js Best Practices (STRICT)
- **Server Components by default**: Only add `'use client'` when the component uses hooks, event handlers, or browser APIs
- **Use `<Link>` from `next/link`** for all internal navigation — never use `<a>` tags for internal links
- **Use `next/dynamic`** for heavy components loaded conditionally (modals, charts, rich editors)
- **Use `next/image`** for all images
- **API routes**: Keep server-side logic in API routes or Server Actions. Don't expose Supabase client to the browser
- **Parallel data fetching**: Use `Promise.all()` when fetching multiple independent resources
- **Metadata**: Export `metadata` objects from Server Component pages for SEO

### React Best Practices (STRICT)
- **Never call hooks after conditional returns** — hooks must always be called in the same order
- **Wrap data-loading functions in `useCallback`** when used in `useEffect` dependency arrays
- **Use primitive values in dependency arrays** (e.g., `coach?.id` not `coach`) to prevent unnecessary re-renders
- **Use `useMemo`** for expensive derived computations (filtering, sorting large lists)
- **Use ternary (`? :`) for conditional rendering**, not `&&` (avoids rendering `0` or empty string)

### Data Fetching
- Use SWR or React Query for client-side data fetching (deduplication, caching, revalidation)
- For server-side: fetch in Server Components or API routes, never in `useEffect` of Server Components
- Always check `res.ok` before parsing JSON responses
- Handle loading and error states explicitly in every page

## Architecture

### Directory Structure
```
app/                    # Next.js App Router
├── page.js             # Login page
├── layout.js           # Root layout (Server Component) — wraps AuthProvider + DataProvider
├── api/                # API routes (server-side, Supabase queries)
│   ├── auth/           # Login/logout
│   ├── coaches/        # Coach CRUD
│   ├── sailors/        # Sailor CRUD
│   ├── groups/         # Group CRUD + group-sailor relations
│   ├── sessions/       # Sessions, attendance, substitutions
│   └── hours/          # Work hours
├── (coach)/            # Protected coach routes (route group)
│   ├── layout.js       # Header + BottomNav + ProtectedRoute wrapper
│   ├── schedule/       # Calendar with month/week/day views
│   ├── sailors/        # Sailor list
│   ├── hours/          # Work hours tracking
│   ├── history/        # Session history
│   └── profile/        # Coach profile
└── admin/              # Admin-only routes
    ├── layout.js       # Same wrapper with requireAdmin=true
    ├── dashboard/      # Stats + calendar overview
    ├── coaches/        # Coach management
    ├── sailors/        # Sailor management
    ├── absences/       # Placeholder
    └── substitutions/  # Placeholder

src/
├── components/         # Reusable UI components (.jsx)
│   └── ui/             # shadcn/ui components (auto-generated, do not edit manually)
├── context/            # AuthContext + DataContext (React Context + useReducer)
├── hooks/              # Custom hooks (useAuth, useData)
├── lib/                # supabase client, API helpers, constants, utils
└── styles/             # globals.css (Tailwind directives + CSS variables)
```

### Key Patterns
- **Auth**: Login code → API → Supabase → localStorage + AuthContext
- **Data flow**: Pages fetch via `fetch('/api/...')` → API routes query Supabase → JSON response
- **Components**: Functional components with hooks, `'use client'` only when needed
- **API routes**: `getSupabaseClient()` → query → error handling → `Response.json()`
- **Exports**: Default exports for pages; named exports for shared components

### Database Tables (Supabase)
- `coaches` (id, name, email, login_code, is_admin, avatar_url)
- `sailors` (id, first_name, last_name, birth_date, parent_name, parent_phone, shirt_size, gender, boat)
- `groups` (id, name, coach_id, color, days_of_week, start_time, end_time, start_date)
- `group_sailors` (group_id, sailor_id) — many-to-many junction table
- `sessions` (id, group_id, date, start_time, end_time, coach_id, substitute_coach_id, cancelled, admin_approved)
- `attendance` (session_id, sailor_id, present, reason)
- `work_hours` (id, coach_id, date, start_time, end_time, notes)

## Conventions

### Code Style
- All UI text in Hebrew, RTL layout (`dir="rtl"` on `<html>`)
- Error messages in Hebrew
- `'use client'` only on components that truly need client-side features
- Default exports for pages, named exports for reusable components

### API Routes
- Always use `getSupabaseClient()` from `@/src/lib/supabase`
- Return `Response.json(data)` for success, `Response.json({ error }, { status })` for errors
- Validate required fields, return 400 with Hebrew error messages
- Log errors with `console.error('RouteName METHOD error:', error)`

### Import Aliases
- `@/src/*` → `src/*` directory
- `@/*` → project root

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=<supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

## Running the Project
```bash
npm install
npm run dev     # Development server on localhost:3000
npm run build   # Production build
npm run start   # Start production server
```

## Known Issues & Technical Debt
- React Rules of Hooks violation in `schedule/page.js` (useEffect after conditional return)
- Sequential API calls in pages that should use `Promise.all()`
- Modals statically imported instead of using `next/dynamic`
- No SWR/React Query — manual `fetch` + `useState` everywhere
- Inline styles throughout — needs migration to Tailwind + shadcn/ui
- localStorage auth without schema versioning
- `<a>` tags instead of Next.js `<Link>` in admin dashboard
- Missing `useCallback` wrappers on data-loading functions in useEffect deps
- Object references in useCallback dependency arrays instead of primitives
- Admin absences and substitutions pages are placeholders
- Duplicate `@keyframes` in inline `<style>` tags (already defined in globals.css)
