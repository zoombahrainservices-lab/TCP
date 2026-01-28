'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export interface ReviewSubmission {
  id: number
  student_id: string
  student_name: string
  day_number: number
  chapter_title: string
  completed_at: string
  reviewed_at: string | null
}

/**
 * Submit a review for a completed day
 */
export async function submitReview(
  dayRecordId: number,
  reviewerId: string,
  feedback: string
): Promise<{ success: boolean; error?: string }> {
  const adminClient = createAdminClient()

  // Verify reviewer role
  const { data: reviewer } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', reviewerId)
    .single()

  if (!reviewer || !['parent', 'mentor', 'admin'].includes(reviewer.role)) {
    return { success: false, error: 'Unauthorized: Only parents, mentors, and admins can review' }
  }

  // Get the daily record to verify access
  const { data: record } = await adminClient
    .from('daily_records')
    .select('student_id, completed')
    .eq('id', dayRecordId)
    .single()

  if (!record) {
    return { success: false, error: 'Record not found' }
  }

  if (!record.completed) {
    return { success: false, error: 'Cannot review incomplete submission' }
  }

  // Verify reviewer has access to this student
  if (reviewer.role === 'parent' || reviewer.role === 'mentor') {
    const { data: link } = await adminClient
      .from('parent_child_links')
      .select('id')
      .eq('parent_id', reviewerId)
      .eq('child_id', record.student_id)
      .maybeSingle()

    if (!link) {
      return { success: false, error: 'Access denied: You do not have access to this student' }
    }
  }

  // Submit review
  const { error } = await adminClient
    .from('daily_records')
    .update({
      reviewed_at: new Date().toISOString(),
      review_feedback: feedback,
    })
    .eq('id', dayRecordId)

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('submitReview error:', error)
    }
    return { success: false, error: 'Failed to submit review' }
  }

  revalidatePath('/parent')
  revalidatePath('/mentor')
  return { success: true }
}

/**
 * Get reviewable submissions for a reviewer (parent/mentor)
 */
export async function getReviewableSubmissions(
  reviewerId: string
): Promise<ReviewSubmission[]> {
  const adminClient = createAdminClient()

  // Get reviewer's children
  const { data: links } = await adminClient
    .from('parent_child_links')
    .select('child_id')
    .eq('parent_id', reviewerId)

  if (!links || links.length === 0) {
    return []
  }

  const childIds = links.map(l => l.child_id)

  // Get completed but unreviewed records
  const { data: records } = await adminClient
    .from('daily_records')
    .select(`
      id,
      student_id,
      day_number,
      updated_at,
      reviewed_at,
      chapter_id
    `)
    .in('student_id', childIds)
    .eq('completed', true)
    .order('updated_at', { ascending: false })

  if (!records) {
    return []
  }

  // Get student names and chapter titles
  const submissions: ReviewSubmission[] = await Promise.all(
    records.map(async (record) => {
      const { data: student } = await adminClient
        .from('profiles')
        .select('full_name')
        .eq('id', record.student_id)
        .single()

      const { data: chapter } = await adminClient
        .from('chapters')
        .select('title')
        .eq('id', record.chapter_id)
        .single()

      return {
        id: record.id,
        student_id: record.student_id,
        student_name: student?.full_name || 'Unknown',
        day_number: record.day_number,
        chapter_title: chapter?.title || `Day ${record.day_number}`,
        completed_at: record.updated_at,
        reviewed_at: record.reviewed_at,
      }
    })
  )

  return submissions
}

/**
 * Get review status for a specific day record
 */
export async function getReviewStatus(dayRecordId: number) {
  const adminClient = createAdminClient()

  const { data: record } = await adminClient
    .from('daily_records')
    .select('reviewed_at, review_feedback')
    .eq('id', dayRecordId)
    .single()

  return record
}
