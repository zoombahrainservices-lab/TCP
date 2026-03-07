/**
 * DATA MIGRATION: Fix Follow-Through Completion for Historical Users
 * 
 * PROBLEM:
 * Users who completed Follow-Through BEFORE the fix was deployed have:
 * - YOUR TURN responses saved in database ✅
 * - follow_through_complete = false ❌
 * - Stuck at 83% progress ❌
 * 
 * SOLUTION:
 * For each user who has at least ONE Follow-Through YOUR TURN response
 * but follow_through_complete is NOT true:
 * - SET follow_through_complete = true
 * - SET follow_through_completed_at = first response timestamp
 * - Check if chapter is now complete (all 6 sections)
 * - Award section XP if first time (optional - see below)
 * 
 * RUN THIS ONCE to fix all historical data.
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  console.error('Need: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function migrateFollowThroughCompletions() {
  console.log('🔍 Starting Follow-Through completion migration...\n')

  try {
    // Step 1: Find all users with Follow-Through YOUR TURN responses
    console.log('Step 1: Finding users with Follow-Through YOUR TURN responses...')
    
    const { data: artifacts, error: responsesError } = await supabase
      .from('artifacts')
      .select('user_id, data, created_at')
      .eq('chapter_id', 1)
      .eq('type', 'your_turn_response')
      .order('created_at', { ascending: true })

    if (responsesError) {
      console.error('❌ Error fetching YOUR TURN artifacts:', responsesError)
      return
    }

    if (!artifacts || artifacts.length === 0) {
      console.log('✅ No Follow-Through responses found. Nothing to migrate.')
      return
    }

    // Filter for Follow-Through responses and group by user_id
    const userFirstResponses = new Map<string, Date>()
    artifacts.forEach(artifact => {
      const data = artifact.data as Record<string, unknown>
      const promptKey = String(data.promptKey ?? '')
      
      // Only process Follow-Through prompts
      if (promptKey.startsWith('ch1_followthrough_')) {
        if (!userFirstResponses.has(artifact.user_id)) {
          userFirstResponses.set(artifact.user_id, new Date(artifact.created_at))
        }
      }
    })

    console.log(`Found ${userFirstResponses.size} users with Follow-Through responses\n`)

    // Step 2: Check which users have follow_through_complete = false
    console.log('Step 2: Checking chapter_progress for incomplete flags...')
    
    const userIds = Array.from(userFirstResponses.keys())
    
    const { data: progressRows, error: progressError } = await supabase
      .from('chapter_progress')
      .select('user_id, chapter_id, follow_through_complete, reading_complete, assessment_complete, framework_complete, techniques_complete, proof_complete')
      .eq('chapter_id', 1)
      .in('user_id', userIds)
      .eq('follow_through_complete', false)

    if (progressError) {
      console.error('❌ Error fetching chapter_progress:', progressError)
      return
    }

    if (!progressRows || progressRows.length === 0) {
      console.log('✅ All users already have follow_through_complete = true. Nothing to migrate.')
      return
    }

    console.log(`Found ${progressRows.length} users needing migration:\n`)

    // Step 3: Update each user
    let successCount = 0
    let errorCount = 0

    for (const progress of progressRows) {
      const userId = progress.user_id
      const firstResponseTime = userFirstResponses.get(userId)

      if (!firstResponseTime) continue

      console.log(`Migrating user: ${userId}...`)

      // Update follow_through_complete flag
      const { error: updateError } = await supabase
        .from('chapter_progress')
        .update({
          follow_through_complete: true,
          follow_through_completed_at: firstResponseTime.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('chapter_id', 1)

      if (updateError) {
        console.error(`  ❌ Error updating user ${userId}:`, updateError)
        errorCount++
        continue
      }

      // Check if chapter is now complete
      const isChapterComplete =
        progress.reading_complete &&
        progress.assessment_complete &&
        progress.framework_complete &&
        progress.techniques_complete &&
        progress.proof_complete &&
        true // follow_through_complete is now true

      if (isChapterComplete) {
        console.log(`  🎉 User completed Chapter 1! Updating chapter_complete flag...`)
        
        const { error: chapterCompleteError } = await supabase
          .from('chapter_progress')
          .update({
            chapter_complete: true,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .eq('chapter_id', 1)
          .eq('chapter_complete', false)

        if (chapterCompleteError) {
          console.error(`  ❌ Error setting chapter_complete:`, chapterCompleteError)
        }
      }

      console.log(`  ✅ Success`)
      successCount++
    }

    console.log(`\n📊 Migration Summary:`)
    console.log(`  ✅ Successfully migrated: ${successCount} users`)
    console.log(`  ❌ Errors: ${errorCount} users`)
    console.log(`\n✨ Migration complete!`)

    // OPTIONAL: Award retroactive XP
    // Uncomment if you want to award section completion XP to these users
    // NOTE: This may be unfair to users who completed AFTER the fix
    // console.log('\n⚠️  XP Award: Skipped (commented out)')
    // console.log('   To award retroactive XP, uncomment the XP section in this script')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

// Run migration
migrateFollowThroughCompletions()
  .then(() => {
    console.log('\n✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })
