'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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

    // Fetch the latest assessment for this chapter
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
      return { success: false, error: 'Failed to fetch assessment data' }
    }

    if (!assessment) {
      return { success: false, error: 'No assessment found for this chapter' }
    }

    // Define questions (these should match your assessment page)
    const questions = [
      { id: 1, question: 'How often I grab phone when working', low: 'Rarely', high: 'Constantly' },
      { id: 2, question: "Remember yesterday's scrolling", low: 'Yes', high: 'Barely' },
      { id: 3, question: 'Feel after phone session', low: 'Energized', high: 'Empty' },
      { id: 4, question: 'Time on passion this year', low: 'More', high: 'Abandoned' },
      { id: 5, question: 'Time before phone urge', low: '30+ min', high: 'Under 5' },
      { id: 6, question: 'Use phone to avoid feelings', low: 'Rarely', high: 'Always' },
      { id: 7, question: 'Phone vanished 24hrs', low: 'Relieved', high: 'Panicked' },
    ]

    // Map responses to questions
    const questionsWithResponses = questions.map((q) => ({
      ...q,
      userResponse: assessment.responses[q.id] ?? 0,
    }))

    const reportData: AssessmentReportData = {
      chapterId,
      chapterTitle: 'Chapter 1: From Stage Star to Silent Struggles',
      assessmentType: 'Self-Check (Baseline)',
      score: assessment.score ?? 0,
      maxScore: 49, // 7 questions * 7 points each
      completedAt: assessment.created_at,
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

    const reportData: ResolutionReportData = {
      chapterId,
      chapterTitle: 'Chapter 1: From Stage Star to Silent Struggles',
      completedAt: proofArtifacts?.[0]?.created_at ?? new Date().toISOString(),
      identityResolution: identityArtifact?.data?.identity,
      proofs,
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
