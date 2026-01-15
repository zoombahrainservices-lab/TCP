# The Communication Protocol - 30-Day Student Platform

A comprehensive 30-day online program for teenagers to develop essential communication skills through daily chapters, real-world tasks, and self-reflection.

## Features

- **Student Portal**: Daily chapter reading, task completion, and progress tracking
- **Parent/Mentor Portal**: Monitor children's progress, view submissions, and generate reports
- **Admin Portal**: Manage 30 chapters with full CRUD capabilities
- **Role-Based Access Control**: Secure authentication with student, parent, mentor, and admin roles
- **File Uploads**: Support for audio, image, and text submissions
- **Progress Tracking**: Visual 30-day progress bars and completion statistics
- **Print-Friendly Reports**: Generate and print progress reports

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- npm or yarn package manager

### Installation

1. **Clone and navigate to the project**

```bash
cd tcp-platform
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Get these values from your Supabase project settings:
- Go to Project Settings → API
- Copy the Project URL, anon public key, and service_role key

4. **Set up the database**

Run the migration script in your Supabase SQL Editor:

```bash
# Copy the contents of supabase/migrations/001_initial_schema.sql
# Paste and run it in Supabase SQL Editor
```

5. **Seed the database with sample chapters**

```bash
# Copy the contents of supabase/seed.sql
# Paste and run it in Supabase SQL Editor
```

6. **Configure Supabase Auth**

In Supabase Dashboard → Authentication → URL Configuration:
- Add `http://localhost:3000/auth/callback` to Redirect URLs
- For production, add `https://your-domain.com/auth/callback`

For Google OAuth:
- Go to Authentication → Providers
- Enable Google provider
- Add your Google OAuth credentials

7. **Create an admin user**

After signing up a parent account, manually update their role in Supabase:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
```

8. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
tcp-platform/
├── app/                      # Next.js App Router
│   ├── actions/             # Server actions
│   ├── auth/                # Authentication pages
│   ├── student/             # Student portal
│   ├── parent/              # Parent portal
│   ├── mentor/              # Mentor portal
│   ├── admin/               # Admin portal
│   └── page.tsx             # Landing page
├── components/              # React components
│   ├── ui/                  # Reusable UI components
│   ├── auth/                # Auth components
│   ├── student/             # Student components
│   ├── parent/              # Parent components
│   └── admin/               # Admin components
├── lib/                     # Utilities and helpers
│   ├── supabase/            # Supabase clients
│   ├── auth/                # Auth guards
│   ├── storage/             # File upload helpers
│   └── utils/               # Validation utilities
└── supabase/                # Database migrations and seeds
```

## Usage Guide

### For Parents/Mentors

1. **Sign up** at `/auth/register-parent`
2. **Create student accounts** from your dashboard
3. Students will receive an email invitation to set their password
4. **Monitor progress** and view submissions from your dashboard
5. **Generate reports** by clicking "View Report" on any child's profile

### For Students

1. **Log in** with credentials provided by your parent/mentor
2. **Complete daily tasks** sequentially (Day 1 → Day 2 → Day 3...)
3. Each day includes:
   - Reading a chapter
   - Before self-check (1-5 scale)
   - Completing a real-world task
   - Uploading proof (audio/image/text)
   - After self-check and reflection
4. **Track your progress** with the 30-day visual tracker

### For Admins

1. **Log in** with admin credentials
2. **Manage chapters** at `/admin/chapters`
3. **Create/Edit** chapters with:
   - Chapter content (markdown supported)
   - Task descriptions
   - Before and after self-check questions
4. **View statistics** on the admin dashboard

## Database Schema

### Key Tables

- **profiles**: User information with role (student/parent/mentor/admin)
- **parent_child_links**: Links between parents/mentors and students
- **chapters**: 30-day curriculum content
- **daily_records**: Student progress and submissions
- **uploads**: File uploads (audio/image) and text submissions

### Row Level Security (RLS)

All tables have RLS policies enforcing:
- Students can only access their own data
- Parents/mentors can only access their linked children's data
- Admins have full access

## Deployment

### Deploy to Vercel

1. **Push your code to GitHub**

2. **Import project in Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository

3. **Add environment variables**
   - Add all variables from `.env.local`
   - Update `NEXT_PUBLIC_APP_URL` to your production URL

4. **Update Supabase settings**
   - Add production URL to Supabase Auth redirect URLs
   - Update Google OAuth redirect URIs if using OAuth

5. **Deploy**
   - Vercel will automatically build and deploy
   - Subsequent pushes to main branch auto-deploy

## Customization

### Adding More Chapters

Use the admin portal to create chapters 4-30, or add them via SQL:

```sql
INSERT INTO chapters (day_number, title, subtitle, content, task_description, before_questions, after_questions)
VALUES (4, 'Your Title', 'Subtitle', 'Content...', 'Task...', '[]'::jsonb, '[]'::jsonb);
```

### Modifying Roles

To change user roles:

```sql
UPDATE profiles SET role = 'mentor' WHERE id = 'user-uuid';
```

### Customizing Email Templates

Configure email templates in Supabase:
- Go to Authentication → Email Templates
- Customize invitation and password reset emails

## Troubleshooting

**Issue**: "Failed to fetch" errors
- **Solution**: Check that Supabase URL and keys are correct in `.env.local`

**Issue**: OAuth redirect not working
- **Solution**: Ensure redirect URL is added in Supabase Auth settings

**Issue**: Students can't upload files
- **Solution**: Check storage bucket exists and RLS policies are applied

**Issue**: Database migration fails
- **Solution**: Run migrations one section at a time, check for syntax errors

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Supabase and Next.js documentation
3. Check browser console for error messages

## License

This project is proprietary software. All rights reserved.

## Acknowledgments

Built with Next.js, Supabase, and Tailwind CSS.
