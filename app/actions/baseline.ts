'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/auth/guards'

export interface BaselineData {
  id: string
  student_id: string
  responses: any
  created_at: string
}

export interface FoundationData {
  id: string
  student_id: string
  responses: {
    q1: number
    q2: number
    q3: number
    q4: number
    q5: number
    q6: number
    q7: number
  }
  self_check_score: number
  score_band: 'good' | 'danger_zone' | 'tom_start' | 'counselor'
  identity_statement: string | null
  chosen_action: 'identity' | 'accountability_text' | 'delete_app' | null
  accountability_person: string | null
  created_at: string
  updated_at: string
}

export type BaselineInput = {
  responses: {
    q1: number
    q2: number
    q3: number
    q4: number
    q5: number
    q6: number
    q7: number
  }
  identityStatement?: string
  chosenAction?: 'identity' | 'accountability_text' | 'delete_app'
  accountabilityPerson?: string
}

/**
 * Check if a student has completed their program baseline
 */
export async function hasProgramBaseline(studentId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('program_baselines')
    .select('id')
    .eq('student_id', studentId)
    .maybeSingle()

  if (error) {
    console.error('hasProgramBaseline error:', error)
    return false
  }

  return !!data
}

/**
 * Calculate score band from self-check score
 */
function calculateScoreBand(score: number): 'good' | 'danger_zone' | 'tom_start' | 'counselor' {
  if (score >= 7 && score <= 14) return 'good'
  if (score >= 15 && score <= 28) return 'danger_zone'
  if (score >= 29 && score <= 42) return 'tom_start'
  if (score >= 43 && score <= 49) return 'counselor'
  // Fallback for out-of-range scores
  return score < 15 ? 'good' : 'counselor'
}

/**
 * Submit or update Foundation (program baseline with full Foundation data)
 */
export async function submitProgramBaseline(
  studentId: string,
  input: BaselineInput
): Promise<{ success: boolean; error?: string; scoreBand?: string; score?: number }> {
  const supabase = await createClient()

  // Validate responses
  const { responses, identityStatement, chosenAction, accountabilityPerson } = input

  if (!responses || typeof responses !== 'object') {
    return { success: false, error: 'Invalid responses format' }
  }

  // Validate all 7 questions are answered
  const requiredQuestions = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7']
  for (const q of requiredQuestions) {
    if (!responses[q] || responses[q] < 1 || responses[q] > 7) {
      return { success: false, error: `Invalid response for ${q}. Must be 1-7.` }
    }
  }

  // Calculate self-check score (sum of all 7 questions)
  const selfCheckScore = responses.q1 + responses.q2 + responses.q3 + responses.q4 + 
                         responses.q5 + responses.q6 + responses.q7

  // Calculate score band
  const scoreBand = calculateScoreBand(selfCheckScore)

  // Upsert baseline (update if exists, insert if not)
  const { error } = await supabase
    .from('program_baselines')
    .upsert({
      student_id: studentId,
      responses: responses,
      self_check_score: selfCheckScore,
      score_band: scoreBand,
      identity_statement: identityStatement || null,
      chosen_action: chosenAction || null,
      accountability_person: accountabilityPerson || null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'student_id'
    })

  if (error) {
    console.error('submitProgramBaseline error:', error)
    return { success: false, error: 'Failed to save Foundation data' }
  }

  return { success: true, scoreBand, score: selfCheckScore }
}

/**
 * Get program baseline data for a student
 */
export async function getProgramBaseline(
  studentId: string
): Promise<BaselineData | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('program_baselines')
    .select('*')
    .eq('student_id', studentId)
    .maybeSingle()

  if (error) {
    console.error('getProgramBaseline error:', error)
    return null
  }

  return data
}

/**
 * Get authenticated student's Foundation data
 */
export async function getMyFoundation(): Promise<FoundationData | null> {
  const user = await requireAuth('student')
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('program_baselines')
    .select('*')
    .eq('student_id', user.id)
    .maybeSingle()

  if (error) {
    console.error('getMyFoundation error:', error)
    return null
  }

  return data as FoundationData | null
}

/**
 * Get Foundation data for any student (admin/parent access)
 */
export async function getStudentFoundation(studentId: string): Promise<FoundationData | null> {
  const adminClient = createAdminClient()

  const { data, error } = await adminClient
    .from('program_baselines')
    .select('*')
    .eq('student_id', studentId)
    .maybeSingle()

  if (error) {
    console.error('getStudentFoundation error:', error)
    return null
  }

  return data as FoundationData | null
}

/**
 * Admin function to get all baselines (for analytics)
 */
export async function getAllBaselines(): Promise<BaselineData[]> {
  const adminClient = createAdminClient()

  const { data, error } = await adminClient
    .from('program_baselines')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getAllBaselines error:', error)
    return []
  }

  return data || []
}
