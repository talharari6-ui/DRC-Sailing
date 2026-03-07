# CODEX.md

## Project Overview
- App: DRC Sailing management system
- Stack: Next.js 14, React 18, Supabase, Tailwind CSS, TypeScript support
- Deployment: Vercel via GitHub Actions
- Primary language in UI: Hebrew (RTL support required)

## Repo Layout
- `app/`: Next.js App Router pages and API routes
- `src/components/`: reusable UI components
- `src/context/`: auth/data context
- `src/hooks/`: custom hooks
- `src/lib/`: shared utilities and Supabase client

## Local Commands
- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Start production build: `npm start`
- Lint: `npm run lint`
- Auto-fix lint: `npm run lint:fix`

## Environment
- Copy `.env.example` to `.env.local`
- Required vars:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Engineering Rules For Codex
- Prefer minimal, targeted changes over broad refactors.
- Preserve existing architecture and naming conventions.
- Keep RTL and mobile behavior intact on all UI edits.
- Follow existing Next.js App Router patterns for pages and API handlers.
- Use Supabase through existing helpers in `src/lib` when possible.
- Avoid introducing new dependencies unless clearly necessary.
- Run lint after meaningful edits and report failures clearly.
- Do not modify secrets, deployment IDs, or CI settings unless requested.

## API/Behavior Safety
- Preserve auth flow (`/api/auth/login`, `/api/auth/logout`) and protected route assumptions.
- For data mutations, keep server/API validation explicit.
- Never expose privileged Supabase keys in client code.

## PR/Change Checklist
- [ ] Changes scoped to user request
- [ ] No regressions in RTL layout or responsive behavior
- [ ] Lint passes (or known issues documented)
- [ ] Environment variable requirements unchanged or documented
- [ ] Any new route/API behavior documented in `README.md` when relevant

## Notes
- If project docs and code disagree, trust current code behavior and update docs in same change when safe.
- If a requested change risks breaking login, scheduling, attendance, or hours tracking, call it out before merging.
