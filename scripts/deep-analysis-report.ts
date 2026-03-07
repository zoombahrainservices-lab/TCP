import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

import { createAdminClient } from '../lib/supabase/admin'

async function deepAnalysis() {
  const supabase = createAdminClient()

  console.log('🔍 DEEP ANALYSIS: Chapter 1 Complete Report Data\n')
  console.log('='  .repeat(80))

  // Get user
  const { data: authUsers } = await supabase.auth.admin.listUsers()
  const user = authUsers.users[0]
  
  console.log(`\n👤 USER: ${user.email} (${user.id})`)
  console.log('='  .repeat(80))

  // PERSPECTIVE 1: Assessment Table
  console.log('\n📊 PERSPECTIVE 1: Assessments Table')
  const { data: allAssessments } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', user.id)
  
  console.log(`Total assessments for user: ${allAssessments?.length || 0}`)
  if (allAssessments && allAssessments.length > 0) {
    allAssessments.forEach((a: any) => {
      console.log(`  - Chapter ${a.chapter_id}, Kind: ${a.kind}, Score: ${a.score}`)
      console.log(`    Responses: ${JSON.stringify(a.responses)}`)
    })
  }

  // PERSPECTIVE 2: Artifacts Table - ALL types
  console.log('\n📦 PERSPECTIVE 2: Artifacts Table (All Types)')
  const { data: allArtifacts } = await supabase
    .from('artifacts')
    .select('id, type, chapter_id, data, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
  
  console.log(`Total artifacts: ${allArtifacts?.length || 0}`)
  const groupedByType = (allArtifacts || []).reduce((acc: any, a: any) => {
    if (!acc[a.type]) acc[a.type] = []
    acc[a.type].push(a)
    return acc
  }, {})
  
  Object.entries(groupedByType).forEach(([type, items]: [string, any]) => {
    console.log(`  ${type}: ${items.length} items`)
    if (type === 'your_turn_response') {
      items.forEach((item: any) => {
        console.log(`    - ${item.data.promptKey} (ch${item.chapter_id})`)
      })
    }
  })

  // PERSPECTIVE 3: Chapter Progress
  console.log('\n📈 PERSPECTIVE 3: Chapter Progress Table')
  const { data: chapterProgress } = await supabase
    .from('chapter_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('chapter_id', 1)
    .maybeSingle()
  
  if (chapterProgress) {
    console.log('  Chapter 1 Progress:')
    console.log(`    - reading_complete: ${chapterProgress.reading_complete}`)
    console.log(`    - assessment_complete: ${chapterProgress.assessment_complete}`)
    console.log(`    - framework_complete: ${chapterProgress.framework_complete}`)
    console.log(`    - technique_complete: ${chapterProgress.technique_complete}`)
    console.log(`    - proof_complete: ${chapterProgress.proof_complete}`)
    console.log(`    - follow_through_complete: ${chapterProgress.follow_through_complete}`)
    console.log(`    - chapter_complete: ${chapterProgress.chapter_complete}`)
  }

  // PERSPECTIVE 4: getAssessmentReportData simulation
  console.log('\n🔬 PERSPECTIVE 4: Simulating getAssessmentReportData(1)')
  const { data: assessment } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', user.id)
    .eq('chapter_id', 1)
    .eq('kind', 'baseline')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  
  console.log(`  Result: ${assessment ? 'FOUND' : 'NOT FOUND'}`)
  if (assessment) {
    console.log(`    Score: ${assessment.score}`)
    console.log(`    Responses: ${JSON.stringify(assessment.responses, null, 2)}`)
  }

  // PERSPECTIVE 5: getResolutionReportData simulation - Your Turn
  console.log('\n📝 PERSPECTIVE 5: Simulating Your Turn Data Fetch')
  const { data: yourTurnArtifacts } = await supabase
    .from('artifacts')
    .select('id, data, created_at')
    .eq('user_id', user.id)
    .eq('chapter_id', 1)
    .eq('type', 'your_turn_response')
    .order('created_at', { ascending: true })

  console.log(`  Total Your Turn responses: ${yourTurnArtifacts?.length || 0}`)
  
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

    console.log(`    Framework: ${framework.length}`)
    console.log(`    Technique: ${technique.length}`)
    console.log(`    Follow-through: ${followthrough.length}`)
  }

  // PERSPECTIVE 6: Resolution/Proof data
  console.log('\n🎯 PERSPECTIVE 6: Resolution/Proof Data')
  const { data: proofArtifacts } = await supabase
    .from('artifacts')
    .select('*')
    .eq('user_id', user.id)
    .eq('chapter_id', 1)
    .eq('type', 'proof')
  
  console.log(`  Proofs: ${proofArtifacts?.length || 0}`)

  const { data: identityArtifact } = await supabase
    .from('artifacts')
    .select('*')
    .eq('user_id', user.id)
    .eq('chapter_id', 1)
    .eq('type', 'identity_resolution')
    .maybeSingle()
  
  console.log(`  Identity Resolution: ${identityArtifact ? 'FOUND' : 'NOT FOUND'}`)

  // PERSPECTIVE 7: Check if data exists but with wrong format
  console.log('\n🔍 PERSPECTIVE 7: Data Format Issues')
  if (allArtifacts) {
    const yourTurnWithWrongPrefix = allArtifacts.filter((a: any) => 
      a.type === 'your_turn_response' && 
      a.chapter_id === 1 &&
      !String(a.data.promptKey ?? '').startsWith('ch1_')
    )
    console.log(`  Your Turn with wrong prefix: ${yourTurnWithWrongPrefix.length}`)
    yourTurnWithWrongPrefix.forEach((a: any) => {
      console.log(`    - ${a.data.promptKey}`)
    })
  }

  // PERSPECTIVE 8: Server Action Return Values
  console.log('\n⚙️ PERSPECTIVE 8: What PDF Generation Will Receive')
  console.log(`  assessmentData: ${assessment ? 'WILL EXIST' : 'WILL BE NULL'}`)
  console.log(`  resolutionData.yourTurnByCategory:`)
  console.log(`    - framework: ${yourTurnArtifacts?.filter((a: any) => String(a.data.promptKey ?? '').startsWith('ch1_framework_')).length || 0} items`)
  console.log(`    - technique: ${yourTurnArtifacts?.filter((a: any) => String(a.data.promptKey ?? '').startsWith('ch1_technique_')).length || 0} items`)
  console.log(`    - followThrough: ${yourTurnArtifacts?.filter((a: any) => String(a.data.promptKey ?? '').startsWith('ch1_followthrough_')).length || 0} items`)
  console.log(`  resolutionData.proofs: ${proofArtifacts?.length || 0} items`)

  // PERSPECTIVE 9: Final Diagnosis
  console.log('\n' + '='.repeat(80))
  console.log('🎯 PERSPECTIVE 9: ROOT CAUSE DIAGNOSIS')
  console.log('='.repeat(80))
  
  const issues = []
  
  if (!assessment) {
    issues.push('❌ MISSING: Self-Check Assessment not completed/submitted')
  } else {
    console.log('✅ Assessment data EXISTS')
  }
  
  if (!yourTurnArtifacts || yourTurnArtifacts.length === 0) {
    issues.push('❌ MISSING: No Your Turn responses found')
  } else {
    console.log('✅ Your Turn data EXISTS')
  }
  
  if (!proofArtifacts || proofArtifacts.length === 0) {
    issues.push('⚠️ WARNING: No proof submissions')
  } else {
    console.log('✅ Resolution/Proof data EXISTS')
  }
  
  if (issues.length > 0) {
    console.log('\n❌ ISSUES PREVENTING COMPLETE REPORT:')
    issues.forEach(issue => console.log(`  ${issue}`))
  } else {
    console.log('\n✅ ALL DATA EXISTS - PDF should show complete report')
  }

  console.log('\n' + '='.repeat(80))
}

deepAnalysis().catch(console.error)
