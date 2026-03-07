# Vercel React Best Practices Review + shadcn Migration Plan

## Full Codebase Review — Findings by Priority

### CRITICAL: Eliminating Waterfalls

- [ ] **`app/(coach)/sailors/page.js:16-31`** — Sequential fetch waterfall
  - `loadData()` fetches sailors THEN groups one after another
  - Fix: Use `Promise.all([fetch('/api/sailors'), fetch('/api/groups?...')])`
  - Rule: `async-parallel`

- [ ] **`app/(coach)/schedule/page.js:29-56`** — React Rules of Hooks VIOLATION
  - `useEffect` is called AFTER a conditional return on line 25-27
  - This is a React crash bug — hooks must always be called in the same order
  - Fix: Move the early return BELOW all hook calls, or guard inside useEffect

### CRITICAL: Bundle Size Optimization

- [ ] **`app/(coach)/schedule/page.js:6-10`** — Static imports for conditional modals
  - `SessionDetailModal`, `SailorManagementModal`, `SubstituteCoachModal` are all imported statically but only rendered when modal state is true
  - Fix: Use `next/dynamic` with `{ ssr: false }` for all three
  - Rule: `bundle-dynamic-imports`

### HIGH: Server-Side Performance

- [ ] **`app/(coach)/layout.js` and `app/admin/layout.js`** — Unnecessary `'use client'`
  - These layouts only compose other client components — they don't need `'use client'` themselves
  - Without it, Next.js can render the wrapper HTML on the server and only hydrate client components
  - Fix: Remove `'use client'`, keep the imports (client components can be children of server components)
  - Rule: `server-serialization`

### MEDIUM-HIGH: Client-Side Data Fetching

- [ ] **All pages** — No data fetching library
  - Every page uses raw `fetch()` + `useState` + `useEffect` for data loading
  - This means no request deduplication, no caching, no stale-while-revalidate
  - Files: `schedule/page.js`, `sailors/page.js`, `hours/page.js`, `history/page.js`, `admin/dashboard/page.js`, `admin/coaches/page.js`, `admin/sailors/page.js`
  - Fix: Install SWR and replace manual fetch patterns with `useSWR()`
  - Rule: `client-swr-dedup`

- [ ] **`src/context/AuthContext.js:57-69`** — localStorage without versioning
  - Coach data stored/read from localStorage with no schema version
  - If data shape changes, old cached data will cause bugs
  - Fix: Add version key, validate schema on read
  - Rule: `client-localstorage-schema`

### MEDIUM: Re-render Optimization

- [ ] **`app/(coach)/schedule/page.js:58-65,173`** — Unoptimized derived state
  - `getFilteredSessions()` recalculates on every render
  - Fix: Use `useMemo(() => sessions.filter(...), [sessions, filterMode, coach?.id])`
  - Rule: `rerender-derived-state`

- [ ] **`app/(coach)/schedule/page.js:150-171`** — `getWeekDays()` recreates array every render
  - Creates 7 Date objects and an array on every render call
  - Fix: Memoize with `useMemo(..., [currentDate])`
  - Rule: `js-cache-function-results`

- [ ] **`src/context/DataContext.js:30,63`** — Object in useCallback deps
  - `loadGroups` and `loadSessions` use `coach` object in dependency array
  - Object identity changes on every render, recreating the callback unnecessarily
  - Fix: Use `coach?.id` and `coach?.is_admin` as separate primitive deps
  - Rule: `rerender-dependencies`

- [ ] **`sailors/page.js:12`, `hours/page.js:14`, `history/page.js:12`** — Missing useCallback
  - `loadData`, `loadHours`, `loadHistory` are defined as regular functions but referenced in `useEffect` deps
  - This causes ESLint warnings and potential stale closures
  - Fix: Wrap in `useCallback` or define inside useEffect

### MEDIUM: Rendering Performance

- [ ] **Multiple components** — Inline `<style>` tags with duplicate animations
  - `LoginPage`, `ProtectedRoute`, `Modal`, `Toast` each define `@keyframes spin/slideUp/fadeIn` inline
  - These are already defined in `globals.css`!
  - Fix: Remove all inline `<style>` blocks, rely on globals.css
  - Rule: `rendering-hoist-jsx`

- [ ] **`app/admin/dashboard/page.js:141-164`** — `<a>` tags instead of `<Link>`
  - Quick links use `<a href>` causing full-page navigation instead of client-side routing
  - Fix: Import `Link` from `next/link` and replace `<a>` tags
  - Next.js core pattern

- [ ] **All components** — Massive inline style objects
  - Every component creates new `style={{}}` objects on every render
  - This prevents React from optimizing re-renders and makes code unmaintainable
  - Fix: Migrate to Tailwind utility classes (part of shadcn migration)

### GOOD PATTERNS FOUND (keep these)

- `app/admin/dashboard/page.js:27-39` — Uses `Promise.all()` for parallel fetching
- `app/layout.js` — Server Component wrapping client providers (correct pattern)
- `src/lib/supabase.js` — Singleton pattern for Supabase client
- `src/components/Calendar.jsx` — Clean composable component with render props (`getDayContent`)
- `src/hooks/useAuth.js` — Proper context consumer with error on missing provider
- Route groups `(coach)` for layout organization
- API routes validate inputs and return proper HTTP status codes

---

## shadcn/ui Migration Plan

### Phase 0: Setup (do first)
- [ ] Install shadcn/ui: `npx shadcn@latest init`
  - Style: Default
  - Base color: Slate (matches current dark theme)
  - CSS variables: Yes
  - Tailwind config: Update existing
  - Components directory: `src/components/ui`
  - Utils: `src/lib/utils.js` (adds `cn()` helper)
- [ ] Install required shadcn components:
  ```bash
  npx shadcn@latest add button card dialog input select badge avatar separator skeleton tabs toggle-group
  ```
- [ ] Update `globals.css` to merge current CSS variables with shadcn's theming system
- [ ] Configure dark mode in shadcn (project is dark-mode only)

### Phase 1: Foundation Components (low risk, high reuse)
- [ ] **Button** → Replace all `<button style={{...}}>` with `<Button variant="..." size="...">`
  - Map current styles: primary (blue gradient), ghost (transparent), destructive (red)
- [ ] **Card** → Replace all `<div style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>` with `<Card><CardContent>...</CardContent></Card>`
- [ ] **Input** → Replace all `<input style={{...}}>` with `<Input>`
- [ ] **Select** → Replace all `<select style={{...}}>` with shadcn `<Select>`
- [ ] **Badge** → Replace inline pill/tag elements with `<Badge>`
- [ ] **Skeleton** → Replace "טוען..." text with `<Skeleton>` loading states
- [ ] **Avatar** → Replace emoji-based avatar circles with `<Avatar>`
- [ ] **Separator** → Replace `borderTop: '1px solid var(--border)'` dividers

### Phase 2: Layout & Navigation
- [ ] **Header.jsx** → Tailwind classes for header bar
- [ ] **BottomNav.jsx** → Tailwind flex layout, use shadcn toggle styling for active states
- [ ] **ViewModeToggle.jsx** → Replace with shadcn `<ToggleGroup>`
- [ ] **FilterToggle.jsx** → Replace with shadcn `<ToggleGroup>`

### Phase 3: Modals & Complex Components
- [ ] **Modal.jsx** → Replace with shadcn `<Dialog>` / `<Sheet>` (bottom sheet for mobile)
- [ ] **SessionDetailModal.jsx** → Refactor onto shadcn Dialog + Card + Button
- [ ] **SubstituteCoachModal.jsx** → shadcn Dialog + list of Buttons
- [ ] **SailorManagementModal.jsx** → shadcn Dialog + Select + Input + Button
- [ ] **Toast.jsx** → Replace with shadcn `<Toaster>` + `toast()` from sonner

### Phase 4: Page-Level Migration
- [ ] **Login page** (`app/page.js`) — Card + Input + Button
- [ ] **Schedule page** — Calendar stays custom, but uses Card/Button/Badge
- [ ] **Sailors page** — Card list with Avatar + Badge
- [ ] **Hours page** — Card list with Badge for time ranges
- [ ] **History page** — Card list with Badge for status
- [ ] **Profile page** — Card + Avatar + Separator
- [ ] **Admin dashboard** — Card grid for stats + existing Calendar
- [ ] **Admin coaches/sailors** — Card lists matching coach page patterns

### Phase 5: Cleanup
- [ ] Remove all inline `style={{}}` objects — everything should be Tailwind
- [ ] Remove unused CSS classes from `globals.css` (keep only CSS variables + Tailwind directives)
- [ ] Remove duplicate `<style>` blocks from components
- [ ] Remove `src/lib/constants.js` COLORS object (replaced by CSS variables)
- [ ] Run `npm run build` and verify no regressions
