# Setup Guide - The Communication Protocol Platform

This guide will walk you through setting up the complete application from scratch.

## Prerequisites Checklist

- [ ] Node.js 18 or higher installed
- [ ] A Supabase account (free tier works)
- [ ] A code editor (VS Code recommended)
- [ ] Git installed (for version control)

## Step 1: Supabase Project Setup

### 1.1 Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in:
   - **Name**: The Communication Protocol
   - **Database Password**: Save this password securely!
   - **Region**: Choose closest to your users
5. Wait 2-3 minutes for project initialization

### 1.2 Get Your API Keys

1. In your Supabase project, go to **Settings** (⚙️ icon) → **API**
2. Copy and save these three values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")
   - **service_role** key (under "Project API keys" - click "Reveal")

⚠️ **Important**: Never commit `service_role` key to Git!

## Step 2: Database Setup

### 2.1 Run the Migration

1. In Supabase Dashboard, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open the file `supabase/migrations/001_initial_schema.sql` from this project
4. Copy all contents and paste into the SQL Editor
5. Click **Run** (or press Ctrl/Cmd + Enter)
6. Wait for "Success" message (should take 5-10 seconds)

### 2.2 Seed Sample Chapters

1. Still in **SQL Editor**, create another new query
2. Open the file `supabase/seed.sql`
3. Copy all contents and paste into the SQL Editor
4. Click **Run**
5. Verify success - you should see "3 rows inserted"

### 2.3 Verify Database Setup

1. Go to **Table Editor** (left sidebar)
2. Confirm these tables exist:
   - profiles
   - parent_child_links
   - chapters (should have 3 rows)
   - daily_records
   - uploads
3. Go to **Storage** → verify `student-uploads` bucket exists

## Step 3: Application Setup

### 3.1 Install Dependencies

```bash
cd tcp-platform
npm install
```

Wait for installation to complete (1-2 minutes).

### 3.2 Configure Environment Variables

1. Create a new file named `.env.local` in the `tcp-platform` directory
2. Add the following, replacing with your actual Supabase values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Save the file
4. **NEVER commit this file to Git** (it's already in .gitignore)

## Step 4: Authentication Configuration

### 4.1 Configure Redirect URLs

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Under "Redirect URLs", add:
   ```
   http://localhost:3000/auth/callback
   ```
3. Click **Save**

### 4.2 (Optional) Configure Google OAuth

If you want Google sign-in:

1. Create a Google Cloud Project:
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Create new project
   - Enable "Google+ API"
   - Create OAuth 2.0 credentials
   
2. Configure OAuth consent screen with your app details

3. Add authorized redirect URI:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```

4. Copy Client ID and Client Secret

5. In Supabase Dashboard:
   - Go to **Authentication** → **Providers**
   - Enable **Google**
   - Paste Client ID and Client Secret
   - Click **Save**

## Step 5: Run the Application

### 5.1 Start Development Server

```bash
npm run dev
```

You should see:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000

✓ Ready in 2.5s
```

### 5.2 Open the Application

1. Open your browser
2. Navigate to [http://localhost:3000](http://localhost:3000)
3. You should see the landing page

## Step 6: Create Your First Admin User

### 6.1 Sign Up as Parent

1. Click **"Get Started as Parent"** or **"Parent Signup"**
2. Fill in:
   - Full Name: Your name
   - Email: Your email
   - Password: Choose a strong password
3. Click **"Create Account"**
4. You'll be redirected to the parent dashboard

### 6.2 Upgrade to Admin

1. In Supabase Dashboard, go to **SQL Editor**
2. Run this query (replace with your email):

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

3. Log out and log back in
4. You should now see the Admin Portal

## Step 7: Test the Platform

### 7.1 As Admin

1. Go to **Manage Chapters**
2. Verify the 3 sample chapters exist
3. Try editing a chapter
4. Try creating a new chapter (Day 4)

### 7.2 As Parent

1. Log out, create a new parent account
2. Click **"+ Add Child"**
3. Enter:
   - Child's Full Name: Test Student
   - Child's Email: student@test.com
4. Click **"Create Account"**

### 7.3 As Student

1. Check the email inbox for `student@test.com`
2. Click the invitation link
3. Set a password
4. Log in
5. Complete Day 1:
   - Read the chapter
   - Answer before questions
   - Upload proof (record audio or upload image)
   - Complete reflection
6. Verify Day 1 is marked complete

### 7.4 Back to Parent

1. Log in as the parent
2. Click on the test student
3. Verify you can see their Day 1 submission
4. Click **"View Report"**
5. Try printing the report

## Step 8: Production Deployment

### 8.1 Prepare for Deployment

1. Push your code to GitHub (create a new repository)

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/tcp-platform.git
git push -u origin main
```

2. In `.env.local.example`, update any default values if needed

### 8.2 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"Import Project"**
4. Select your repository
5. Framework Preset: **Next.js** (auto-detected)
6. Root Directory: `tcp-platform`
7. Add Environment Variables:
   - Copy all from `.env.local`
   - **Update** `NEXT_PUBLIC_APP_URL` to your production domain
8. Click **"Deploy"**
9. Wait 2-3 minutes for build to complete

### 8.3 Update Supabase for Production

1. Once deployed, copy your Vercel URL (e.g., `https://your-app.vercel.app`)

2. In Supabase Dashboard → **Authentication** → **URL Configuration**:
   - Add production redirect URL:
     ```
     https://your-app.vercel.app/auth/callback
     ```

3. If using Google OAuth:
   - Add production URL to Google Cloud Console authorized redirects
   - Format: `https://your-project.supabase.co/auth/v1/callback`

4. Test production deployment:
   - Visit your Vercel URL
   - Try signing up
   - Try logging in
   - Complete a full day as a student

## Troubleshooting

### "Failed to fetch" or CORS errors
- Verify your Supabase URL and keys in `.env.local`
- Check that keys don't have extra spaces or quotes
- Restart the dev server after changing `.env.local`

### "User not found" after signup
- Check that the migration ran successfully
- Verify `profiles` table exists in Supabase
- Check browser console for specific errors

### Email not sending
- Free Supabase projects have limited email sending
- Emails may go to spam folder
- For production, configure custom SMTP in Supabase

### File upload fails
- Verify `student-uploads` bucket exists in Storage
- Check RLS policies were created in migration
- Browser console will show specific storage errors

### "Day is locked" message
- Students must complete days sequentially
- Verify previous day is marked `completed = true`
- Check `daily_records` table in Supabase

### Cannot log in as student
- Students don't register themselves
- They must be created by a parent/mentor/admin
- Check the invitation email for the password reset link

## Next Steps

1. **Add More Chapters**: Use admin portal to create chapters 4-30
2. **Customize Content**: Edit existing chapters to match your curriculum
3. **Configure Custom Domain**: In Vercel, add your custom domain
4. **Set Up Custom Email**: Configure SMTP for branded emails
5. **Monitor Usage**: Use Supabase Dashboard to track user activity

## Support Resources

- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Tailwind CSS**: [tailwindcss.com/docs](https://tailwindcss.com/docs)

## Security Checklist

- [ ] `.env.local` is in `.gitignore` and never committed
- [ ] Service role key is only used on server (never in client components)
- [ ] RLS policies are enabled on all tables
- [ ] File uploads are restricted by bucket policies
- [ ] Strong passwords required (8+ characters)
- [ ] Google OAuth configured with correct redirect URLs
- [ ] Production environment variables set in Vercel

## Congratulations! 🎉

Your platform is now fully set up and ready to use!
