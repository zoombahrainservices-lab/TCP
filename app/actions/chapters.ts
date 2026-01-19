'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export interface Chapter {
  id: number
  zone_id: number
  chapter_number: number
  title: string
  subtitle: string | null
  content: string
  task_description: string
  before_questions: any
  after_questions: any
  task_deadline_hours: number
  chunks: any
  legacy_day_number: number | null
  created_at: string
  updated_at: string
}

export interface ChapterWithZone extends Chapter {
  zone: {
    id: number
    zone_number: number
    name: string
    icon: string | null
    color: string | null
  }
}

export interface ChapterProgress {
  chapter: ChapterWithZone
  totalPhases: number
  completedPhases: number
  currentPhase: number | null
  isUnlocked: boolean
  completionPercentage: number
}

/**
 * Get all chapters for a zone
 */
export async function getChaptersByZone(zoneId: number): Promise<ChapterWithZone[]> {
  const supabase = await createClient()

  // Get chapters
  const { data: chapters, error: chaptersError } = await supabase
    .from('chapters')
    .select('*')
    .eq('zone_id', zoneId)
    .order('chapter_number', { ascending: true })

  if (chaptersError) {
    console.error('getChaptersByZone error:', chaptersError.message)
    throw new Error('Failed to fetch chapters')
  }

  if (!chapters || chapters.length === 0) {
    return []
  }

  // Get zone info
  const { data: zone, error: zoneError } = await supabase
    .from('zones')
    .select('id, zone_number, name, icon, color')
    .eq('id', zoneId)
    .single()

  if (zoneError || !zone) {
    console.error('getChaptersByZone zone error:', zoneError?.message || 'Zone not found')
    throw new Error('Failed to fetch zone information')
  }

  // Map chapters with zone info
  return chapters.map(c => ({
    ...c,
    zone: zone
  })) as ChapterWithZone[]
}

/**
 * Get a single chapter by ID
 */
export async function getChapter(chapterId: number): Promise<ChapterWithZone | null> {
  const supabase = await createClient()

  // First, get the chapter
  const { data: chapter, error: chapterError } = await supabase
    .from('chapters')
    .select('*')
    .eq('id', chapterId)
    .single()

  if (chapterError || !chapter) {
    console.error('getChapter error:', chapterError?.message || 'Chapter not found', { chapterError, chapterId })
    return null
  }

  // If no zone_id, return without zone info (for backward compatibility)
  if (!chapter.zone_id) {
    return {
      ...chapter,
      zone: {
        id: 0,
        zone_number: 0,
        name: 'Unknown Zone',
        icon: null,
        color: null,
      }
    } as ChapterWithZone
  }

  // Get the zone separately
  const { data: zone, error: zoneError } = await supabase
    .from('zones')
    .select('id, zone_number, name, icon, color')
    .eq('id', chapter.zone_id)
    .single()

  if (zoneError || !zone) {
    console.error('getChapter zone error:', zoneError?.message || 'Zone not found', { zoneError, zoneId: chapter.zone_id })
    // Return chapter without zone if zone fetch fails
    return {
      ...chapter,
      zone: {
        id: chapter.zone_id,
        zone_number: 0,
        name: 'Unknown Zone',
        icon: null,
        color: null,
      }
    } as ChapterWithZone
  }

  return {
    ...chapter,
    zone: zone
  } as ChapterWithZone
}

/**
 * Get chapter by zone and chapter number
 */
export async function getChapterByNumber(
  zoneId: number,
  chapterNumber: number
): Promise<ChapterWithZone | null> {
  const supabase = await createClient()

  // Get chapter
  const { data: chapter, error: chapterError } = await supabase
    .from('chapters')
    .select('*')
    .eq('zone_id', zoneId)
    .eq('chapter_number', chapterNumber)
    .single()

  if (chapterError || !chapter) {
    console.error('getChapterByNumber error:', chapterError?.message || 'Chapter not found')
    return null
  }

  // Get zone
  const { data: zone, error: zoneError } = await supabase
    .from('zones')
    .select('id, zone_number, name, icon, color')
    .eq('id', zoneId)
    .single()

  if (zoneError || !zone) {
    console.error('getChapterByNumber zone error:', zoneError?.message || 'Zone not found')
    return null
  }

  return {
    ...chapter,
    zone: zone
  } as ChapterWithZone
}

/**
 * Check if a chapter is unlocked for a student
 * A chapter is unlocked if:
 * 1. Its zone is unlocked
 * 2. It's the first chapter in the zone, OR ALL earlier chapters in the zone are completed
 * 
 * UPDATED: Now checks ALL earlier chapters, not just the previous one
 */
export async function isChapterUnlocked(
  studentId: string,
  chapterId: number
): Promise<boolean> {
  const supabase = await createClient()

  const chapter = await getChapter(chapterId)
  if (!chapter) return false

  // Check if zone is unlocked
  const { isZoneUnlocked } = await import('./zones')
  const zoneUnlocked = await isZoneUnlocked(studentId, chapter.zone_id)
  if (!zoneUnlocked) return false

  // First chapter in zone is always unlocked (if zone is unlocked)
  if (chapter.chapter_number === 1) return true

  // For other chapters, check if ALL earlier chapters in the zone are completed
  const { data: earlierChapters } = await supabase
    .from('chapters')
    .select('id')
    .eq('zone_id', chapter.zone_id)
    .lt('chapter_number', chapter.chapter_number)

  if (!earlierChapters || earlierChapters.length === 0) return true

  // Check if all phases of ALL earlier chapters are completed
  for (const earlierChapter of earlierChapters) {
    const { data: phases } = await supabase
      .from('phases')
      .select('id')
      .eq('chapter_id', earlierChapter.id)

    if (!phases || phases.length === 0) continue

    // Check if all phases in this earlier chapter are completed
    for (const phase of phases) {
      const { data: progress } = await supabase
        .from('student_progress')
        .select('completed_at')
        .eq('student_id', studentId)
        .eq('phase_id', phase.id)
        .single()

      if (!progress || !progress.completed_at) {
        return false // Found an incomplete phase in an earlier chapter
      }
    }
  }

  return true
}

/**
 * Get chapter progress for a student
 */
export async function getChapterProgress(
  studentId: string,
  chapterId: number
): Promise<ChapterProgress | null> {
  const supabase = await createClient()

  const chapter = await getChapter(chapterId)
  if (!chapter) return null

  // Get all phases for this chapter
  const { data: phases } = await supabase
    .from('phases')
    .select('id, phase_number')
    .eq('chapter_id', chapterId)
    .order('phase_number', { ascending: true })

  const totalPhases = phases?.length || 0
  let completedPhases = 0
  let currentPhase: number | null = null

  if (phases && phases.length > 0) {
    for (const phase of phases) {
      const { data: progress } = await supabase
        .from('student_progress')
        .select('completed_at, started_at')
        .eq('student_id', studentId)
        .eq('phase_id', phase.id)
        .single()

      if (progress && progress.completed_at) {
        completedPhases++
      } else if (progress && progress.started_at && currentPhase === null) {
        currentPhase = phase.phase_number
      }
    }

    // If no current phase found but not all completed, current phase is first incomplete
    if (currentPhase === null && completedPhases < totalPhases) {
      currentPhase = completedPhases + 1
    }
  }

  const isUnlocked = await isChapterUnlocked(studentId, chapterId)

  const completionPercentage = totalPhases > 0
    ? Math.round((completedPhases / totalPhases) * 100)
    : 0

  return {
    chapter,
    totalPhases,
    completedPhases,
    currentPhase,
    isUnlocked,
    completionPercentage,
  }
}

/**
 * Get all chapter progress for a zone
 */
export async function getAllChapterProgressForZone(
  studentId: string,
  zoneId: number
): Promise<ChapterProgress[]> {
  const chapters = await getChaptersByZone(zoneId)

  const progressPromises = chapters.map(chapter =>
    getChapterProgress(studentId, chapter.id)
  )

  const progress = await Promise.all(progressPromises)

  return progress.filter((cp): cp is ChapterProgress => cp !== null)
}

/**
 * Admin: Create a new chapter
 */
export async function createChapter(data: {
  zone_id: number
  chapter_number: number
  title: string
  subtitle?: string
  content: string
  task_description: string
  before_questions: any
  after_questions: any
  task_deadline_hours?: number
  chunks?: any
  legacy_day_number?: number
}): Promise<{ success: boolean; error?: string; chapterId?: number }> {
  const adminClient = createAdminClient()

  const { data: chapter, error } = await adminClient
    .from('chapters')
    .insert({
      zone_id: data.zone_id,
      chapter_number: data.chapter_number,
      title: data.title,
      subtitle: data.subtitle || null,
      content: data.content,
      task_description: data.task_description,
      before_questions: data.before_questions,
      after_questions: data.after_questions,
      task_deadline_hours: data.task_deadline_hours || 24,
      chunks: data.chunks || null,
      legacy_day_number: data.legacy_day_number || null,
    })
    .select('id')
    .single()

  if (error) {
    console.error('createChapter error:', error)
    return { success: false, error: error.message }
  }

  return { success: true, chapterId: chapter.id }
}

/**
 * Admin: Update a chapter
 */
export async function updateChapter(
  chapterId: number,
  data: Partial<Omit<Chapter, 'id' | 'created_at' | 'updated_at'>>
): Promise<{ success: boolean; error?: string }> {
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('chapters')
    .update(data)
    .eq('id', chapterId)

  if (error) {
    console.error('updateChapter error:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Admin: Delete a chapter
 */
export async function deleteChapter(chapterId: number): Promise<{ success: boolean; error?: string }> {
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('chapters')
    .delete()
    .eq('id', chapterId)

  if (error) {
    console.error('deleteChapter error:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Get all chapters (admin)
 */
export async function getAllChapters(): Promise<ChapterWithZone[]> {
  const adminClient = createAdminClient()

  const { data: chapters, error } = await adminClient
    .from('chapters')
    .select(`
      *,
      zone:zones (
        id,
        zone_number,
        name,
        icon,
        color
      )
    `)
    .order('zone_id', { ascending: true })
    .order('chapter_number', { ascending: true })

  if (error) {
    console.error('getAllChapters error:', error)
    throw new Error('Failed to fetch chapters')
  }

  return (chapters as any[]).map(c => ({
    ...c,
    zone: Array.isArray(c.zone) ? c.zone[0] : c.zone
  })) as ChapterWithZone[]
}
