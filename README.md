# חוג שייט | מרכז דניאל

A modern Next.js fullstack application for managing sailing club operations.

## Stack

- **Frontend**: Next.js 14+ with React 18
- **Backend**: Next.js API Routes (serverless)
- **Database**: Supabase PostgreSQL
- **Styling**: Tailwind CSS
- **Hosting**: Vercel
- **CI/CD**: GitHub Actions

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- GitHub account
- Vercel account

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd drc-sailing
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://ukmjspvhvughrdjexqwu.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser.

5. **Login**
   - Use a `login_code` from the coaches table in your Supabase database

## Project Structure

```
app/
  ├── api/                          # Backend API routes
  │   ├── auth/
  │   │   ├── login/route.js
  │   │   └── logout/route.js
  │   ├── coaches/
  │   ├── sailors/
  │   ├── groups/
  │   ├── sessions/
  │   └── hours/
  ├── (coach)/                      # Coach routes (protected)
  │   ├── schedule/page.js
  │   ├── sailors/page.js
  │   ├── hours/page.js
  │   ├── history/page.js
  │   └── profile/page.js
  ├── (admin)/                      # Admin routes (protected + admin-only)
  │   ├── dashboard/page.js
  │   ├── coaches/page.js
  │   ├── sailors/page.js
  │   ├── absences/page.js
  │   └── substitutions/page.js
  ├── layout.js                     # Root layout
  └── page.js                       # Login page

src/
  ├── components/                   # Reusable React components
  │   ├── Header.jsx
  │   ├── BottomNav.jsx
  │   ├── ProtectedRoute.jsx
  │   └── ...
  ├── context/                      # React Context
  │   ├── AuthContext.js
  │   └── DataContext.js
  ├── hooks/                        # Custom React hooks
  │   ├── useAuth.js
  │   └── ...
  ├── lib/                          # Utilities
  │   ├── supabase.js
  │   ├── api.js
  │   └── constants.js
  └── styles/                       # Global styles
      └── globals.css
```

## Database Schema

### Core Tables
- `coaches` - Coaching staff
- `groups` - Sailing groups/classes
- `sailors` - Participants
- `group_sailors` - Many-to-many relationship
- `sessions` - Individual sailing sessions
- `attendance` - Session attendance records
- `work_hours` - Coach work hour tracking
- `notifications` - System notifications

See the original `index.html` for detailed schema information.

## API Routes

### Authentication
- `POST /api/auth/login` - Coach login with login_code
- `POST /api/auth/logout` - Sign out

### Coaches
- `GET /api/coaches` - List coaches
- `GET /api/coaches/[id]` - Get coach details
- `PATCH /api/coaches/[id]` - Update coach

### Groups
- `GET /api/groups` - List groups
- `POST /api/groups` - Create group
- `PATCH /api/groups/[id]` - Update group
- `DELETE /api/groups/[id]` - Delete group

### Sailors
- `GET /api/sailors` - List sailors
- `POST /api/sailors` - Create sailor
- `PATCH /api/sailors/[id]` - Update sailor
- `DELETE /api/sailors/[id]` - Delete sailor

### Sessions & Attendance
- `GET /api/sessions` - List sessions
- `POST /api/sessions/[id]/attendance` - Mark attendance
- `POST /api/sessions/[id]/substitute` - Set substitute coach
- `POST /api/sessions/[id]/cancel` - Cancel session

### Work Hours
- `POST /api/hours` - Log work hours

## Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial Next.js setup"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repo
   - Add environment variables
   - Deploy

3. **GitHub Actions**
   - Automatically deploys on push to `main`
   - See `.github/workflows/deploy.yml`

### Manual Setup

1. **Get Vercel Token**
   ```bash
   # At vercel.com: Settings → Tokens
   ```

2. **Add GitHub Secrets**
   - `VERCEL_TOKEN` - Your Vercel auth token
   - `VERCEL_ORG_ID` - Your Vercel organization ID
   - `VERCEL_PROJECT_ID` - Your Vercel project ID

3. **Push code**
   ```bash
   git push origin main
   # GitHub Actions will automatically deploy
   ```

## Development

### Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm start         # Start production server
npm run lint      # Run ESLint
npm run lint:fix  # Fix linting issues
```

### Code Style

- Use functional components with hooks
- Keep components small and reusable
- Use camelCase for JavaScript, kebab-case for file names
- Add comments for complex logic

## Testing

Tests will be added in Phase 2. Currently using manual testing:

- [ ] Login flow works (coach + admin)
- [ ] Navigate between pages
- [ ] Test on mobile device
- [ ] Check Hebrew text rendering (RTL)
- [ ] Verify responsive layout

## Features Status

### Phase 1: Foundation ✅
- [x] Next.js setup with TypeScript
- [x] Tailwind CSS + dark theme
- [x] Authentication context
- [x] GitHub Actions workflow
- [x] Layout structure
- [x] Placeholder pages

### Phase 2: Core Pages (In Progress)
- [ ] Coach schedule page
- [ ] Coach sailors management
- [ ] Work hours logging
- [ ] Attendance marking
- [ ] Admin dashboard
- [ ] Admin management pages

### Phase 3: API Routes
- [ ] All CRUD endpoints
- [ ] Business logic
- [ ] Validation & error handling

### Phase 4: Polish
- [ ] Mobile optimization
- [ ] Performance tuning
- [ ] Error boundaries
- [ ] Toast notifications

## Troubleshooting

### Login fails with "קוד כניסה לא חוקי"
- Make sure the login_code exists in Supabase coaches table
- Check that code is trimmed (no extra spaces)

### Styles not loading
- Clear `.next` build cache: `rm -rf .next`
- Rebuild: `npm run build`

### Environment variables not working
- Restart development server after editing `.env.local`
- For Vercel: redeploy after adding env vars

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Commit changes: `git commit -m "Add my feature"`
3. Push to GitHub: `git push origin feature/my-feature`
4. Open a pull request

## License

MIT

## Support

For issues or questions, contact the development team.

---

**Last Updated**: March 2026
**Version**: 0.1.0 (Alpha)
