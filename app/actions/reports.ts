'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAllChapters } from '@/lib/content/queries'
import { getAssessmentConfig } from '@/lib/reports/assessmentConfig'

// ============================================================================
// TYPES
// ============================================================================

export type AssessmentReportData = {
  chapterId: number
  chapterTitle: string
  assessmentType: string
  score: number
  maxScore: number
  completedAt: string
  questions: Array<{
    id: number
    question: string
    low: string
    high: string
    userResponse: number
  }>
}

export type YourTurnQandA = {
  promptText: string | null
  responseText: string
  createdAt: string
}

export type ResolutionReportData = {
  chapterId: number
  chapterTitle: string
  completedAt: string
  identityResolution?: string
  proofs: Array<{
    type: 'text' | 'image' | 'audio' | 'video'
    title: string
    notes: string
    storagePath?: string
    createdAt: string
  }>
  /** Your Turn Q&A grouped by category for the PDF */
  yourTurnByCategory: {
    framework: YourTurnQandA[]
    techniques: YourTurnQandA[]
    followThrough: YourTurnQandA[]
  }
}

export type ChapterReportMeta = {
  chapterId: number
  title: string
  status: 'available' | 'locked' | 'pending'
  assessmentAvailable: boolean
  resolutionAvailable: boolean
}

// ============================================================================
// CHAPTER ASSESSMENT CONFIG (questions + title per chapter for reports)
// ============================================================================

const ASSESSMENT_CONFIG: Record<
  number,
  { chapterTitle: string; questions: Array<{ id: number; question: string; low: string; high: string }>; maxScore: number }
> = {
  1: {
    chapterTitle: 'Chapter 1: From Stage Star to Silent Struggles',
    maxScore: 49,
    questions: [
      { id: 1, question: 'How often I grab phone when working', low: 'Rarely', high: 'Constantly' },
      { id: 2, question: "Remember yesterday's scrolling", low: 'Yes', high: 'Barely' },
      { id: 3, question: 'Feel after phone session', low: 'Energized', high: 'Empty' },
      { id: 4, question: 'Time on passion this year', low: 'More', high: 'Abandoned' },
      { id: 5, question: 'Time before phone urge', low: '30+ min', high: 'Under 5' },
      { id: 6, question: 'Use phone to avoid feelings', low: 'Rarely', high: 'Always' },
      { id: 7, question: 'Phone vanished 24hrs', low: 'Relieved', high: 'Panicked' },
    ],
  },
  2: {
    chapterTitle: 'Chapter 2: The Genius Who Couldn\'t Speak',
    maxScore: 28,
    questions: [
      { id: 1, question: 'I avoid speaking situations when possible', low: 'Rarely', high: 'Always' },
      { id: 2, question: 'My mind goes blank when speaking', low: 'Never', high: 'Every time' },
      { id: 3, question: 'Physical symptoms (shaking/racing heart) overwhelm me', low: 'Manageable', high: 'Paralyzing' },
      { id: 4, question: 'I catastrophize what could go wrong', low: 'Rarely', high: 'Constantly' },
    ],
  },
}

// NOTE: getAssessmentConfig has been moved to `lib/reports/assessmentConfig` so this
// server-actions file only exports async functions.

// ============================================================================
// GET CHAPTERS FOR REPORTS PAGE (with availability per chapter)
// ============================================================================

export async function getChaptersForReports(): Promise<
  { success: true; data: ChapterReportMeta[] } | { success: false; error: string }
> {
  try {
    const userSupabase = await createClient()
    const supabase = createAdminClient()

    const {
      data: { user },
      error: authError,
    } = await userSupabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    const chapters = await getAllChapters()
    if (!chapters?.length) {
      return { success: true, data: [] }
    }

    const chapterNumbers = chapters.map((c) => c.chapter_number as number)

    const [assessmentsRows, artifactsRows] = await Promise.all([
      supabase
        .from('assessments')
        .select('chapter_id')
        .eq('user_id', user.id)
        .eq('kind', 'baseline')
        .in('chapter_id', chapterNumbers),
      supabase
        .from('artifacts')
        .select('chapter_id, type')
        .eq('user_id', user.id)
        .in('chapter_id', chapterNumbers),
    ])

    const hasAssessment = new Set((assessmentsRows.data ?? []).map((r) => r.chapter_id))
    const hasResolution = new Set(
      (artifactsRows.data ?? []).filter((r) => r.type === 'identity_resolution' || r.type === 'proof').map((r) => r.chapter_id)
    )

    const data: ChapterReportMeta[] = chapters.map((ch) => {
      const chapterId = ch.chapter_number as number
      const assessmentAvailable = hasAssessment.has(chapterId)
      const resolutionAvailable = hasResolution.has(chapterId)
      const status: ChapterReportMeta['status'] =
        assessmentAvailable || resolutionAvailable ? 'available' : 'pending'
      return {
        chapterId,
        title: (ch.title as string) ?? `Chapter ${chapterId}`,
        status,
        assessmentAvailable,
        resolutionAvailable,
      }
    })

    return { success: true, data }
  } catch (error) {
    console.error('Error in getChaptersForReports:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// ============================================================================
// FETCH ASSESSMENT REPORT DATA (always scoped to authenticated user)
// ============================================================================

export async function getAssessmentReportData(
  chapterId: number
): Promise<{ success: true; data: AssessmentReportData } | { success: false; error: string }> {
  try {
    const supabase = createAdminClient()
    const userSupabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await userSupabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Try to fetch from assessments table first (new format)
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', user.id)
      .eq('chapter_id', chapterId)
      .eq('kind', 'baseline')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (assessmentError) {
      console.error('Error fetching assessment:', assessmentError)
    }

    // Fallback: Check user_prompt_answers table (legacy format)
    let assessmentFromPrompts = null
    if (!assessment) {
      const { data: promptData } = await supabase
        .from('user_prompt_answers')
        .select('answer')
        .eq('user_id', user.id)
        .eq('prompt_key', `ch${chapterId}_self_check_baseline`)
        .maybeSingle()

      if (promptData?.answer) {
        assessmentFromPrompts = {
          responses: promptData.answer.answers || {},
          score: promptData.answer.totalScore || 0,
          created_at: promptData.answer.completedAt || new Date().toISOString(),
        }
      }
    }

    const finalAssessment = assessment || assessmentFromPrompts

    if (!finalAssessment) {
      return { success: false, error: 'No assessment found for this chapter' }
    }

    const config = getAssessmentConfig(chapterId, `Chapter ${chapterId}`)
    if (!config.questions.length) {
      return { success: false, error: 'No assessment config for this chapter' }
    }

    const questionsWithResponses = config.questions.map((q) => ({
      ...q,
      userResponse: (finalAssessment.responses as Record<number, number>)?.[q.id] ?? 0,
    }))

    const reportData: AssessmentReportData = {
      chapterId,
      chapterTitle: config.chapterTitle,
      assessmentType: 'Self-Check (Baseline)',
      score: finalAssessment.score ?? 0,
      maxScore: config.maxScore,
      completedAt: finalAssessment.created_at,
      questions: questionsWithResponses,
    }

    return { success: true, data: reportData }
  } catch (error) {
    console.error('Error in getAssessmentReportData:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// ============================================================================
// FETCH RESOLUTION REPORT DATA (always scoped to authenticated user)
// ============================================================================

export async function getResolutionReportData(
  chapterId: number
): Promise<{ success: true; data: ResolutionReportData } | { success: false; error: string }> {
  try {
    const supabase = createAdminClient()
    const userSupabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await userSupabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Fetch identity resolution
    const { data: identityArtifact, error: identityError } = await supabase
      .from('artifacts')
      .select('*')
      .eq('user_id', user.id)
      .eq('chapter_id', chapterId)
      .eq('type', 'identity_resolution')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (identityError) {
      console.error('Error fetching identity resolution:', identityError)
    }

    // Fetch all proofs
    const { data: proofArtifacts, error: proofsError } = await supabase
      .from('artifacts')
      .select('*')
      .eq('user_id', user.id)
      .eq('chapter_id', chapterId)
      .eq('type', 'proof')
      .order('created_at', { ascending: true })

    if (proofsError) {
      console.error('Error fetching proofs:', proofsError)
      return { success: false, error: 'Failed to fetch proof data' }
    }

    const proofs =
      proofArtifacts?.map((artifact) => ({
        type: artifact.data.type || 'text',
        title: artifact.data.title || '',
        notes: artifact.data.notes || '',
        storagePath: artifact.data.storage_path,
        createdAt: artifact.created_at,
      })) ?? []

    // Fetch Your Turn responses from BOTH artifacts AND user_prompt_answers
    // Artifacts: type='your_turn_response'
    // user_prompt_answers: keys like ch1_spark_s_pattern, ch1_technique_1_substitution, ch1_followthrough_1_pick_one
    
    const { data: yourTurnArtifacts } = await supabase
      .from('artifacts')
      .select('id, data, created_at')
      .eq('user_id', user.id)
      .eq('chapter_id', chapterId)
      .eq('type', 'your_turn_response')
      .order('created_at', { ascending: true })

    const framework: YourTurnQandA[] = []
    const techniques: YourTurnQandA[] = []
    const followThrough: YourTurnQandA[] = []

    // Process artifacts (if any)
    const prefix = `ch${chapterId}_`
    for (const row of yourTurnArtifacts ?? []) {
      const d = row.data as Record<string, unknown>
      const promptKey = String(d.promptKey ?? '')
      const item: YourTurnQandA = {
        promptText: d.promptText != null ? String(d.promptText) : null,
        responseText: String(d.responseText ?? ''),
        createdAt: row.created_at ?? '',
      }
      if (promptKey.startsWith(`${prefix}framework_`)) framework.push(item)
      else if (promptKey.startsWith(`${prefix}technique_`)) techniques.push(item)
      else if (promptKey.startsWith(`${prefix}followthrough_`)) followThrough.push(item)
    }

    // Fallback: Check user_prompt_answers for Your Turn data (keys like ch1_spark_s_pattern, ch1_technique_1_substitution)
    const { data: promptAnswers } = await supabase
      .from('user_prompt_answers')
      .select('prompt_key, answer, created_at')
      .eq('user_id', user.id)
      .eq('chapter_id', chapterId)

    for (const row of promptAnswers ?? []) {
      const promptKey = row.prompt_key
      const answer = row.answer
      const answerText = typeof answer === 'string' ? answer : JSON.stringify(answer)
      
      // Skip self-check (that's handled separately)
      if (promptKey.includes('self_check')) continue
      
      const item: YourTurnQandA = {
        promptText: null, // Prompt text not stored in user_prompt_answers
        responseText: answerText,
        createdAt: row.created_at ?? '',
      }

      // Categorize by key pattern
      if (promptKey.includes('spark_') || promptKey.includes('framework_') || promptKey.includes('voice_')) {
        framework.push(item)
      } else if (promptKey.includes('technique_')) {
        techniques.push(item)
      } else if (promptKey.includes('followthrough_')) {
        followThrough.push(item)
      }
    }

    const chapterTitle = ASSESSMENT_CONFIG[chapterId]?.chapterTitle ?? `Chapter ${chapterId}`

    const reportData: ResolutionReportData = {
      chapterId,
      chapterTitle,
      completedAt: proofArtifacts?.[0]?.created_at ?? new Date().toISOString(),
      identityResolution: identityArtifact?.data?.identity,
      proofs,
      yourTurnByCategory: { framework, techniques, followThrough },
    }

    return { success: true, data: reportData }
  } catch (error) {
    console.error('Error in getResolutionReportData:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// ============================================================================
// GET USER INFO
// ============================================================================

export async function getUserInfo(): Promise<
  { success: true; data: { name: string; email: string; id: string } } | { success: false; error: string }
> {
  try {
    const userSupabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await userSupabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    return {
      success: true,
      data: {
        id: user.id,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
      },
    }
  } catch (error) {
    console.error('Error in getUserInfo:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
