# Global Progress & Per-User Data

This app is set up so that **the same Google account sees the same progress everywhere** (localhost and deployed), and **each user’s data is strictly isolated** (no mixing between users).

## Global progress (same account = same data everywhere)

- All progress is stored in **one Supabase project** (step completions, chapter progress, assessments, XP, reports, etc.).
- **Use the same Supabase project for both local and production:**
  - **Local:** `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and (for server) `SUPABASE_SERVICE_ROLE_KEY` from that project.
  - **Vercel:** In the project’s **Environment Variables**, set the **same** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` for Production (and Preview if you want).
- Supabase Auth uses one user pool per project. The same Google account gets the same `user_id` (UUID) whether the user signs in on localhost or on the deployed site. All progress is keyed by `user_id`, so progress is global per user.

## Redirect URLs (so Google login works on local + deployed)

For the same Google account to work on both localhost and the deployed app, Supabase must allow redirects to both.

1. **Supabase Dashboard** → your project → **Authentication** → **URL Configuration**.
2. **Site URL:** set to your production URL, e.g.  
   `https://tcp-git-main-zoom-bahrain-services-projects.vercel.app`
3. **Redirect URLs:** add **both**:
   - `http://localhost:3000/**`
   - `https://tcp-git-main-zoom-bahrain-services-projects.vercel.app/**`  
   (or your real Vercel/production URL)
4. Save.

Each environment must know its own app URL:

- **Local:** In `.env.local`, set  
  `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- **Vercel:** In the project’s Environment Variables, set  
  `NEXT_PUBLIC_APP_URL=https://your-actual-vercel-url.vercel.app`  
  (same as Site URL above).

Then:

- On localhost, login redirects to `http://localhost:3000/auth/callback`.
- On production, login redirects to `https://your-app.vercel.app/auth/callback`.

Same Supabase project + same redirect list = same Google account, same user, same progress everywhere.

## Per-user data (reports and everything else)

- **Row Level Security (RLS)** is enabled on all user-scoped tables. Policies restrict access to `auth.uid() = user_id`, so users only see and change their own rows.
- **Server actions and API routes** always:
  1. Get the current user with `createClient()` + `auth.getUser()` (or equivalent).
  2. Filter/insert/update by that `user_id` (e.g. `step_completions`, `chapter_progress`, `assessments`, `user_gamification`, reports).
- **Reports (assessment PDF, resolution PDF)** are generated only for the currently authenticated user; there is no way to request another user’s report.

So: **one account = one set of data; data is global across environments and separate per user.**
