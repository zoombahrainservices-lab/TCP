import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

import { createAdminClient } from '../lib/supabase/admin'

const USER_EMAIL = 'farzeen.ahamed@icloud.com'

async function checkPDFData() {
  const supabase = createAdminClient()

  console.log('🔍 Checking PDF data for user...\n')

  // Get user from auth
  const { data: authUsers } = await supabase.auth.admin.listUsers()
  
  if (!authUsers || authUsers.users.length === 0) {
    console.log('❌ No users found in auth')
    return
  }

  const user = authUsers.users.find((u) => u.email === USER_EMAIL) || authUsers.users[0]
  
  console.log(`✅ User found: ${user.email} (${user.id})\n`)

  // Check assessment
  const { data: assessment } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', user.id)
    .eq('chapter_id', 1)
    .eq('kind', 'baseline')
    .maybeSingle()

  console.log('📊 Assessment Data:')
  if (assessment) {
    console.log(`  - Score: ${assessment.score}`)
    console.log(`  - Responses:`, assessment.responses)
    console.log(`  - Created: ${assessment.created_at}`)
  } else {
    console.log('  ❌ No assessment found')
  }
  console.log()

  // Check Your Turn responses
  const { data: yourTurnArtifacts } = await supabase
    .from('artifacts')
    .select('id, data, created_at')
    .eq('user_id', user.id)
    .eq('chapter_id', 1)
    .eq('type', 'your_turn_response')
    .order('created_at', { ascending: true })

  console.log('📝 Your Turn Responses:')
  if (yourTurnArtifacts && yourTurnArtifacts.length > 0) {
    const framework = yourTurnArtifacts.filter((a: any) =>
      String(a.data.promptKey ?? '').startsWith('ch1_framework_')
    )
    const technique = yourTurnArtifacts.filter((a: any) =>
      String(a.data.promptKey ?? '').startsWith('ch1_technique_')
    )
    const followthrough = yourTurnArtifacts.filter((a: any) =>
      String(a.data.promptKey ?? '').startsWith('ch1_followthrough_')
    )

    console.log(`  - Framework: ${framework.length} responses`)
    framework.forEach((f: any, i: number) => {
      console.log(`    ${i + 1}. ${String(f.data.promptKey)}`)
    })
    console.log(`  - Technique: ${technique.length} responses`)
    technique.forEach((t: any, i: number) => {
      console.log(`    ${i + 1}. ${String(t.data.promptKey)}`)
    })
    console.log(`  - Follow-through: ${followthrough.length} responses`)
    followthrough.forEach((ft: any, i: number) => {
      console.log(`    ${i + 1}. ${String(ft.data.promptKey)}`)
    })
    console.log(`  - Total: ${yourTurnArtifacts.length}`)
  } else {
    console.log('  ❌ No Your Turn responses found')
  }
  console.log()

  // Check resolution/proofs
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

  console.log('🎯 Resolution Data:')
  console.log(`  - Identity Statement: ${identityArtifact ? '✅ Found' : '❌ Not found'}`)
  if (identityArtifact) {
    console.log(`    "${String(identityArtifact.data?.identity).substring(0, 50)}..."`)
  }
  console.log(`  - Proofs: ${proofArtifacts?.length || 0}`)
  console.log()

  console.log('📄 Summary:')
  console.log(`  Assessment: ${assessment ? '✅' : '❌'}`)
  console.log(`  Your Turn: ${yourTurnArtifacts && yourTurnArtifacts.length > 0 ? '✅' : '❌'}`)
  console.log(`  Resolution: ${identityArtifact || (proofArtifacts && proofArtifacts.length > 0) ? '✅' : '❌'}`)
}

checkPDFData().catch(console.error)
