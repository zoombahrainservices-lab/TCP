# Quick Start Guide

Get up and running in 10 minutes!

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier is fine)

## 5-Step Setup

### 1. Supabase Setup (3 minutes)

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your credentials from Settings → API:
   - Project URL
   - anon public key
   - service_role key
3. Run the migration in SQL Editor:
   - Copy `supabase/migrations/001_initial_schema.sql`
   - Paste and run in SQL Editor
4. Seed sample data:
   - Copy `supabase/seed.sql`
   - Paste and run in SQL Editor

### 2. Configure Environment (1 minute)

Create `.env.local` in the `tcp-platform` directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Install & Run (2 minutes)

```bash
cd tcp-platform
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Create Admin User (2 minutes)

1. Sign up at `/auth/register-parent`
2. In Supabase SQL Editor, run:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
   ```
3. Log out and log back in

### 5. Test It Out (2 minutes)

1. **As Admin**: Go to `/admin/chapters` - see 3 sample chapters
2. **As Parent**: Create a test student account
3. **As Student**: Log in and complete Day 1

## Project Structure

```
tcp-platform/
├── app/                    # Next.js App Router
│   ├── actions/           # Server actions (auth, student, parent, admin)
│   ├── auth/              # Login, register, OAuth callback
│   ├── student/           # Student dashboard & daily flow
│   ├── parent/            # Parent dashboard & child management
│   ├── mentor/            # Mentor portal (same as parent)
│   └── admin/             # Admin dashboard & chapter management
├── components/            # React components
│   ├── ui/               # Reusable UI (Button, Input, Card, etc.)
│   ├── auth/             # Auth forms
│   ├── student/          # Student-specific components
│   ├── parent/           # Parent-specific components
│   └── admin/            # Admin-specific components
├── lib/                   # Utilities
│   ├── supabase/         # Database clients
│   ├── auth/             # Route guards
│   ├── storage/          # File upload helpers
│   └── utils/            # Validation
├── supabase/             # Database scripts
│   ├── migrations/       # Schema setup
│   └── seed.sql          # Sample data
└── README.md             # Full documentation
```

## Key URLs

- **Landing**: `/`
- **Login**: `/auth/login`
- **Signup**: `/auth/register-parent`
- **Student Dashboard**: `/student`
- **Parent Dashboard**: `/parent`
- **Admin Dashboard**: `/admin`

## Common Commands

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm start            # Run production build

# Type checking
npm run type-check   # Check TypeScript

# Linting
npm run lint         # Run ESLint
```

## Default Credentials

After setup, you'll have:

- **Admin**: Your registered email with admin role
- **Sample Chapters**: Days 1, 2, and 3
- **Database**: Fully configured with RLS policies

## Test Flow

1. **Parent creates student** → Student gets invitation email
2. **Student sets password** → Activates account
3. **Student completes Day 1** → Full 7-step flow
4. **Parent views submission** → Sees all details
5. **Parent generates report** → Print-friendly PDF

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Failed to fetch" | Check .env.local has correct Supabase credentials |
| Can't log in | Ensure migration ran successfully |
| File upload fails | Verify student-uploads bucket exists |
| Email not sending | Check spam folder, or configure custom SMTP |

## Next Steps

1. ✅ Platform is running
2. ➡️ Create chapters 4-30 via admin portal
3. ➡️ Customize content for your needs
4. ➡️ Deploy to Vercel (see SETUP.md)
5. ➡️ Configure custom domain

## Need Help?

- **Full Setup Guide**: See `SETUP.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`
- **README**: See `README.md`

---

**Estimated Setup Time**: ~10 minutes  
**Status**: ✅ Production Ready  
**Tech Stack**: Next.js 14 + TypeScript + Supabase + Tailwind CSS
