import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { createAdminClient } from '../lib/supabase/admin'

async function analyzeSelfCheckFlow() {
  const supabase = createAdminClient()

  console.log('🔍 MULTI-PERSPECTIVE ANALYSIS: Self-Check XP Celebration Missing\n')
  console.log('='  .repeat(80))

  const { data: authUsers } = await supabase.auth.admin.listUsers()
  const user = authUsers.users[0]

  console.log(`\n👤 USER: ${user.email}`)
  console.log('='  .repeat(80))

  // PERSPECTIVE 1: Check chapter_progress for self-check completion
  console.log('\n📊 PERSPECTIVE 1: Chapter Progress Table (assessment_complete flag)')
  const { data: chapterProgress } = await supabase
    .from('chapter_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('chapter_id', 1)
    .maybeSingle()
  
  if (chapterProgress) {
    console.log('  assessment_complete:', chapterProgress.assessment_complete)
    console.log('  Created:', chapterProgress.created_at)
    console.log('  Updated:', chapterProgress.updated_at)
  } else {
    console.log('  ❌ No chapter_progress record')
  }

  // PERSPECTIVE 2: Check assessments table for actual submission
  console.log('\n📝 PERSPECTIVE 2: Assessments Table (actual self-check data)')
  const { data: assessments } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', user.id)
    .eq('chapter_id', 1)
    .order('created_at', { ascending: false })
  
  console.log(`  Found: ${assessments?.length || 0} assessment records`)
  if (assessments && assessments.length > 0) {
    assessments.forEach((a: any, idx: number) => {
      console.log(`  ${idx + 1}. Kind: ${a.kind}, Score: ${a.score}, Created: ${a.created_at}`)
    })
  } else {
    console.log('  ❌ No assessment records')
  }

  // PERSPECTIVE 3: Check step_completions for self-check step
  console.log('\n✅ PERSPECTIVE 3: Step Completions Table')
  const { data: selfCheckStep } = await supabase
    .from('chapter_steps')
    .select('id, slug')
    .eq('chapter_id', 1)
    .eq('step_type', 'self_check')
    .maybeSingle()
  
  if (selfCheckStep) {
    console.log(`  Self-check step ID: ${selfCheckStep.id}, slug: ${selfCheckStep.slug}`)
    
    const { data: stepCompletion } = await supabase
      .from('step_completions')
      .select('*')
      .eq('user_id', user.id)
      .eq('step_id', selfCheckStep.id)
      .maybeSingle()
    
    if (stepCompletion) {
      console.log('  ✅ Step completion exists')
      console.log('  Completed at:', stepCompletion.completed_at)
      console.log('  XP awarded:', stepCompletion.xp_awarded)
    } else {
      console.log('  ❌ No step_completions record for self-check')
    }
  }

  // PERSPECTIVE 4: Check user_gamification for XP changes
  console.log('\n🎮 PERSPECTIVE 4: User Gamification (XP tracking)')
  const { data: gamification } = await supabase
    .from('user_gamification')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()
  
  if (gamification) {
    console.log(`  Current XP: ${gamification.xp}`)
    console.log(`  Current Level: ${gamification.level}`)
    console.log(`  Last updated: ${gamification.updated_at}`)
  }

  // PERSPECTIVE 5: Check if completeDynamicSection is called for self-check
  console.log('\n🔧 PERSPECTIVE 5: Code Flow Analysis')
  console.log('  Question: Does SelfCheckAssessment call completeDynamicSection?')
  console.log('  Need to check: app/read/[chapterSlug]/[stepSlug]/DynamicStepClient.tsx')
  console.log('  and components/assessment/SelfCheckAssessment.tsx')

  // PERSPECTIVE 6: Compare with working sections (reading, framework, etc.)
  console.log('\n📊 PERSPECTIVE 6: Working Sections Comparison')
  const workingSections = ['reading', 'framework', 'techniques', 'proof', 'follow_through']
  
  for (const stepType of workingSections) {
    const { data: step } = await supabase
      .from('chapter_steps')
      .select('id, slug, step_type')
      .eq('chapter_id', 1)
      .eq('step_type', stepType)
      .maybeSingle()
    
    if (step) {
      const { data: completion } = await supabase
        .from('step_completions')
        .select('xp_awarded, completed_at')
        .eq('user_id', user.id)
        .eq('step_id', step.id)
        .maybeSingle()
      
      console.log(`  ${stepType}: ${completion ? `✅ XP: ${completion.xp_awarded}` : '❌ Not completed'}`)
    }
  }

  // PERSPECTIVE 7: Check server action logs pattern
  console.log('\n📜 PERSPECTIVE 7: Server Action Pattern')
  console.log('  Working sections call: completeDynamicSection({ chapterNumber, stepType })')
  console.log('  Self-check needs to call: completeDynamicSection OR completeSectionBlock')
  console.log('  Current self-check only calls: submitAssessment (saves answers, no XP)')

  // PERSPECTIVE 8: Review celebration trigger logic
  console.log('\n🎉 PERSPECTIVE 8: Celebration Trigger Logic')
  console.log('  Working flow: Section completion -> returns xpResult/streakResult -> celebrateSectionCompletion')
  console.log('  Self-check flow: submitAssessment -> ??? -> NO celebration trigger')

  // PERSPECTIVE 9: Check if assessment completion updates chapter_progress
  console.log('\n🔄 PERSPECTIVE 9: Chapter Progress Update Flow')
  console.log('  submitAssessment saves to assessments table')
  console.log('  But does it call completeDynamicSection to:')
  console.log('    1. Mark assessment_complete = true in chapter_progress?')
  console.log('    2. Award XP via completeSectionBlock?')
  console.log('    3. Return xpResult for celebration?')

  console.log('\n' + '='.repeat(80))
  console.log('🎯 CONVERGENCE ANALYSIS')
  console.log('='.repeat(80))
  
  const hasAssessmentData = assessments && assessments.length > 0
  const hasStepCompletion = false // We'll check this
  const hasChapterProgressFlag = chapterProgress?.assessment_complete

  console.log('\n📋 FINDINGS:')
  console.log(`  1. Assessment data exists: ${hasAssessmentData ? 'YES' : 'NO'}`)
  console.log(`  2. Chapter progress flag: ${hasChapterProgressFlag ? 'YES' : 'NO'}`)
  console.log(`  3. Step completion record: Checking...`)

  if (selfCheckStep) {
    const { data: stepCompletion } = await supabase
      .from('step_completions')
      .select('*')
      .eq('user_id', user.id)
      .eq('step_id', selfCheckStep.id)
      .maybeSingle()
    
    console.log(`  3. Step completion record: ${stepCompletion ? 'YES' : 'NO'}`)
    
    if (!stepCompletion) {
      console.log('\n❌ ROOT CAUSE IDENTIFIED:')
      console.log('  Self-check does NOT create step_completions record')
      console.log('  This means:')
      console.log('    - No XP is awarded')
      console.log('    - No celebration is triggered')
      console.log('    - completeDynamicSection is NOT being called')
      console.log('\n  SOLUTION:')
      console.log('    After submitAssessment succeeds, call completeDynamicSection')
      console.log('    to award XP and trigger celebration')
    }
  }
}

analyzeSelfCheckFlow().catch(console.error)
