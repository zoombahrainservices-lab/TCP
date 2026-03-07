/**
 * FIX CHAPTER COMPLETION - Comprehensive Script
 * 
 * This script fixes TWO issues found in the database:
 * 
 * ISSUE 1: Users with 6/6 sections complete but chapter_complete = false
 * ISSUE 2: Option to manually mark assessment_complete for specific user
 * 
 * Run with:
 * - No args: Fix all users with 6/6 sections
 * - --fix-assessment: Also fix missing assessment for specific user
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const SECTIONS = ['reading', 'assessment', 'framework', 'techniques', 'proof', 'follow_through'] as const

async function fixChapterCompletion() {
  console.log('🔍 Finding users with 6/6 sections but chapter_complete = false...\n')

  try {
    const { data: progressRows, error } = await supabase
      .from('chapter_progress')
      .select('*')
      .eq('chapter_id', 1)
      .eq('chapter_complete', false)

    if (error) {
      console.error('❌ Error:', error)
      return
    }

    if (!progressRows || progressRows.length === 0) {
      console.log('No users found.')
      return
    }

    const usersToFix = progressRows.filter(row => {
      return SECTIONS.every(section => row[`${section}_complete`] === true)
    })

    if (usersToFix.length === 0) {
      console.log('✅ No users with 6/6 sections and chapter_complete = false')
      return
    }

    console.log(`Found ${usersToFix.length} users to fix:\n`)

    let successCount = 0
    let errorCount = 0

    for (const row of usersToFix) {
      console.log(`Fixing user: ${row.user_id}...`)

      const { error: updateError } = await supabase
        .from('chapter_progress')
        .update({
          chapter_complete: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', row.user_id)
        .eq('chapter_id', 1)

      if (updateError) {
        console.error(`  ❌ Error:`, updateError)
        errorCount++
      } else {
        console.log(`  ✅ Success - Chapter marked complete`)
        successCount++
      }
    }

    console.log(`\n📊 Summary:`)
    console.log(`  ✅ Fixed: ${successCount}`)
    console.log(`  ❌ Errors: ${errorCount}`)

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

async function fixMissingAssessment(userId: string) {
  console.log(`\n🔧 Fixing missing assessment for user: ${userId}...\n`)

  try {
    // Check current state
    const { data: progress } = await supabase
      .from('chapter_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('chapter_id', 1)
      .single()

    if (!progress) {
      console.error('❌ User not found')
      return
    }

    if (progress.assessment_complete) {
      console.log('✅ Assessment already complete for this user')
      return
    }

    // Update assessment
    const { error: assessmentError } = await supabase
      .from('chapter_progress')
      .update({
        assessment_complete: true,
        assessment_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('chapter_id', 1)

    if (assessmentError) {
      console.error('❌ Error updating assessment:', assessmentError)
      return
    }

    console.log('✅ Assessment marked complete')

    // Check if chapter is now complete
    const allComplete = SECTIONS.every(section => {
      if (section === 'assessment') return true // We just set this
      return progress[`${section}_complete`] === true
    })

    if (allComplete) {
      console.log('✅ All sections now complete - marking chapter complete...')

      const { error: chapterError } = await supabase
        .from('chapter_progress')
        .update({
          chapter_complete: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('chapter_id', 1)

      if (chapterError) {
        console.error('❌ Error updating chapter:', chapterError)
      } else {
        console.log('✅ Chapter marked complete')
      }
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

async function main() {
  console.log('🚀 Chapter Completion Fix Script\n')
  console.log('=' .repeat(80))

  const args = process.argv.slice(2)
  const fixAssessment = args.includes('--fix-assessment')
  const userId = args.find(arg => arg.startsWith('--user='))?.split('=')[1]

  // Fix 1: Chapter completion flag
  await fixChapterCompletion()

  // Fix 2: Missing assessment (if requested)
  if (fixAssessment && userId) {
    await fixMissingAssessment(userId)
  } else if (fixAssessment && !userId) {
    console.log('\n⚠️  --fix-assessment requires --user=<user-id>')
  }

  console.log('\n' + '='.repeat(80))
  console.log('✅ Script complete\n')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
