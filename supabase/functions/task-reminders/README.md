# Task Reminders Edge Function

This Supabase Edge Function sends reminders to students and parents when task deadlines are approaching (within 4 hours).

## Deployment

```bash
# Deploy the function
supabase functions deploy task-reminders

# Set up environment variables (if not already set)
supabase secrets set SUPABASE_URL=your-project-url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Setting up Cron

To run this function hourly, you can use Supabase's pg_cron extension:

1. Enable pg_cron in your Supabase project (Database → Extensions)

2. Run this SQL in your SQL Editor:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the task-reminders function to run every hour
SELECT cron.schedule(
  'task-reminders-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
      url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/task-reminders',
      headers:=jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer YOUR_ANON_KEY'
      ),
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- View scheduled jobs
SELECT * FROM cron.job;

-- To remove the schedule (if needed)
-- SELECT cron.unschedule('task-reminders-hourly');
```

Replace:
- `YOUR_PROJECT_REF` with your Supabase project reference
- `YOUR_ANON_KEY` with your anon/public key

## Manual Testing

You can test the function manually:

```bash
# Using Supabase CLI
supabase functions serve task-reminders

# Or invoke directly
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/task-reminders' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

## What it does

1. Queries `daily_records` for tasks that:
   - Have been acknowledged (`task_acknowledged_at` is not null)
   - Haven't been uploaded yet (`proof_uploaded_at` is null)
   - Haven't received a reminder (`task_reminder_sent_at` is null)
   - Are due within the next 4 hours

2. For each matching record:
   - Creates an in-app notification for the student
   - Creates in-app notifications for all parents/mentors linked to the student
   - Marks the record as reminded (`task_reminder_sent_at`)

3. Returns a summary of reminders sent

## Logs

View function logs in Supabase Dashboard → Edge Functions → task-reminders → Logs
