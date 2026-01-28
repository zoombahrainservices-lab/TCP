# Database Cleanup Instructions

This directory contains scripts to cleanup student test data from the database while preserving the application structure.

## Files

1. **cleanup_student_data.sql** - Main cleanup script that deletes all student progress data
2. **verify_image_urls.sql** - Verification script to check chapter image URLs
3. **verify_cleanup.sql** - Post-cleanup verification script

## What Gets Deleted

- All records from `xp_events` table
- All records from `phase_uploads` table
- All records from `student_progress` table
- Student profile progress data (xp, level, badges reset to defaults)

## What Gets Preserved

- Zones (Foundation, Mission 1, etc.)
- Chapters and their content with chunks
- Phases (learning, power-scan, field-mission, level-up)
- User authentication accounts (admin/parent/mentor)
- Parent-child relationships
- Supabase Storage buckets and uploaded files

## How to Run

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `cleanup_student_data.sql`
5. Click **Run** to execute
6. Review the success message

### Option 2: Using Supabase CLI

```bash
# From the project root directory
cd tcp-platform

# Run the cleanup script
npx supabase db execute --file supabase/cleanup_student_data.sql --linked

# Or if you want to reset the entire database to migrations
npx supabase db reset --linked
```

### Option 3: Using psql

```bash
# Get your database connection string from Supabase Dashboard
# Settings → Database → Connection string (Direct connection)

psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres" \
  -f supabase/cleanup_student_data.sql
```

## Verification

After running the cleanup script, verify the results:

### Step 1: Check Image URLs

Run the verification script to ensure chapters have proper Supabase Storage URLs:

```bash
npx supabase db execute --file supabase/verify_image_urls.sql --linked
```

### Step 2: Verify Cleanup Success

Run the verification script:

```bash
npx supabase db execute --file supabase/verify_cleanup.sql --linked
```

Expected results:
- `student_progress` count: 0
- `phase_uploads` count: 0
- `xp_events` count: 0
- All student profiles have xp=0, level=1, badges=[]
- Zones, chapters, and phases counts are preserved

## After Cleanup

1. Fresh student accounts will start with no progress
2. Students can begin from the first zone/chapter
3. All zone/chapter/phase structure remains intact
4. Images will load from Supabase Storage as configured

## Rollback

There is no automatic rollback for this cleanup. If you need to restore data:

1. Restore from a database backup (if available)
2. Or re-seed the database with test data using the seed scripts

## Safety Notes

⚠️ **WARNING**: This operation is destructive and cannot be easily undone.

- Always backup your database before running cleanup scripts
- Test in a development environment first
- Verify you're connected to the correct database
- Review the scripts before executing

## Support

If you encounter any issues:

1. Check the Supabase Dashboard logs for error messages
2. Verify your database connection
3. Ensure you have the necessary permissions
4. Review the SQL scripts for syntax errors
