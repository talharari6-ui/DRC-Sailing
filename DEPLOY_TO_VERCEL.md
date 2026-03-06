# 🚀 Deploy to Vercel in 5 Minutes

## Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (easiest)
3. Authorize GitHub access

## Step 2: Get Your Vercel Credentials

### Get VERCEL_TOKEN
1. Go to vercel.com → Settings → Tokens
2. Click "Create Token"
3. Name it: `github-deploy`
4. Copy the token (you'll need it)

### Get VERCEL_ORG_ID & VERCEL_PROJECT_ID
1. Go to vercel.com → Dashboard
2. Click on DRC-Sailing project (or create one)
3. In Project Settings:
   - Look for "Project ID" → copy to VERCEL_PROJECT_ID
   - Look for "Team/Org ID" → copy to VERCEL_ORG_ID

## Step 3: Add GitHub Secrets

1. Go to your GitHub repo
2. Settings → Secrets and variables → Actions → New repository secret
3. Add these 3 secrets:

```
Name: VERCEL_TOKEN
Value: [paste your token from step 2]

Name: VERCEL_ORG_ID
Value: [paste your org/team ID from step 2]

Name: VERCEL_PROJECT_ID
Value: [paste your project ID from step 2]
```

## Step 4: Add Environment Variables to Vercel

1. Go to Vercel project → Settings → Environment Variables
2. Add these 2 variables:

```
NEXT_PUBLIC_SUPABASE_URL = https://ukmjspvhvughrdjexqwu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = [your anon key from Supabase]
```

## Step 5: Deploy!

```bash
# From your local machine:
git push origin main

# GitHub Actions will:
# 1. Run linter
# 2. Deploy to Vercel automatically
# 3. Your app is LIVE in ~2 minutes
```

## Verify Deployment

1. Go to GitHub repo → Actions tab
2. Watch the workflow run
3. Once green ✅, go to Vercel dashboard
4. See your live URL
5. Click the link and test!

## Environment Variables Explained

- `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Supabase public key (safe to expose)

Get these from:
1. supabase.com → Your project → Settings → API
2. Look for "Project URL" and "Anon key"

## What Happens Automatically

Every time you push to `main`:
1. GitHub Actions runs tests & linter
2. If all green, deploys to Vercel
3. App goes live instantly
4. Get a unique URL (e.g., drc-sailing.vercel.app)

## Troubleshooting

### "Deployment failed"
- Check GitHub Actions logs
- Verify environment variables are set
- Make sure package.json has all dependencies

### "Environment variables not found"
- Go to Vercel → Project Settings → Environment Variables
- Re-add them if needed
- Redeploy after adding

### "Deploy button missing"
- You need GitHub Secrets set correctly
- Check all 3 secrets are spelled exactly right

## Local Testing Before Deploy

```bash
# Test build locally
npm run build

# Check for errors
npm run lint

# Run dev server
npm run dev

# Then push when ready!
git push origin main
```

## Next Steps

1. Deploy following steps above
2. Visit your live URL
3. Login with a coach login_code from Supabase
4. Test all features
5. Share URL with team!

---

**Need help?**
- Check GitHub Actions logs for errors
- Verify Supabase connection
- Check Vercel deployment logs

🎉 You're now running on Vercel's global CDN!
