import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { createAdminClient } from '../lib/supabase/admin'

async function checkReportStatus() {
  const supabase = createAdminClient()

  console.log('🔍 COMPREHENSIVE REPORT DATA CHECK\n')
  console.log('='  .repeat(80))

  const { data: authUsers } = await supabase.auth.admin.listUsers()
  const user = authUsers.users[0]
  
  console.log(`\n👤 USER: ${user.email}`)
  console.log('='  .repeat(80))

  // 1. Check assessments table
  console.log('\n📊 1. ASSESSMENTS TABLE (Self-Check)')
  const { data: assessments } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', user.id)
    .eq('chapter_id', 1)
  
  console.log(`Found: ${assessments?.length || 0} assessments`)
  if (assessments && assessments.length > 0) {
    assessments.forEach((a: any) => {
      console.log(`  - Kind: ${a.kind}, Score: ${a.score}, Responses:`, a.responses)
    })
  } else {
    console.log('  ❌ NO SELF-CHECK DATA')
  }

  // 2. Check user_prompt_answers table
  console.log('\n📝 2. USER_PROMPT_ANSWERS TABLE')
  const { data: promptAnswers } = await supabase
    .from('user_prompt_answers')
    .select('*')
    .eq('user_id', user.id)
    .eq('chapter_id', 1)
  
  console.log(`Found: ${promptAnswers?.length || 0} prompt answers`)
  if (promptAnswers && promptAnswers.length > 0) {
    promptAnswers.forEach((p: any) => {
      console.log(`  - ${p.prompt_key}: ${JSON.stringify(p.answer).substring(0, 60)}...`)
    })
  }

  // 3. Check artifacts table - Your Turn responses
  console.log('\n📦 3. ARTIFACTS TABLE (Your Turn)')
  const { data: yourTurnArtifacts } = await supabase
    .from('artifacts')
    .select('*')
    .eq('user_id', user.id)
    .eq('chapter_id', 1)
    .eq('type', 'your_turn_response')
  
  console.log(`Found: ${yourTurnArtifacts?.length || 0} Your Turn responses`)
  if (yourTurnArtifacts && yourTurnArtifacts.length > 0) {
    yourTurnArtifacts.forEach((a: any) => {
      const promptKey = a.data.promptKey
      const text = a.data.responseText
      console.log(`  - ${promptKey}: "${text.substring(0, 50)}..."`)
    })
  } else {
    console.log('  ❌ NO YOUR TURN DATA')
  }

  // 4. Check resolution data
  console.log('\n🎯 4. RESOLUTION DATA')
  const { data: identityArtifact } = await supabase
    .from('artifacts')
    .select('*')
    .eq('user_id', user.id)
    .eq('chapter_id', 1)
    .eq('type', 'identity_resolution')
    .maybeSingle()
  
  const { data: proofArtifacts } = await supabase
    .from('artifacts')
    .select('*')
    .eq('user_id', user.id)
    .eq('chapter_id', 1)
    .eq('type', 'proof')
  
  console.log(`Identity Statement: ${identityArtifact ? '✅' : '❌'}`)
  console.log(`Proofs: ${proofArtifacts?.length || 0}`)

  // 5. Summary and action items
  console.log('\n' + '='.repeat(80))
  console.log('📋 REPORT DATA SUMMARY')
  console.log('='.repeat(80))
  
  const hasAssessment = assessments && assessments.length > 0
  const hasYourTurn = yourTurnArtifacts && yourTurnArtifacts.length > 0
  const hasResolution = identityArtifact || (proofArtifacts && proofArtifacts.length > 0)
  
  console.log(`\n✅ Assessment (Self-Check): ${hasAssessment ? 'YES' : 'NO'}`)
  console.log(`✅ Your Turn Responses: ${hasYourTurn ? 'YES' : 'NO'}`)
  console.log(`✅ Resolution: ${hasResolution ? 'YES' : 'NO'}`)
  
  console.log('\n🔧 ACTIONS NEEDED:')
  if (!hasAssessment) {
    console.log('  ❌ Complete Self-Check Assessment in the app')
  }
  if (!hasYourTurn) {
    console.log('  ❌ Complete Your Turn prompts (Framework, Techniques, Follow-Through)')
  }
  if (!hasResolution) {
    console.log('  ❌ Submit Resolution and Proof')
  }
  
  if (hasAssessment && hasYourTurn && hasResolution) {
    console.log('  ✅ ALL DATA EXISTS - Report should be complete!')
  }
}

checkReportStatus().catch(console.error)
