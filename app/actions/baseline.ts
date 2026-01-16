'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export interface BaselineData {
  id: string
  student_id: string
  responses: any
  created_at: string
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
 * Submit program baseline assessment
 */
export async function submitProgramBaseline(
  studentId: string, 
  responses: any
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Validate responses
  if (!responses || typeof responses !== 'object') {
    return { success: false, error: 'Invalid responses format' }
  }

  // Check if baseline already exists
  const exists = await hasProgramBaseline(studentId)
  if (exists) {
    return { success: false, error: 'Baseline already completed' }
  }

  // Insert baseline
  const { error } = await supabase
    .from('program_baselines')
    .insert({
      student_id: studentId,
      responses: responses,
    })

  if (error) {
    console.error('submitProgramBaseline error:', error)
    return { success: false, error: 'Failed to save baseline' }
  }

  return { success: true }
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
