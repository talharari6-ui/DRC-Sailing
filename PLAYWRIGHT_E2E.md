# Playwright E2E

## Prerequisites
- Node.js 18+ and npm

## One-time setup
```bash
npm install
npx playwright install chromium
```

## Optional authenticated test setup
Add to `.env.local`:
```bash
E2E_LOGIN_CODE=<coach_login_code>
```

## Run tests
```bash
npm run e2e
```

Headed mode:
```bash
npm run e2e:headed
```

UI mode:
```bash
npm run e2e:ui
```

## Pre-push gate (recommended)
Run this before every push to validate login + schedule sanity:
```bash
npm run e2e:gate
```

What it checks:
- Login page smoke
- Authenticated navigation smoke (when `E2E_LOGIN_CODE` exists)
- Schedule visual sanity (core controls)
- Mojibake guard (`Ã`, `Â`, `â€¢`, etc.)

## GitHub Actions requirements
Set these repository secrets so CI can boot the app and run E2E:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `E2E_LOGIN_CODE` (optional, enables authenticated smoke flow)
