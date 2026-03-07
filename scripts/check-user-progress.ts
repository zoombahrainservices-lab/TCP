/**
 * CHECK USER PROGRESS - Debug Script
 * 
 * This script will show the actual database state for chapter_progress
 * to identify why you're seeing 83% instead of 100%
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

async function checkProgress() {
  console.log('🔍 Checking chapter progress for all users...\n')

  try {
    const { data: progressRows, error } = await supabase
      .from('chapter_progress')
      .select('*')
      .eq('chapter_id', 1)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error:', error)
      return
    }

    if (!progressRows || progressRows.length === 0) {
      console.log('No progress records found.')
      return
    }

    console.log(`Found ${progressRows.length} users with Chapter 1 progress:\n`)

    const SECTIONS = ['reading', 'assessment', 'framework', 'techniques', 'proof', 'follow_through']

    for (const row of progressRows) {
      const completed = SECTIONS.filter(s => row[`${s}_complete`] === true)
      const percentage = Math.round((completed.length / SECTIONS.length) * 100)
      
      console.log(`User ID: ${row.user_id}`)
      console.log(`Progress: ${completed.length}/${SECTIONS.length} (${percentage}%)`)
      console.log(`Chapter Complete: ${row.chapter_complete ? '✅ YES' : '❌ NO'}`)
      console.log('\nSection Status:')
      
      SECTIONS.forEach(section => {
        const isComplete = row[`${section}_complete`] === true
        const completedAt = row[`${section}_completed_at`]
        const status = isComplete ? '✅' : '❌'
        const timestamp = completedAt ? new Date(completedAt).toLocaleString() : 'Not completed'
        console.log(`  ${status} ${section.padEnd(20)} ${timestamp}`)
      })
      
      console.log('\n' + '='.repeat(80) + '\n')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkProgress()
  .then(() => {
    console.log('✅ Check complete')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Failed:', error)
    process.exit(1)
  })
