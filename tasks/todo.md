# DRC Sailing — Migration Complete

## Vercel React Best Practices — All Fixed

- [x] **CRITICAL: Hooks violation** — `schedule/page.js` useEffect after conditional return → moved guard below hooks
- [x] **CRITICAL: Fetch waterfall** — `sailors/page.js` sequential fetches → `Promise.all()`
- [x] **CRITICAL: Static modal imports** → `next/dynamic` with `{ ssr: false }`
- [x] **HIGH: DataContext deps** — Object refs in useCallback deps → primitive `coachId`/`isAdmin`
- [x] **MEDIUM: Missing useCallback** — `hours/page.js`, `history/page.js` → wrapped in `useCallback`
- [x] **MEDIUM: Derived state** — `schedule/page.js` filtering → `useMemo`
- [x] **MEDIUM: `<a>` → `<Link>`** — admin dashboard quick links
- [x] **MEDIUM: Inline styles removed** — ALL components migrated to Tailwind CSS
- [x] **MEDIUM: Duplicate `<style>` blocks** — removed from all components
- [x] **LOW: `swcMinify` removed** — deprecated in Next.js 14

## shadcn/ui Migration — Complete

- [x] **Phase 0**: shadcn/ui initialized with RTL, dark theme, Tailwind v3 HSL variables
- [x] **Phase 1**: Button, Card, Input, Select, Badge, Avatar, Separator, Skeleton, Label installed
- [x] **Phase 2**: Header, BottomNav, ViewModeToggle → ToggleGroup, FilterToggle → ToggleGroup
- [x] **Phase 3**: Modal → Sheet, Toast → Sonner, SessionDetailModal, SubstituteCoachModal, SailorManagementModal
- [x] **Phase 4**: All 14 pages migrated to Tailwind + shadcn
- [x] **Phase 5**: Cleaned globals.css, removed legacy CSS classes, kept only animations + CSS variables

## Files Modified (29 files)

### Components (8)
- `src/components/Header.jsx` — Tailwind + shadcn Button
- `src/components/BottomNav.jsx` — Tailwind + cn() utility
- `src/components/ProtectedRoute.jsx` — Tailwind classes
- `src/components/ErrorBoundary.jsx` — shadcn Card + Button
- `src/components/Modal.jsx` — shadcn Sheet (bottom sheet)
- `src/components/Toast.jsx` — Sonner toaster
- `src/components/Calendar.jsx` — Tailwind + shadcn Button
- `src/components/ViewModeToggle.jsx` — shadcn ToggleGroup
- `src/components/FilterToggle.jsx` — shadcn ToggleGroup
- `src/components/SessionDetailModal.jsx` — shadcn Button + Badge
- `src/components/SubstituteCoachModal.jsx` — shadcn Button
- `src/components/SailorManagementModal.jsx` — shadcn Input + Button + ToggleGroup

### Pages (14)
- `app/page.js` — Login: shadcn Card + Input + Button + Label
- `app/(coach)/layout.js` — Tailwind layout
- `app/(coach)/schedule/page.js` — shadcn Card + Button + Badge + dynamic modals
- `app/(coach)/sailors/page.js` — shadcn Card + Avatar
- `app/(coach)/hours/page.js` — shadcn Card + Badge
- `app/(coach)/history/page.js` — shadcn Card + Badge
- `app/(coach)/profile/page.js` — shadcn Card + Avatar + Badge + Separator
- `app/admin/layout.js` — Tailwind layout
- `app/admin/dashboard/page.js` — shadcn Card + Link
- `app/admin/coaches/page.js` — shadcn Card + Avatar + Badge
- `app/admin/sailors/page.js` — shadcn Card + Avatar + Badge
- `app/admin/absences/page.js` — shadcn Card
- `app/admin/substitutions/page.js` — shadcn Card

### Config (5)
- `CLAUDE.md` — Created with project standards
- `tailwind.config.js` — shadcn colors, border radius, animations
- `src/styles/globals.css` — Dark theme CSS variables, removed legacy classes
- `next.config.js` — Removed deprecated `swcMinify`
- `src/context/DataContext.js` — Primitive deps in useCallback

### Only remaining `style={{}}` usage
- `schedule/page.js` — Dynamic group colors from database (cannot be Tailwind)
