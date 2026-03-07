import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { createAdminClient } from '../lib/supabase/admin'

/**
 * Removes the dummy/test data that was inserted by create-test-report-data.ts
 * so the report only shows real user-submitted data.
 */
async function removeDummyReportData() {
  const supabase = createAdminClient()

  const { data: authUsers } = await supabase.auth.admin.listUsers()
  const user = authUsers.users[0]
  const userId = user.id

  console.log('🗑️ Removing dummy report data for:', user.email)
  console.log('   (Keeping only real resolution/proof data)\n')

  // 1. Delete the dummy assessment we created (user had 0 before)
  const { error: assessmentError } = await supabase
    .from('assessments')
    .delete()
    .eq('user_id', userId)
    .eq('chapter_id', 1)
    .eq('kind', 'baseline')

  if (assessmentError) {
    console.error('❌ Error deleting dummy assessment:', assessmentError)
  } else {
    console.log('✅ Removed dummy Self-Check assessment')
  }

  // 2. Delete the dummy Your Turn responses we created (user had 0 before)
  const { error: artifactsError } = await supabase
    .from('artifacts')
    .delete()
    .eq('user_id', userId)
    .eq('chapter_id', 1)
    .eq('type', 'your_turn_response')

  if (artifactsError) {
    console.error('❌ Error deleting dummy Your Turn responses:', artifactsError)
  } else {
    console.log('✅ Removed dummy Your Turn responses')
  }

  console.log('\n📄 Report will now show only REAL data:')
  console.log('   - Self-Check: questions only (no answers) until you complete it in the app')
  console.log('   - Your Turn: empty until you complete those sections in the app')
  console.log('   - Identity Statement & Proof: your actual submitted content')
}

removeDummyReportData().catch(console.error)
