'use server'

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
 */
export async function getZones(): Promise<Zone[]> {
  const supabase = await createClient()

  const { data: zones, error } = await supabase
    .from('zones')
    .select('*')
    .order('zone_number', { ascending: true })

  if (error) {
    console.error('getZones error:', error)
    throw new Error('Failed to fetch zones')
  }

  return zones || []
}

/**
 * Get a single zone by ID
 */
export async function getZone(zoneId: number): Promise<Zone | null> {
  const supabase = await createClient()

  const { data: zone, error } = await supabase
    .from('zones')
    .select('*')
    .eq('id', zoneId)
    .single()

  if (error) {
    console.error('getZone error:', error)
    return null
  }

  return zone
}

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
    console.error('getZoneByNumber error:', error)
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

    // Check if all chapters in previous zone are completed
    // A chapter is completed if all 5 phases are completed
    for (const chapter of previousZoneChapters) {
      // Get all phases for this chapter
      const { data: phases } = await supabase
        .from('phases')
        .select('id')
        .eq('chapter_id', chapter.id)

      if (!phases || phases.length === 0) continue

      // Check if all phases are completed
      for (const phase of phases) {
        const { data: progress } = await supabase
          .from('student_progress')
          .select('completed_at')
          .eq('student_id', studentId)
          .eq('phase_id', phase.id)
          .single()

        // If any phase is not completed, previous zone is not complete
        if (!progress || !progress.completed_at) {
          return false
        }
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
 */
export async function getZoneProgress(studentId: string, zoneId: number): Promise<ZoneProgress | null> {
  const supabase = await createClient()

  // Get zone info
  const zone = await getZone(zoneId)
  if (!zone) return null

  // Get all chapters in this zone
  const { data: chapters } = await supabase
    .from('chapters')
    .select('id')
    .eq('zone_id', zoneId)

  const totalChapters = chapters?.length || 0
  const totalPhases = totalChapters * 5 // 5 phases per chapter

  // Count completed chapters and phases
  let completedChapters = 0
  let completedPhases = 0

  if (chapters && chapters.length > 0) {
    for (const chapter of chapters) {
      // Get all phases for this chapter
      const { data: phases } = await supabase
        .from('phases')
        .select('id')
        .eq('chapter_id', chapter.id)

      if (!phases) continue

      let chapterCompleted = true
      for (const phase of phases) {
        const { data: progress } = await supabase
          .from('student_progress')
          .select('completed_at')
          .eq('student_id', studentId)
          .eq('phase_id', phase.id)
          .single()

        if (progress && progress.completed_at) {
          completedPhases++
        } else {
          chapterCompleted = false
        }
      }

      if (chapterCompleted) {
        completedChapters++
      }
    }
  }

  // Check if zone is unlocked
  const isUnlocked = await isZoneUnlocked(studentId, zoneId)

  const completionPercentage = totalPhases > 0 
    ? Math.round((completedPhases / totalPhases) * 100) 
    : 0

  return {
    zone,
    totalChapters,
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
    console.error('createZone error:', error)
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
    console.error('updateZone error:', error)
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
    console.error('deleteZone error:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
