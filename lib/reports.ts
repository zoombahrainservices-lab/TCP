'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export interface PhaseReport {
  phaseId: number
  phaseType: string
  phaseNumber: number
  chapterTitle: string
  chapterNumber: number
  zoneNumber: number
  zoneName: string
  responses: any
  reflectionText: string | null
  completedAt: string
  beforeScore: number | null
  afterScore: number | null
}

export interface StudentReport {
  studentId: string
  studentName: string
  completedPhases: number
  totalPhases: number
  completedChapters: number
  totalChapters: number
  completedZones: number
  totalZones: number
  completionPercentage: number
  phases: PhaseReport[]
  summary: {
    averageBeforeScore: number
    averageAfterScore: number
    averageImprovement: number
    totalReflections: number
  }
}

/**
 * Build comprehensive report for a student
 */
export async function buildStudentReport(studentId: string): Promise<StudentReport> {
  const adminClient = createAdminClient()

  // Get student profile
  const { data: student } = await adminClient
    .from('profiles')
    .select('full_name')
    .eq('id', studentId)
    .single()

  // Get all completed progress with phase/chapter/zone details
  const { data: progressRecords } = await adminClient
    .from('student_progress')
    .select(`
      *,
      phase:phases (
        id,
        phase_number,
        phase_type,
        chapter:chapters (
          id,
          title,
          chapter_number,
          zone:zones (
            id,
            zone_number,
            name
          )
        )
      )
    `)
    .eq('student_id', studentId)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: true })

  const phases: PhaseReport[] = (progressRecords || []).map((record: any) => {
    const phase = record.phase
    const chapter = phase?.chapter
    const zone = Array.isArray(chapter?.zone) ? chapter.zone[0] : chapter?.zone

    // Calculate scores if available
    const responses = record.responses || {}
    const answers = responses.answers || []
    
    let beforeScore = null
    let afterScore = null
    
    if (Array.isArray(answers) && answers.length > 0) {
      const scores = answers.map((a: any) => a.answer || 0)
      const avgScore = scores.reduce((a: number, b: number) => a + b, 0) / scores.length
      
      // For power-scan (before) vs level-up (after)
      if (phase?.phase_type === 'power-scan') {
        beforeScore = avgScore
      } else if (phase?.phase_type === 'level-up') {
        afterScore = avgScore
      }
    }

    return {
      phaseId: phase?.id || 0,
      phaseType: phase?.phase_type || '',
      phaseNumber: phase?.phase_number || 0,
      chapterTitle: chapter?.title || '',
      chapterNumber: chapter?.chapter_number || 0,
      zoneNumber: zone?.zone_number || 0,
      zoneName: zone?.name || '',
      responses: record.responses,
      reflectionText: record.reflection_text,
      completedAt: record.completed_at,
      beforeScore,
      afterScore,
    }
  })

  // Calculate summary statistics
  const beforeScores = phases.filter(p => p.beforeScore !== null).map(p => p.beforeScore!)
  const afterScores = phases.filter(p => p.afterScore !== null).map(p => p.afterScore!)
  const totalReflections = phases.filter(p => p.reflectionText).length

  const averageBeforeScore = beforeScores.length > 0
    ? beforeScores.reduce((a, b) => a + b, 0) / beforeScores.length
    : 0

  const averageAfterScore = afterScores.length > 0
    ? afterScores.reduce((a, b) => a + b, 0) / afterScores.length
    : 0

  const averageImprovement = averageAfterScore - averageBeforeScore

  // Calculate completion counts
  const completedPhases = phases.length
  const totalPhases = 150

  // Count unique completed chapters
  const completedChapterIds = new Set(
    phases.map(p => `${p.zoneNumber}-${p.chapterNumber}`)
  )
  const completedChapters = completedChapterIds.size
  const totalChapters = 30

  // Count completed zones (all chapters in zone must be complete)
  const chaptersByZone: Record<number, Set<number>> = {}
  phases.forEach(p => {
    if (!chaptersByZone[p.zoneNumber]) {
      chaptersByZone[p.zoneNumber] = new Set()
    }
    chaptersByZone[p.zoneNumber].add(p.chapterNumber)
  })

  const chaptersPerZone = [7, 7, 7, 7, 2] // Zone 1-4: 7 chapters, Zone 5: 2 chapters
  let completedZones = 0
  for (let zoneNum = 1; zoneNum <= 5; zoneNum++) {
    const chaptersInZone = chaptersByZone[zoneNum]?.size || 0
    if (chaptersInZone === chaptersPerZone[zoneNum - 1]) {
      completedZones++
    }
  }

  const completionPercentage = Math.round((completedPhases / totalPhases) * 100)

  return {
    studentId,
    studentName: student?.full_name || 'Student',
    completedPhases,
    totalPhases,
    completedChapters,
    totalChapters,
    completedZones,
    totalZones: 5,
    completionPercentage,
    phases,
    summary: {
      averageBeforeScore,
      averageAfterScore,
      averageImprovement,
      totalReflections,
    },
  }
}

/**
 * Get report for a specific zone
 */
export async function buildZoneReport(studentId: string, zoneId: number) {
  const adminClient = createAdminClient()

  const { data: progressRecords } = await adminClient
    .from('student_progress')
    .select(`
      *,
      phase:phases (
        *,
        chapter:chapters!inner (
          *,
          zone:zones!inner (*)
        )
      )
    `)
    .eq('student_id', studentId)
    .eq('zone_id', zoneId)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: true })

  return progressRecords || []
}

/**
 * Get report for a specific chapter
 */
export async function buildChapterReport(studentId: string, chapterId: number) {
  const adminClient = createAdminClient()

  const { data: progressRecords } = await adminClient
    .from('student_progress')
    .select(`
      *,
      phase:phases (
        *
      ),
      uploads:phase_uploads (*)
    `)
    .eq('student_id', studentId)
    .eq('chapter_id', chapterId)
    .order('phase:phase_number', { ascending: true })

  return progressRecords || []
}
