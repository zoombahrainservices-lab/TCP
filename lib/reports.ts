import { createAdminClient } from '@/lib/supabase/admin'

export interface ProgramReport {
  childId: string
  childName: string
  baseline: {
    responses: any
    completedAt: string
  } | null
  summary: {
    completionPercentage: number
    completedDays: number
    totalDays: number
    averageBeforeScore: number
    averageAfterScore: number
    scoreImprovement: number
    onTimeSubmissionRate: number
    reviewedDaysCount: number
    reviewRate: number
  }
  dailyProgress: Array<{
    dayNumber: number
    title: string
    completed: boolean
    completedAt: string | null
    beforeScore: number | null
    afterScore: number | null
    scoreImprovement: number | null
    reflection: string | null
    uploadsCount: number
    reviewed: boolean
    reviewFeedback: string | null
    reviewedAt: string | null
    taskAcknowledgedAt: string | null
    taskDueAt: string | null
    proofUploadedAt: string | null
    submittedOnTime: boolean | null
  }>
}

/**
 * Build a comprehensive program report for a child
 */
export async function buildChildProgramReport(childId: string): Promise<ProgramReport> {
  const adminClient = createAdminClient()

  // 1. Fetch baseline
  const { data: baseline } = await adminClient
    .from('program_baselines')
    .select('responses, created_at')
    .eq('student_id', childId)
    .maybeSingle()

  // 2. Fetch child profile
  const { data: profile } = await adminClient
    .from('profiles')
    .select('full_name')
    .eq('id', childId)
    .single()

  // 3. Fetch all daily records with timestamps, answers, reflection, uploads
  const { data: records } = await adminClient
    .from('daily_records')
    .select(`
      *,
      uploads (*)
    `)
    .eq('student_id', childId)
    .order('day_number', { ascending: true })

  // 4. Fetch all chapters
  const { data: chapters } = await adminClient
    .from('chapters')
    .select('day_number, title')
    .order('day_number', { ascending: true })

  // 5. Calculate metrics
  const completedRecords = records?.filter(r => r.completed) || []
  const completedDays = completedRecords.length
  const totalDays = 30

  // Calculate average scores
  let totalBeforeScore = 0
  let totalAfterScore = 0
  let scoreCount = 0

  completedRecords.forEach(record => {
    if (record.before_answers && record.before_answers.length > 0) {
      const beforeAvg = record.before_answers.reduce((sum: number, a: any) => sum + (a.answer || 0), 0) / record.before_answers.length
      totalBeforeScore += beforeAvg
    }
    if (record.after_answers && record.after_answers.length > 0) {
      const afterAvg = record.after_answers.reduce((sum: number, a: any) => sum + (a.answer || 0), 0) / record.after_answers.length
      totalAfterScore += afterAvg
      scoreCount++
    }
  })

  const averageBeforeScore = scoreCount > 0 ? totalBeforeScore / scoreCount : 0
  const averageAfterScore = scoreCount > 0 ? totalAfterScore / scoreCount : 0
  const scoreImprovement = averageAfterScore - averageBeforeScore

  // Calculate on-time submission rate
  const recordsWithDeadlines = completedRecords.filter(r => r.task_due_at && r.proof_uploaded_at)
  const onTimeSubmissions = recordsWithDeadlines.filter(r => {
    const dueDate = new Date(r.task_due_at)
    const uploadedDate = new Date(r.proof_uploaded_at)
    return uploadedDate <= dueDate
  })
  const onTimeSubmissionRate = recordsWithDeadlines.length > 0 
    ? (onTimeSubmissions.length / recordsWithDeadlines.length) * 100 
    : 0

  // Calculate review rate
  const reviewedDaysCount = completedRecords.filter(r => r.reviewed_at).length
  const reviewRate = completedDays > 0 ? (reviewedDaysCount / completedDays) * 100 : 0

  // 6. Build daily progress array
  const dailyProgress = Array.from({ length: 30 }, (_, i) => {
    const dayNumber = i + 1
    const chapter = chapters?.find(c => c.day_number === dayNumber)
    const record = records?.find(r => r.day_number === dayNumber)

    let beforeScore: number | null = null
    let afterScore: number | null = null
    let scoreImprovement: number | null = null

    if (record) {
      if (record.before_answers && record.before_answers.length > 0) {
        beforeScore = record.before_answers.reduce((sum: number, a: any) => sum + (a.answer || 0), 0) / record.before_answers.length
      }
      if (record.after_answers && record.after_answers.length > 0) {
        afterScore = record.after_answers.reduce((sum: number, a: any) => sum + (a.answer || 0), 0) / record.after_answers.length
      }
      if (beforeScore !== null && afterScore !== null) {
        scoreImprovement = afterScore - beforeScore
      }
    }

    let submittedOnTime: boolean | null = null
    if (record?.task_due_at && record?.proof_uploaded_at) {
      const dueDate = new Date(record.task_due_at)
      const uploadedDate = new Date(record.proof_uploaded_at)
      submittedOnTime = uploadedDate <= dueDate
    }

    return {
      dayNumber,
      title: chapter?.title || `Day ${dayNumber}`,
      completed: record?.completed || false,
      completedAt: record?.updated_at || null,
      beforeScore,
      afterScore,
      scoreImprovement,
      reflection: record?.reflection_text || null,
      uploadsCount: record?.uploads?.length || 0,
      reviewed: !!record?.reviewed_at,
      reviewFeedback: record?.review_feedback || null,
      reviewedAt: record?.reviewed_at || null,
      taskAcknowledgedAt: record?.task_acknowledged_at || null,
      taskDueAt: record?.task_due_at || null,
      proofUploadedAt: record?.proof_uploaded_at || null,
      submittedOnTime,
    }
  })

  return {
    childId,
    childName: profile?.full_name || 'Student',
    baseline: baseline ? {
      responses: baseline.responses,
      completedAt: baseline.created_at
    } : null,
    summary: {
      completionPercentage: Math.round((completedDays / totalDays) * 100),
      completedDays,
      totalDays,
      averageBeforeScore: Math.round(averageBeforeScore * 10) / 10,
      averageAfterScore: Math.round(averageAfterScore * 10) / 10,
      scoreImprovement: Math.round(scoreImprovement * 10) / 10,
      onTimeSubmissionRate: Math.round(onTimeSubmissionRate),
      reviewedDaysCount,
      reviewRate: Math.round(reviewRate),
    },
    dailyProgress,
  }
}
