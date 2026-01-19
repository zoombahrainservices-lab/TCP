'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { uploadFile } from '@/lib/storage/uploads'
import { revalidatePath } from 'next/cache'

export type PhaseType = 'power-scan' | 'secret-intel' | 'visual-guide' | 'field-mission' | 'level-up'

export interface Phase {
  id: number
  chapter_id: number
  phase_number: number
  phase_type: PhaseType
  title: string | null
  content: string | null
  metadata: any
  created_at: string
  updated_at: string
}

export interface PhaseWithChapter extends Phase {
  chapter: {
    id: number
    zone_id: number
    chapter_number: number
    title: string
    zone: {
      id: number
      zone_number: number
      name: string
    }
  }
}

export interface PhaseProgress {
  id: number
  student_id: string
  zone_id: number
  chapter_id: number
  phase_id: number
  started_at: string
  completed_at: string | null
  responses: any
  task_acknowledged_at: string | null
  task_due_at: string | null
  task_reminder_sent_at: string | null
  reflection_text: string | null
  reviewed_at: string | null
  review_feedback: string | null
  created_at: string
  updated_at: string
}

/**
 * Get all phases for a chapter
 */
export async function getPhasesByChapter(chapterId: number): Promise<Phase[]> {
  const supabase = await createClient()

  const { data: phases, error } = await supabase
    .from('phases')
    .select('*')
    .eq('chapter_id', chapterId)
    .order('phase_number', { ascending: true })

  if (error) {
    console.error('getPhasesByChapter error:', error)
    throw new Error('Failed to fetch phases')
  }

  return phases || []
}

/**
 * Get a single phase by ID
 */
export async function getPhase(phaseId: number): Promise<PhaseWithChapter | null> {
  const supabase = await createClient()

  const { data: phase, error } = await supabase
    .from('phases')
    .select(`
      *,
      chapter:chapters (
        id,
        zone_id,
        chapter_number,
        title,
        zone:zones (
          id,
          zone_number,
          name
        )
      )
    `)
    .eq('id', phaseId)
    .single()

  if (error) {
    console.error('getPhase error:', error)
    return null
  }

  return {
    ...phase,
    chapter: {
      ...phase.chapter,
      zone: Array.isArray(phase.chapter.zone) ? phase.chapter.zone[0] : phase.chapter.zone
    }
  } as PhaseWithChapter
}

/**
 * Get phase by chapter and phase type
 */
export async function getPhaseByType(
  chapterId: number,
  phaseType: PhaseType
): Promise<Phase | null> {
  const supabase = await createClient()

  console.log('[getPhaseByType] Looking for phase:', { chapterId, phaseType })
  
  const { data: phase, error } = await supabase
    .from('phases')
    .select('*')
    .eq('chapter_id', chapterId)
    .eq('phase_type', phaseType)
    .single()

  if (error) {
    console.error('[getPhaseByType] Error:', error)
    console.error('[getPhaseByType] Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    })
    
    // Check if there are any phases for this chapter at all
    const { data: allPhases } = await supabase
      .from('phases')
      .select('id, chapter_id, phase_type, phase_number')
      .eq('chapter_id', chapterId)
    
    console.log('[getPhaseByType] All phases for chapter:', allPhases)
    
    return null
  }

  console.log('[getPhaseByType] Found phase:', phase)
  return phase
}

/**
 * Get student's progress for a specific phase
 */
export async function getPhaseProgress(
  studentId: string,
  phaseId: number
): Promise<PhaseProgress | null> {
  const supabase = await createClient()

  const { data: progress, error } = await supabase
    .from('student_progress')
    .select('*')
    .eq('student_id', studentId)
    .eq('phase_id', phaseId)
    .single()

  if (error) {
    // Not found is ok - means phase not started yet
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('getPhaseProgress error:', error)
    return null
  }

  return progress
}

/**
 * Check if a phase is unlocked for a student
 * A phase is unlocked if:
 * 1. The chapter is unlocked
 * 2. It's phase 1, OR the previous phase is completed
 */
export async function isPhaseUnlocked(
  studentId: string,
  phaseId: number
): Promise<boolean> {
  const supabase = await createClient()

  const phase = await getPhase(phaseId)
  if (!phase) return false

  // Check if chapter is unlocked
  const { isChapterUnlocked } = await import('./chapters')
  const chapterUnlocked = await isChapterUnlocked(studentId, phase.chapter_id)
  if (!chapterUnlocked) return false

  // Phase 1 is always unlocked (if chapter is unlocked)
  if (phase.phase_number === 1) return true

  // For other phases, check if previous phase is completed
  const { data: previousPhase } = await supabase
    .from('phases')
    .select('id')
    .eq('chapter_id', phase.chapter_id)
    .eq('phase_number', phase.phase_number - 1)
    .single()

  if (!previousPhase) return false

  const previousProgress = await getPhaseProgress(studentId, previousPhase.id)
  
  return previousProgress !== null && previousProgress.completed_at !== null
}

/**
 * Start a phase (create progress record)
 */
export async function startPhase(
  studentId: string,
  phaseId: number
): Promise<{ success: boolean; progressId?: number; error?: string }> {
  const supabase = await createClient()

  // Check if already started
  const existing = await getPhaseProgress(studentId, phaseId)
  if (existing) {
    return { success: true, progressId: existing.id }
  }

  // Check if phase is unlocked
  const unlocked = await isPhaseUnlocked(studentId, phaseId)
  if (!unlocked) {
    return { success: false, error: 'Phase is locked' }
  }

  // Get phase details for zone_id and chapter_id
  const phase = await getPhase(phaseId)
  if (!phase) {
    return { success: false, error: 'Phase not found' }
  }

  // Create progress record
  const { data: progress, error } = await supabase
    .from('student_progress')
    .insert({
      student_id: studentId,
      zone_id: phase.chapter.zone_id,
      chapter_id: phase.chapter_id,
      phase_id: phaseId,
      started_at: new Date().toISOString(),
      responses: {},
    })
    .select('id')
    .single()

  if (error) {
    console.error('startPhase error:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/student')
  return { success: true, progressId: progress.id }
}

/**
 * Save responses for a phase (e.g., before/after questions)
 */
export async function savePhaseResponses(
  progressId: number,
  responses: any
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('student_progress')
    .update({ responses })
    .eq('id', progressId)

  if (error) {
    console.error('savePhaseResponses error:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/student')
  return { success: true }
}

/**
 * Acknowledge task (for field-mission phase)
 */
export async function acknowledgeTask(
  progressId: number,
  deadlineHours: number = 24
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const now = new Date()
  const dueDate = new Date(now.getTime() + deadlineHours * 60 * 60 * 1000)

  const { error } = await supabase
    .from('student_progress')
    .update({
      task_acknowledged_at: now.toISOString(),
      task_due_at: dueDate.toISOString(),
    })
    .eq('id', progressId)

  if (error) {
    console.error('acknowledgeTask error:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/student')
  return { success: true }
}

/**
 * Upload proof for a phase (typically field-mission)
 */
export async function uploadPhaseProof(
  progressId: number,
  studentId: string,
  type: 'audio' | 'image' | 'text',
  fileOrText: File | string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  let url = null
  let textContent = null

  if (type === 'text' && typeof fileOrText === 'string') {
    textContent = fileOrText
  } else if (fileOrText instanceof File) {
    // Upload file to storage
    const filePath = await uploadFile(fileOrText, studentId)
    const { data } = supabase.storage
      .from('student-uploads')
      .getPublicUrl(filePath)
    url = data.publicUrl
  }

  // Insert upload record
  const { error: uploadError } = await supabase
    .from('phase_uploads')
    .insert({
      progress_id: progressId,
      type,
      url,
      text_content: textContent,
    })

  if (uploadError) {
    console.error('uploadPhaseProof error:', uploadError)
    return { success: false, error: uploadError.message }
  }

  revalidatePath('/student')
  return { success: true }
}

/**
 * Save reflection (for level-up phase)
 */
export async function saveReflection(
  progressId: number,
  reflectionText: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('student_progress')
    .update({ reflection_text: reflectionText })
    .eq('id', progressId)

  if (error) {
    console.error('saveReflection error:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/student')
  return { success: true }
}

/**
 * Complete a phase
 * Awards XP and checks for bonuses (chapter completion, zone completion, perfect scores)
 */
export async function completePhase(
  progressId: number
): Promise<{ success: boolean; error?: string; xpResult?: import('./xp').XPResult }> {
  const supabase = await createClient()
  const { awardXpForPhaseCompletion } = await import('./xp')
  const { XP_CONFIG } = await import('@/config/xp')

  // Get progress record with phase and chapter info
  const { data: progress, error: progressError } = await supabase
    .from('student_progress')
    .select(`
      *,
      phase:phases (
        id,
        phase_type,
        chapter:chapters (
          id,
          zone_id,
          zone:zones (id)
        )
      )
    `)
    .eq('id', progressId)
    .single()

  if (progressError || !progress) {
    console.error('completePhase error:', progressError)
    return { success: false, error: progressError?.message || 'Progress not found' }
  }

  const studentId = progress.student_id
  const phaseId = progress.phase_id

  // Check if already completed (prevent duplicate XP)
  if (progress.completed_at) {
    return { success: true, error: 'Phase already completed' }
  }

  // Verify phase is actually unlocked (enforce unlock rules)
  const unlocked = await isPhaseUnlocked(studentId, phaseId)
  if (!unlocked) {
    return {
      success: false,
      error: 'Phase is locked. Complete previous phases first.'
    }
  }

  // Update completion status
  const { error: updateError } = await supabase
    .from('student_progress')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', progressId)

  if (updateError) {
    console.error('completePhase update error:', updateError)
    return { success: false, error: updateError.message }
  }

  // Perfect score bonus (folded into PHASE_COMPLETE event amount in v2)
  const responses = progress.responses || {}
  const answerGroups: any[] = []

  if (Array.isArray(responses.beforeAnswers)) answerGroups.push(responses.beforeAnswers)
  if (Array.isArray(responses.afterAnswers)) answerGroups.push(responses.afterAnswers)
  if (Array.isArray(responses.answers)) answerGroups.push(responses.answers)

  const isPerfectGroup = (group: any[]) =>
    group.length > 0 &&
    group.every((a: any) => {
      const v = typeof a === 'number' ? a : a?.answer
      return v === 5 || v === 7
    })

  const perfectScore = answerGroups.some(isPerfectGroup)

  // Award XP (event-based + idempotent)
  try {
    const awardResult = await awardXpForPhaseCompletion({ studentId, phaseId, perfectScore })

    const xpResult: import('./xp').XPResult = {
      baseXP: XP_CONFIG.XP_PER_PHASE,
      bonuses: {
        chapter: awardResult.xpAwarded.mission > 0 ? XP_CONFIG.XP_PER_MISSION : undefined,
        zone: awardResult.xpAwarded.zone > 0 ? XP_CONFIG.XP_PER_ZONE : undefined,
        perfect: awardResult.xpAwarded.phase > XP_CONFIG.XP_PER_PHASE ? XP_CONFIG.XP_PERFECT_SCORE_BONUS : undefined,
      },
      totalXP: awardResult.xpAwarded.total,
      newXP: awardResult.profile?.xp ?? 0,
      newTotalXpEarned: awardResult.profile?.totalXpEarned ?? 0,
      newLevel: awardResult.profile?.level ?? 1,
      oldLevel: awardResult.profile?.oldLevel ?? 1,
      leveledUp: awardResult.profile?.leveledUp ?? false,
      message:
        awardResult.xpAwarded.total > 0
          ? `You earned ${awardResult.xpAwarded.total} XP!`
          : `XP already awarded for this completion.`,
    }

    revalidatePath('/student')
    return { success: true, xpResult }
  } catch (xpError) {
    console.error('completePhase: XP award failed', xpError)
    // Still return success since phase was completed, just XP failed
    revalidatePath('/student')
    return { success: true, error: 'Phase completed but XP award failed' }
  }
}

/**
 * Get all uploads for a progress record
 */
export async function getPhaseUploads(progressId: number): Promise<any[]> {
  const supabase = await createClient()

  const { data: uploads, error } = await supabase
    .from('phase_uploads')
    .select('*')
    .eq('progress_id', progressId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getPhaseUploads error:', error)
    return []
  }

  return uploads || []
}

/**
 * Admin: Create a new phase
 */
export async function createPhase(data: {
  chapter_id: number
  phase_number: number
  phase_type: PhaseType
  title?: string
  content?: string
  metadata?: any
}): Promise<{ success: boolean; error?: string; phaseId?: number }> {
  const adminClient = createAdminClient()

  const { data: phase, error } = await adminClient
    .from('phases')
    .insert({
      chapter_id: data.chapter_id,
      phase_number: data.phase_number,
      phase_type: data.phase_type,
      title: data.title || null,
      content: data.content || null,
      metadata: data.metadata || {},
    })
    .select('id')
    .single()

  if (error) {
    console.error('createPhase error:', error)
    return { success: false, error: error.message }
  }

  return { success: true, phaseId: phase.id }
}

/**
 * Admin: Update a phase
 */
export async function updatePhase(
  phaseId: number,
  data: Partial<Omit<Phase, 'id' | 'created_at' | 'updated_at'>>
): Promise<{ success: boolean; error?: string }> {
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('phases')
    .update(data)
    .eq('id', phaseId)

  if (error) {
    console.error('updatePhase error:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Admin: Delete a phase
 */
export async function deletePhase(phaseId: number): Promise<{ success: boolean; error?: string }> {
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('phases')
    .delete()
    .eq('id', phaseId)

  if (error) {
    console.error('deletePhase error:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
