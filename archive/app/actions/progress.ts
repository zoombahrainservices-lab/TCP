'use server'

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getAllZoneProgress, type ZoneProgress } from './zones'
import { 
  computeUnlockStates, 
  findCurrentMission, 
  getProgressStats,
  type PhaseNode 
} from '@/lib/progress'

export interface StudentOverallProgress {
  zones: ZoneProgress[]
  currentZone: number | null
  currentChapter: number | null
  currentPhase: number | null
  currentPhaseId: number | null
  totalZones: number
  totalChapters: number
  totalPhases: number
  completedZones: number
  completedChapters: number
  completedPhases: number
  completionPercentage: number
  suggestedZoneId: number | null
  suggestedChapterId: number | null
  suggestedPhaseId: number | null
}

/**
 * Get comprehensive student progress across all zones, chapters, and phases
 * Uses pure helper functions for consistent unlock logic
 * Cached to prevent redundant fetches within the same request
 */
export const getStudentProgress = cache(async (studentId: string): Promise<StudentOverallProgress> => {
  const supabase = await createClient()

  // 1. Fetch ALL phases with zone/chapter info in one efficient query
  const { data: allPhasesData, error: phasesError } = await supabase
    .from('phases')
    .select(`
      id,
      phase_number,
      chapter_id,
      chapter:chapters!inner (
        id,
        chapter_number,
        zone_id,
        zone:zones!inner (
          id,
          zone_number
        )
      )
    `)

  if (phasesError || !allPhasesData) {
    if (process.env.NODE_ENV === 'development') {
      console.error('getStudentProgress - phases error:', phasesError)
    }
    throw new Error('Failed to fetch phases')
  }

  // 2. Fetch student's completed phases
  const { data: completedProgress, error: progressError } = await supabase
    .from('student_progress')
    .select('phase_id')
    .eq('student_id', studentId)
    .not('completed_at', 'is', null)

  if (progressError) {
    if (process.env.NODE_ENV === 'development') {
      console.error('getStudentProgress - progress error:', progressError)
    }
  }

  const completedPhaseIds = new Set(completedProgress?.map(p => p.phase_id) || [])

  // 3. Transform to PhaseNode format for helper functions
  const phaseNodes: PhaseNode[] = allPhasesData.map((p: any) => {
    const chapter = Array.isArray(p.chapter) ? p.chapter[0] : p.chapter
    const zone = Array.isArray(chapter.zone) ? chapter.zone[0] : chapter.zone
    
    return {
      id: p.id,
      phaseNumber: p.phase_number,
      chapterId: chapter.id,
      chapterNumber: chapter.chapter_number,
      zoneId: zone.id,
      zoneNumber: zone.zone_number,
    }
  })

  // 4. Use pure helper functions to compute unlock states
  const unlockMap = computeUnlockStates(phaseNodes, completedPhaseIds)
  const currentMission = findCurrentMission(phaseNodes, unlockMap)
  const stats = getProgressStats(phaseNodes, unlockMap)

  // 5. Get zone progress for UI display
  const zones = await getAllZoneProgress(studentId)

  // 6. Extract current mission details
  const currentZone = currentMission?.zoneNumber || null
  const currentChapter = currentMission?.chapterNumber || null
  const currentPhase = currentMission?.phaseNumber || null
  const suggestedZoneId = currentMission?.zoneId || null
  const suggestedChapterId = currentMission?.chapterId || null
  const suggestedPhaseId = currentMission?.id || null
  const currentPhaseId = currentMission?.id || null

  return {
    zones,
    currentZone,
    currentChapter,
    currentPhase,
    currentPhaseId,
    totalZones: stats.totalZones,
    totalChapters: stats.totalChapters,
    totalPhases: stats.totalPhases,
    completedZones: stats.completedZones,
    completedChapters: stats.completedChapters,
    completedPhases: stats.completedPhases,
    completionPercentage: stats.completionPercentage,
    suggestedZoneId,
    suggestedChapterId,
    suggestedPhaseId,
  }
})

/**
 * Get lightweight progress summary (for dashboards/lists)
 */
export async function getStudentProgressSummary(studentId: string): Promise<{
  completedPhases: number
  totalPhases: number
  completionPercentage: number
  currentZone: number | null
  currentChapter: number | null
}> {
  const supabase = await createClient()

  // Count completed phases
  const { count: completedPhases } = await supabase
    .from('student_progress')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', studentId)
    .not('completed_at', 'is', null)

  const totalPhases = 150

  // Get current position (first incomplete phase)
  const { data: incompleteProgress } = await supabase
    .from('student_progress')
    .select(`
      phase:phases (
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
    .is('completed_at', null)
    .order('started_at', { ascending: true })
    .limit(1)
    .single()

  let currentZone: number | null = null
  let currentChapter: number | null = null

  if (incompleteProgress && incompleteProgress.phase) {
    const phase = incompleteProgress.phase as any
    if (phase.chapter && phase.chapter.zone) {
      currentZone = Array.isArray(phase.chapter.zone) 
        ? phase.chapter.zone[0].zone_number 
        : phase.chapter.zone.zone_number
      currentChapter = phase.chapter.chapter_number
    }
  }

  const completionPercentage = Math.round(((completedPhases || 0) / totalPhases) * 100)

  return {
    completedPhases: completedPhases || 0,
    totalPhases,
    completionPercentage,
    currentZone,
    currentChapter,
  }
}

/**
 * Get all student progress records (for analytics/reports)
 */
export async function getAllStudentProgressRecords(studentId: string) {
  const supabase = await createClient()

  const { data: records, error } = await supabase
    .from('student_progress')
    .select(`
      *,
      phase:phases (
        *,
        chapter:chapters (
          *,
          zone:zones (
            *
          )
        )
      ),
      uploads:phase_uploads (*)
    `)
    .eq('student_id', studentId)
    .order('created_at', { ascending: true })

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('getAllStudentProgressRecords error:', error)
    }
    return []
  }

  return records || []
}

/**
 * Check if student has any progress
 */
export async function hasProgress(studentId: string): Promise<boolean> {
  const supabase = await createClient()

  const { count } = await supabase
    .from('student_progress')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', studentId)

  return (count || 0) > 0
}
