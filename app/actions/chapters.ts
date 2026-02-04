'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  awardXP,
  updateStreak,
  recordAssessmentScore,
  type AssessmentType,
  type XPReasonCode,
} from './gamification'
import { XP } from '@/lib/gamification/constants'

// ============================================================================
// TYPES
// ============================================================================

export type BlockType = 
  | 'reading' 
  | 'assessment' 
  | 'framework' 
  | 'techniques' 
  | 'proof' 
  | 'follow_through'

// ============================================================================
// STEP COMPLETION
// ============================================================================

export async function completeStep(
  stepId: string,
  chapterId: number
) {
  const supabase = createAdminClient()
  const userSupabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await userSupabase.auth.getUser()
  
  if (authError || !user) {
    console.error('Auth error in completeStep:', authError)
    return { error: 'Not authenticated' }
  }
  
  const userId = user.id
  
  try {
    const now = new Date().toISOString()
    const { error: stepError } = await supabase
      .from('step_completions')
      .upsert(
        {
          user_id: userId,
          step_id: stepId,
          status: 'completed',
          completed_at: now,
        },
        { onConflict: 'user_id,step_id', ignoreDuplicates: false }
      )
    
    if (stepError) {
      console.error('Error recording step completion:', stepError)
      return { 
        error: 'Failed to record step completion', 
        details: stepError.message,
        code: stepError.code
      }
    }
    
    // 2. Update streak and award daily/streak XP (idempotent — only on first activity today)
    let streakResult
    try {
      streakResult = await updateStreak(userId)
    } catch (streakErr) {
      console.error('Error in updateStreak:', streakErr)
      const msg = streakErr instanceof Error ? streakErr.message : String(streakErr)
      return { error: 'Streak update failed', details: msg, step: 'updateStreak' }
    }
    
    return { 
      success: true, 
      streakResult,
      stepCompleted: true 
    }
  } catch (error) {
    console.error('Error in completeStep:', error)
    const msg = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : undefined
    return { 
      error: 'An error occurred while completing the step', 
      details: msg, 
      step: 'unknown',
      stack: stack?.slice(0, 200)
    }
  }
}

// ============================================================================
// SECTION/BLOCK COMPLETION
// ============================================================================

export async function completeSectionBlock(
  chapterId: number,
  blockType: BlockType
) {
  const supabase = createAdminClient()
  const userSupabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await userSupabase.auth.getUser()
  
  if (authError || !user) {
    console.error('Auth error in completeSectionBlock:', authError)
    return { error: 'Not authenticated' }
  }
  
  const userId = user.id
  
  try {
    // Ensure chapter progress row exists
    const { data: existingProgress } = await supabase
      .from('chapter_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('chapter_id', chapterId)
      .single()
    
    if (!existingProgress) {
      await supabase.from('chapter_progress').insert({
        user_id: userId,
        chapter_id: chapterId,
      })
    }
    
    // Atomic first-time section completion: only award XP if block was not already complete
    const updateField = `${blockType}_complete`
    const timestampField = `${blockType}_completed_at`
    
    const { data: updatedRows, error: updateError } = await supabase
      .from('chapter_progress')
      .update({
        [updateField]: true,
        [timestampField]: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('chapter_id', chapterId)
      .eq(updateField, false)
      .select('id')
    
    if (updateError) {
      console.error('Error updating chapter progress:', updateError)
      return { error: 'Failed to update chapter progress' }
    }
    
    const firstTime = updatedRows?.length === 1
    let xpResult = null
    let reasonCode: XPReasonCode = firstTime ? 'first_time' : 'repeat_completion'
    if (firstTime) {
      xpResult = await awardXP(
        userId,
        'section_completion',
        XP.SECTION_COMPLETE,
        { chapter_id: chapterId, block_type: blockType },
        `section_first_complete:${userId}:${chapterId}:${blockType}`
      )
      if (xpResult.reasonCode) reasonCode = xpResult.reasonCode
    }
    
    return { 
      success: true, 
      blockCompleted: true,
      xpResult,
      firstTime,
      reasonCode,
    }
  } catch (error) {
    console.error('Error in completeSectionBlock:', error)
    return { error: 'An error occurred while completing the section' }
  }
}

// ============================================================================
// CHAPTER COMPLETION
// ============================================================================

export async function completeChapter(
  chapterId: number
) {
  const supabase = createAdminClient()
  const userSupabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await userSupabase.auth.getUser()
  
  if (authError || !user) {
    console.error('Auth error in completeChapter:', authError)
    return { error: 'Not authenticated' }
  }
  
  const userId = user.id
  
  try {
    // Update chapter session
    const { error: sessionError } = await supabase
      .from('chapter_sessions')
      .update({ completed_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('chapter_id', chapterId)
      .is('completed_at', null)
    
    if (sessionError) {
      console.error('Error updating chapter session:', sessionError)
    }
    
    // Atomic first-time chapter completion: only award XP if row was updated
    const { data: updatedRows, error: progressError } = await supabase
      .from('chapter_progress')
      .update({
        chapter_complete: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('chapter_id', chapterId)
      .eq('chapter_complete', false)
      .select('id')
    
    if (progressError) {
      console.error('Error updating chapter progress:', progressError)
      return { error: 'Failed to complete chapter' }
    }
    
    const firstTime = updatedRows?.length === 1
    let xpResult = null
    let reasonCode: XPReasonCode = firstTime ? 'first_time' : 'repeat_completion'
    if (firstTime) {
      xpResult = await awardXP(
        userId,
        'chapter_completion',
        XP.CHAPTER_FIRST_COMPLETE,
        { chapter_id: chapterId },
        `chapter_first_complete:${userId}:${chapterId}`
      )
      if (xpResult.reasonCode) reasonCode = xpResult.reasonCode
    }
    
    return { 
      success: true, 
      chapterCompleted: true,
      bonusXP: firstTime ? XP.CHAPTER_FIRST_COMPLETE : 0,
      xpResult,
      firstTime,
      reasonCode,
    }
  } catch (error) {
    console.error('Error in completeChapter:', error)
    return { error: 'An error occurred while completing the chapter' }
  }
}

// ============================================================================
// ASSESSMENT HANDLING
// ============================================================================

export async function submitAssessment(
  chapterId: number,
  assessmentType: AssessmentType,
  responses: Record<string, any>,
  score: number
) {
  const supabase = createAdminClient()
  const userSupabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await userSupabase.auth.getUser()
  
  if (authError || !user) {
    console.error('Auth error in submitAssessment:', authError)
    return { error: 'Not authenticated' }
  }
  
  const userId = user.id
  
  try {
    // 1. Record assessment in assessments table
    const { data: insertedAssessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        user_id: userId,
        chapter_id: chapterId,
        kind: assessmentType,
        responses,
        score,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single()
    
    if (assessmentError) {
      console.error('Error recording assessment:', assessmentError)
      return { error: 'Failed to record assessment' }
    }
    
    const assessmentId = insertedAssessment?.id
    
    // 2. Record skill score and potentially award improvement XP
    const improvementResult = await recordAssessmentScore(
      userId,
      chapterId,
      assessmentType,
      score,
      assessmentId ?? undefined
    )
    
    return {
      success: true,
      assessmentSubmitted: true,
      improvementResult
    }
  } catch (error) {
    console.error('Error in submitAssessment:', error)
    return { error: 'An error occurred while submitting the assessment' }
  }
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

export async function startChapterSession(
  chapterId: number
) {
  const supabase = createAdminClient()
  const userSupabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await userSupabase.auth.getUser()
  
  if (authError || !user) {
    console.error('Auth error in startChapterSession:', authError)
    return { error: 'Not authenticated' }
  }
  
  const userId = user.id
  
  try {
    // Check if there's an existing incomplete session
    const { data: existingSession } = await supabase
      .from('chapter_sessions')
      .select('id')
      .eq('user_id', userId)
      .eq('chapter_id', chapterId)
      .is('completed_at', null)
      .single()
    
    if (existingSession) {
      return { 
        success: true, 
        sessionId: existingSession.id,
        isNewSession: false 
      }
    }
    
    // Create new session
    const { data: newSession, error } = await supabase
      .from('chapter_sessions')
      .insert({
        user_id: userId,
        chapter_id: chapterId,
        started_at: new Date().toISOString()
      })
      .select('id')
      .single()
    
    if (error) {
      console.error('Error creating chapter session:', error)
      return { error: 'Failed to start chapter session' }
    }
    
    return { 
      success: true, 
      sessionId: newSession.id,
      isNewSession: true 
    }
  } catch (error) {
    console.error('Error in startChapterSession:', error)
    return { error: 'An error occurred while starting the chapter session' }
  }
}

// ============================================================================
// PROGRESS QUERIES
// ============================================================================

export async function getChapterProgress(chapterId: number) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: { message: 'Not authenticated' } }
  
  const { data, error } = await supabase
    .from('chapter_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('chapter_id', chapterId)
    .single()
  
  return { data, error }
}

export async function getStepCompletions(chapterId?: number) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: { message: 'Not authenticated' } }
  
  const { data, error } = await supabase
    .from('step_completions')
    .select('*')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false })
  
  return { data, error }
}

export async function getChapterSession(chapterId: number) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: { message: 'Not authenticated' } }
  
  const { data, error } = await supabase
    .from('chapter_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('chapter_id', chapterId)
    .order('started_at', { ascending: false })
    .limit(1)
    .single()
  
  return { data, error }
}
