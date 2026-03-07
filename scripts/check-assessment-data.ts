/**
 * DEBUG: Check Assessment Data
 * 
 * This script checks if assessment answers are actually stored in the database
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

async function checkAssessments() {
  console.log('🔍 Checking assessment data in database...\n')

  try {
    const { data: assessments, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('chapter_id', 1)
      .eq('kind', 'baseline')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error:', error)
      return
    }

    if (!assessments || assessments.length === 0) {
      console.log('No assessments found for Chapter 1')
      return
    }

    console.log(`Found ${assessments.length} assessments for Chapter 1:\n`)

    for (const assessment of assessments) {
      console.log(`User ID: ${assessment.user_id}`)
      console.log(`Score: ${assessment.score}`)
      console.log(`Created: ${new Date(assessment.created_at).toLocaleString()}`)
      console.log(`Responses type: ${typeof assessment.responses}`)
      console.log(`Responses:`, assessment.responses)
      console.log(`\nResponses keys:`, assessment.responses ? Object.keys(assessment.responses) : 'null')
      console.log(`\n` + '='.repeat(80) + '\n')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkAssessments()
  .then(() => {
    console.log('✅ Check complete')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Failed:', error)
    process.exit(1)
  })
