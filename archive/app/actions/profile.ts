import { createClient } from '@/lib/supabase/server'
import { getStudentXP } from './xp'

/**
 * Get assessment scores (pre and post) for a student
 */
export async function getAssessmentScores(studentId: string) {
  const supabase = await createClient()

  // Get all completed phases with responses
  const { data: progressRecords, error } = await supabase
    .from('student_progress')
    .select(`
      *,
      phase:phases (
        phase_type,
        phase_number
      )
    `)
    .eq('student_id', studentId)
    .not('completed_at', 'is', null)
    .not('responses', 'is', null)

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('getAssessmentScores error:', error)
    }
    return { preAssessment: null, postAssessment: null }
  }

  // Calculate pre-assessment scores (from power-scan phases)
  const powerScanRecords = (progressRecords || []).filter(
    (record: any) => record.phase?.phase_type === 'power-scan'
  )

  const preScores: number[] = []
  powerScanRecords.forEach((record: any) => {
    const responses = record.responses || {}
    const answers = responses.answers || []
    if (Array.isArray(answers) && answers.length > 0) {
      const scores = answers.map((a: any) => a.answer || 0).filter((s: number) => s > 0)
      if (scores.length > 0) {
        const avgScore = scores.reduce((a: number, b: number) => a + b, 0) / scores.length
        preScores.push(avgScore)
      }
    }
  })

  // Calculate post-assessment scores (from level-up phases)
  const levelUpRecords = (progressRecords || []).filter(
    (record: any) => record.phase?.phase_type === 'level-up'
  )

  const postScores: number[] = []
  levelUpRecords.forEach((record: any) => {
    const responses = record.responses || {}
    const answers = responses.answers || []
    if (Array.isArray(answers) && answers.length > 0) {
      const scores = answers.map((a: any) => a.answer || 0).filter((s: number) => s > 0)
      if (scores.length > 0) {
        const avgScore = scores.reduce((a: number, b: number) => a + b, 0) / scores.length
        postScores.push(avgScore)
      }
    }
  })

  const preAssessment = preScores.length > 0
    ? preScores.reduce((a, b) => a + b, 0) / preScores.length
    : null

  const postAssessment = postScores.length > 0
    ? postScores.reduce((a, b) => a + b, 0) / postScores.length
    : null

  return { preAssessment, postAssessment }
}

/**
 * Get badges earned by student
 */
export async function getStudentBadges(studentId: string) {
  const supabase = await createClient()

  // Get completed phases, chapters, and zones
  const { data: progressRecords, error } = await supabase
    .from('student_progress')
    .select(`
      phase:phases (
        phase_type,
        phase_number,
        chapter:chapters (
          chapter_number,
          zone:zones (
            zone_number
          )
        )
      )
    `)
    .eq('student_id', studentId)
    .not('completed_at', 'is', null)

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('getStudentBadges error:', error)
    }
    return []
  }

  const badges: Array<{ id: string; name: string; icon: string; earned: boolean }> = []

  // Count completed items
  const completedPhases = (progressRecords || []).length
  const completedChapters = new Set(
    (progressRecords || [])
      .map((r: any) => {
        const chapter = Array.isArray(r.phase?.chapter) ? r.phase.chapter[0] : r.phase?.chapter
        return chapter?.id
      })
      .filter(Boolean)
  ).size
  const completedZones = new Set(
    (progressRecords || [])
      .map((r: any) => {
        const chapter = Array.isArray(r.phase?.chapter) ? r.phase.chapter[0] : r.phase?.chapter
        const zone = Array.isArray(chapter?.zone) ? chapter.zone[0] : chapter?.zone
        return zone?.id
      })
      .filter(Boolean)
  ).size

  // Define badges
  badges.push({
    id: 'first-step',
    name: 'THE FIRST STEP',
    icon: '🎯',
    earned: completedPhases >= 1
  })

  badges.push({
    id: 'first-mission',
    name: 'MISSION #1: THE FIRST FRAME',
    icon: '🎬',
    earned: completedChapters >= 1
  })

  badges.push({
    id: 'first-zone',
    name: 'ZONE #1 COMPLETE',
    icon: '🏆',
    earned: completedZones >= 1
  })

  badges.push({
    id: 'five-phases',
    name: '5 PHASES COMPLETE',
    icon: '⭐',
    earned: completedPhases >= 5
  })

  badges.push({
    id: 'ten-phases',
    name: '10 PHASES COMPLETE',
    icon: '🌟',
    earned: completedPhases >= 10
  })

  badges.push({
    id: 'fear-alchemist',
    name: 'FEAR ALCHEMIST',
    icon: '🔥',
    earned: completedPhases >= 3
  })

  badges.push({
    id: 'energy-builder',
    name: 'ENERGY BUILDER',
    icon: '⚡',
    earned: completedPhases >= 7
  })

  badges.push({
    id: 'team-leader',
    name: 'TEAM LEADER BUILDER',
    icon: '👥',
    earned: completedChapters >= 5
  })

  return badges
}
