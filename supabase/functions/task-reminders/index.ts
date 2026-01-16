// Supabase Edge Function for Task Reminders
// Runs hourly to send reminders for tasks due within 4 hours

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DailyRecord {
  id: number
  student_id: string
  day_number: number
  task_due_at: string
  chapter_id: number
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Calculate time window: now to 4 hours from now
    const now = new Date()
    const fourHoursFromNow = new Date(now.getTime() + 4 * 60 * 60 * 1000)

    console.log('Checking for tasks due between', now.toISOString(), 'and', fourHoursFromNow.toISOString())

    // Find daily records that need reminders
    const { data: records, error: recordsError } = await supabaseClient
      .from('daily_records')
      .select('id, student_id, day_number, task_due_at, chapter_id')
      .not('task_acknowledged_at', 'is', null)
      .is('proof_uploaded_at', null)
      .is('task_reminder_sent_at', null)
      .gte('task_due_at', now.toISOString())
      .lte('task_due_at', fourHoursFromNow.toISOString())

    if (recordsError) {
      console.error('Error fetching records:', recordsError)
      throw recordsError
    }

    console.log(`Found ${records?.length || 0} records needing reminders`)

    if (!records || records.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No reminders to send', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let remindersSent = 0

    // Process each record
    for (const record of records) {
      try {
        // Get student info
        const { data: student } = await supabaseClient
          .from('profiles')
          .select('full_name, notification_preferences')
          .eq('id', record.student_id)
          .single()

        // Get chapter info
        const { data: chapter } = await supabaseClient
          .from('chapters')
          .select('title')
          .eq('id', record.chapter_id)
          .single()

        // Get parent info
        const { data: links } = await supabaseClient
          .from('parent_child_links')
          .select('parent_id')
          .eq('child_id', record.student_id)

        const chapterTitle = chapter?.title || `Day ${record.day_number}`
        const dueDate = new Date(record.task_due_at)
        const hoursRemaining = Math.round((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60))

        // Create notification for student
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: record.student_id,
            type: 'task_reminder',
            title: '⏰ Task Deadline Approaching',
            message: `Your task for "${chapterTitle}" is due in ${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''}. Don't forget to upload your proof!`,
            metadata: {
              day_number: record.day_number,
              daily_record_id: record.id,
              due_at: record.task_due_at
            }
          })

        console.log(`Created notification for student ${record.student_id}`)

        // Create notifications for parents/mentors
        if (links && links.length > 0) {
          for (const link of links) {
            await supabaseClient
              .from('notifications')
              .insert({
                user_id: link.parent_id,
                type: 'child_task_reminder',
                title: '⏰ Child Task Deadline Approaching',
                message: `${student?.full_name || 'Your child'}'s task for "${chapterTitle}" is due in ${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''}.`,
                metadata: {
                  student_id: record.student_id,
                  day_number: record.day_number,
                  daily_record_id: record.id,
                  due_at: record.task_due_at
                }
              })

            console.log(`Created notification for parent ${link.parent_id}`)
          }
        }

        // Mark reminder as sent
        await supabaseClient
          .from('daily_records')
          .update({ task_reminder_sent_at: now.toISOString() })
          .eq('id', record.id)

        remindersSent++
      } catch (error) {
        console.error(`Error processing record ${record.id}:`, error)
        // Continue with next record
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Reminders sent successfully',
        count: remindersSent,
        total: records.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in task-reminders function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
