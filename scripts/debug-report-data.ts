// Quick script to check what data exists for a specific user/chapter
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

async function debugReportData() {
  const userSupabase = await createClient()
  const supabase = createAdminClient()

  const {
    data: { user },
    error: authError,
  } = await userSupabase.auth.getUser()

  if (authError || !user) {
    console.error('Not authenticated:', authError)
    return
  }

  console.log('='.repeat(80))
  console.log('USER:', user.id)
  console.log('='.repeat(80))

  // Check Chapter 1 data (from the screenshot)
  const chapterId = 1

  console.log('\n1️⃣ SELF-CHECK ASSESSMENT DATA')
  const { data: assessments } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', user.id)
    .eq('chapter_id', chapterId)
    .eq('kind', 'baseline')

  console.log('Assessments found:', assessments?.length || 0)
  if (assessments && assessments.length > 0) {
    console.log('- Score:', assessments[0].score)
    console.log('- Responses:', JSON.stringify(assessments[0].responses, null, 2))
  }

  console.log('\n2️⃣ YOUR TURN RESPONSES (from artifacts)')
  const { data: yourTurnArtifacts } = await supabase
    .from('artifacts')
    .select('*')
    .eq('user_id', user.id)
    .eq('chapter_id', chapterId)
    .eq('type', 'your_turn_response')

  console.log('Your Turn artifacts found:', yourTurnArtifacts?.length || 0)
  if (yourTurnArtifacts && yourTurnArtifacts.length > 0) {
    yourTurnArtifacts.forEach((a: any, i: number) => {
      console.log(`  [${i + 1}] ${a.data.promptKey}: "${a.data.responseText?.substring(0, 50)}..."`)
    })
  }

  console.log('\n3️⃣ YOUR TURN RESPONSES (from user_prompt_answers)')
  const { data: promptAnswers } = await supabase
    .from('user_prompt_answers')
    .select('*')
    .eq('user_id', user.id)
    .eq('chapter_id', chapterId)

  console.log('Prompt answers found:', promptAnswers?.length || 0)
  if (promptAnswers && promptAnswers.length > 0) {
    const filtered = promptAnswers.filter((a: any) => !a.prompt_key.includes('self_check'))
    console.log('Non-self-check answers:', filtered.length)
    filtered.forEach((a: any, i: number) => {
      const answerText = typeof a.answer === 'string' ? a.answer : JSON.stringify(a.answer)
      console.log(`  [${i + 1}] ${a.prompt_key}: "${answerText.substring(0, 50)}..."`)
    })
  }

  console.log('\n4️⃣ IDENTITY RESOLUTION DATA')
  const { data: identityArtifact } = await supabase
    .from('artifacts')
    .select('*')
    .eq('user_id', user.id)
    .eq('chapter_id', chapterId)
    .eq('type', 'identity_resolution')
    .maybeSingle()

  console.log('Identity resolution artifact:', identityArtifact ? 'FOUND' : 'NOT FOUND')
  if (identityArtifact) {
    console.log('- Identity:', identityArtifact.data?.identity?.substring(0, 100))
  }

  console.log('\n5️⃣ PROOF DATA')
  const { data: proofArtifacts } = await supabase
    .from('artifacts')
    .select('*')
    .eq('user_id', user.id)
    .eq('chapter_id', chapterId)
    .eq('type', 'proof')

  console.log('Proof artifacts found:', proofArtifacts?.length || 0)
  if (proofArtifacts && proofArtifacts.length > 0) {
    proofArtifacts.forEach((p: any, i: number) => {
      console.log(`  [${i + 1}] Type: ${p.data.type || p.data.resolutionType}`)
      console.log(`      Title: ${p.data.title || 'Untitled'}`)
      console.log(`      Identity: ${p.data.identity ? 'YES (' + p.data.identity.substring(0, 50) + '...)' : 'NO'}`)
      console.log(`      Notes: ${p.data.notes ? 'YES (' + p.data.notes.substring(0, 50) + '...)' : 'NO'}`)
    })
  }

  console.log('\n' + '='.repeat(80))
  console.log('SUMMARY')
  console.log('='.repeat(80))
  console.log('✅ Assessment:', assessments && assessments.length > 0 ? 'YES' : 'NO')
  console.log('📝 Your Turn:', (yourTurnArtifacts?.length || 0) + (promptAnswers?.filter((a: any) => !a.prompt_key.includes('self_check')).length || 0) > 0 ? 'YES' : 'NO')
  console.log('🎯 Resolution:', (identityArtifact || (proofArtifacts && proofArtifacts.length > 0)) ? 'YES' : 'NO')
}

debugReportData().catch(console.error)
