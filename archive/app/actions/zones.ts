'use server'

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export interface Zone {
  id: number
  zone_number: number
  name: string
  description: string | null
  icon: string | null
  color: string | null
  unlock_condition: string
  created_at: string
  updated_at: string
}

export interface ZoneProgress {
  zone: Zone
  totalChapters: number
  completedChapters: number
  totalPhases: number
  completedPhases: number
  isUnlocked: boolean
  completionPercentage: number
}

/**
 * Get all zones
 * Cached to avoid duplicate queries within the same request
 * Note: Cannot use unstable_cache here because createClient() uses cookies() which is dynamic
 */
export const getZones = cache(async (): Promise<Zone[]> => {
  const supabase = await createClient()

  const { data: zones, error } = await supabase
    .from('zones')
    .select('*')
    .order('zone_number', { ascending: true })

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('getZones error:', error)
    }
    throw new Error('Failed to fetch zones')
  }

  return zones || []
})

/**
 * Get a single zone by ID
 * Cached to avoid duplicate queries within the same request
 */
export const getZone = cache(async (zoneId: number): Promise<Zone | null> => {
  const supabase = await createClient()

  const { data: zone, error } = await supabase
    .from('zones')
    .select('*')
    .eq('id', zoneId)
    .single()

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('getZone error:', error)
    }
    return null
  }

  return zone
})

/**
 * Get a zone by zone number
 */
export async function getZoneByNumber(zoneNumber: number): Promise<Zone | null> {
  const supabase = await createClient()

  const { data: zone, error } = await supabase
    .from('zones')
    .select('*')
    .eq('zone_number', zoneNumber)
    .single()

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('getZoneByNumber error:', error)
    }
    return null
  }

  return zone
}

/**
 * Check if a zone is unlocked for a student
 * Zone 1 is always unlocked
 * Other zones unlock when previous zone is completed (all chapters completed)
 */
export async function isZoneUnlocked(studentId: string, zoneId: number): Promise<boolean> {
  const supabase = await createClient()

  // Get the zone
  const { data: zone } = await supabase
    .from('zones')
    .select('zone_number, unlock_condition')
    .eq('id', zoneId)
    .single()

  if (!zone) return false

  // Zone 1 is always unlocked
  if (zone.zone_number === 1) return true

  // For other zones, check if previous zone is completed
  if (zone.unlock_condition === 'complete_previous_zone') {
    const previousZoneNumber = zone.zone_number - 1

    // Get previous zone
    const { data: previousZone } = await supabase
      .from('zones')
      .select('id')
      .eq('zone_number', previousZoneNumber)
      .single()

    if (!previousZone) return false

    // Get all chapters in previous zone
    const { data: previousZoneChapters } = await supabase
      .from('chapters')
      .select('id')
      .eq('zone_id', previousZone.id)

    if (!previousZoneChapters || previousZoneChapters.length === 0) return false

    const previousChapterIds = previousZoneChapters.map(c => c.id)

    // Get all phases from previous zone chapters in one query
    const { data: allPhases } = await supabase
      .from('phases')
      .select('id')
      .in('chapter_id', previousChapterIds)

    if (!allPhases || allPhases.length === 0) return true

    const allPhaseIds = allPhases.map(p => p.id)

    // Batch fetch all progress in one query
    const { data: allProgress } = await supabase
      .from('student_progress')
      .select('phase_id, completed_at')
      .eq('student_id', studentId)
      .in('phase_id', allPhaseIds)

    // Create a Set for O(1) lookup
    const completedPhaseIds = new Set(
      (allProgress || [])
        .filter(p => p.completed_at)
        .map(p => p.phase_id)
    )

    // Check if all phases are completed
    for (const phase of allPhases) {
      if (!completedPhaseIds.has(phase.id)) {
        return false
      }
    }

    // All chapters in previous zone are completed
    return true
  }

  // Default: unlock if condition is 'always_unlocked'
  return zone.unlock_condition === 'always_unlocked'
}

/**
 * Get zone progress for a student
 * Optimized: Uses single batched query instead of N+1 queries
 */
export async function getZoneProgress(studentId: string, zoneId: number): Promise<ZoneProgress | null> {
  const supabase = await createClient()

  // Get zone info
  const zone = await getZone(zoneId)
  if (!zone) return null

  // Single query to get all phases with their progress
  const { data: allData, error } = await supabase
    .from('phases')
    .select(`
      id,
      chapter_id,
      chapters!inner (
        id,
        zone_id
      ),
      student_progress!left (
        student_id,
        completed_at
      )
    `)
    .eq('chapters.zone_id', zoneId)
    .eq('student_progress.student_id', studentId)

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('getZoneProgress error:', error)
    }
    return null
  }

  if (!allData) return null

  // Compute in memory
  const chapterMap = new Map<number, { total: number; completed: number }>()
  let totalPhases = 0
  let completedPhases = 0

  for (const item of allData) {
    const chapterId = item.chapter_id
    if (!chapterMap.has(chapterId)) {
      chapterMap.set(chapterId, { total: 0, completed: 0 })
    }
    const chapter = chapterMap.get(chapterId)!
    chapter.total++
    totalPhases++

    // Handle both array and single object responses from Supabase
    const progress = Array.isArray(item.student_progress) 
      ? item.student_progress[0] 
      : item.student_progress
    if (progress?.completed_at) {
      chapter.completed++
      completedPhases++
    }
  }

  const completedChapters = Array.from(chapterMap.values())
    .filter(ch => ch.completed === ch.total && ch.total > 0).length

  // Check if zone is unlocked
  const isUnlocked = await isZoneUnlocked(studentId, zoneId)

  const completionPercentage = totalPhases > 0 
    ? Math.round((completedPhases / totalPhases) * 100) 
    : 0

  return {
    zone,
    totalChapters: chapterMap.size,
    completedChapters,
    totalPhases,
    completedPhases,
    isUnlocked,
    completionPercentage,
  }
}

/**
 * Get all zone progress for a student
 */
export async function getAllZoneProgress(studentId: string): Promise<ZoneProgress[]> {
  const zones = await getZones()
  
  const zoneProgressPromises = zones.map(zone => 
    getZoneProgress(studentId, zone.id)
  )

  const zoneProgress = await Promise.all(zoneProgressPromises)
  
  return zoneProgress.filter((zp): zp is ZoneProgress => zp !== null)
}

/**
 * Admin: Create a new zone
 */
export async function createZone(data: {
  zone_number: number
  name: string
  description?: string
  icon?: string
  color?: string
  unlock_condition?: string
}): Promise<{ success: boolean; error?: string; zoneId?: number }> {
  const adminClient = createAdminClient()

  const { data: zone, error } = await adminClient
    .from('zones')
    .insert({
      zone_number: data.zone_number,
      name: data.name,
      description: data.description || null,
      icon: data.icon || null,
      color: data.color || null,
      unlock_condition: data.unlock_condition || 'complete_previous_zone',
    })
    .select('id')
    .single()

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('createZone error:', error)
    }
    return { success: false, error: error.message }
  }

  return { success: true, zoneId: zone.id }
}

/**
 * Admin: Update a zone
 */
export async function updateZone(
  zoneId: number,
  data: Partial<Omit<Zone, 'id' | 'created_at' | 'updated_at'>>
): Promise<{ success: boolean; error?: string }> {
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('zones')
    .update(data)
    .eq('id', zoneId)

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('updateZone error:', error)
    }
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Admin: Delete a zone
 */
export async function deleteZone(zoneId: number): Promise<{ success: boolean; error?: string }> {
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('zones')
    .delete()
    .eq('id', zoneId)

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('deleteZone error:', error)
    }
    return { success: false, error: error.message }
  }

  return { success: true }
}
