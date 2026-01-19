'use server'

import { createClient } from '@/lib/supabase/server'
import { getLevelFromXp, getLevelProgress, type LevelProgress } from '@/lib/xp'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { XP_CONFIG } from '@/config/xp'

export interface XPResult {
  baseXP: number
  bonuses: {
    chapter?: number
    zone?: number
    perfect?: number
  }
  totalXP: number
  newXP: number
  newTotalXpEarned: number
  newLevel: number
  oldLevel: number
  leveledUp: boolean
  message: string
}

/**
 * v1 XP awarding: direct updates to profiles.xp (legacy path).
 */
export async function awardXPForPhase(
  studentId: string,
  phaseId: number,
  baseXP: number,
  bonuses?: { chapter?: number; zone?: number; perfect?: number }
): Promise<XPResult> {
  const supabase = await createClient()

  // Get current XP and level
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('xp, level, total_xp_earned')
    .eq('id', studentId)
    .single()

  if (profileError || !profile) {
    throw new Error('Failed to fetch student profile')
  }

  const oldXP = profile.xp || 0
  const oldLevel = profile.level || 1
  const oldTotalXP = profile.total_xp_earned || 0

  // Calculate total XP to award
  let totalXPToAward = baseXP
  const bonusBreakdown: XPResult['bonuses'] = {}

  if (bonuses?.chapter) {
    totalXPToAward += bonuses.chapter
    bonusBreakdown.chapter = bonuses.chapter
  }

  if (bonuses?.zone) {
    totalXPToAward += bonuses.zone
    bonusBreakdown.zone = bonuses.zone
  }

  if (bonuses?.perfect) {
    totalXPToAward += bonuses.perfect
    bonusBreakdown.perfect = bonuses.perfect
  }

  // Calculate new XP and level
  const newXP = oldXP + totalXPToAward
  const newLevel = getLevelFromXp(newXP)
  const leveledUp = newLevel > oldLevel
  const newTotalXP = oldTotalXP + totalXPToAward

  // Update profile with new XP
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      xp: newXP,
      level: newLevel,
      total_xp_earned: newTotalXP,
    })
    .eq('id', studentId)

  if (updateError) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to update XP:', updateError)
    }
    throw new Error('Failed to award XP')
  }

  // Create level-up notification if applicable
  if (leveledUp) {
    await createLevelUpNotification(studentId, newLevel)
  }

  // Build message
  const messages: string[] = [`Earned ${baseXP} XP`]
  if (bonusBreakdown.chapter) {
    messages.push(`+${bonusBreakdown.chapter} XP for completing mission`)
  }
  if (bonusBreakdown.zone) {
    messages.push(`+${bonusBreakdown.zone} XP for mastering zone!`)
  }
  if (bonusBreakdown.perfect) {
    messages.push(`+${bonusBreakdown.perfect} XP bonus for perfect score`)
  }

  revalidatePath('/student')

  return {
    baseXP,
    bonuses: bonusBreakdown,
    totalXP: totalXPToAward,
    newXP,
    newTotalXpEarned: newTotalXP,
    newLevel,
    oldLevel,
    leveledUp,
    message: `You earned ${totalXPToAward} XP! ${messages.slice(1).join(' ')}`,
  }
}

type XpEventType = 'PHASE_COMPLETE' | 'MISSION_COMPLETE' | 'ZONE_COMPLETE'

export interface AwardXpForPhaseCompletionArgs {
  studentId: string
  phaseId: number
  /** Whether this phase earned a perfect-score bonus (folded into the phase event amount). */
  perfectScore?: boolean
}

export interface AwardXpForPhaseCompletionResult {
  /** XP awarded for this call (0 if already awarded). */
  xpAwarded: {
    phase: number
    mission: number
    zone: number
    total: number
  }
  /** New profile totals (when available). */
  profile?: {
    xp: number
    level: number
    totalXpEarned: number
    leveledUp: boolean
    oldLevel: number
  }
}

/**
 * v2 XP awarding: event-based ledger with idempotency.
 *
 * - Always writes to `xp_events` (using service role).
 * - If XP_SYSTEM_VERSION === 'v1': also updates profiles directly (dual-write).
 * - If XP_SYSTEM_VERSION === 'v2': profiles are set from SUM(xp_events.xp_amount).
 */
export async function awardXpForPhaseCompletion(
  args: AwardXpForPhaseCompletionArgs
): Promise<AwardXpForPhaseCompletionResult> {
  const { studentId, phaseId, perfectScore } = args

  const supabase = await createClient()
  const admin = createAdminClient()

  // Fetch phase -> chapter -> zone
  const { data: phase, error: phaseError } = await supabase
    .from('phases')
    .select(`
      id,
      chapter_id,
      chapter:chapters (
        id,
        zone_id
      )
    `)
    .eq('id', phaseId)
    .single()

  if (phaseError || !phase) {
    throw new Error('Failed to fetch phase for XP awarding')
  }

  const chapterId = (phase as any).chapter_id as number
  const zoneId = ((phase as any).chapter?.zone_id ?? null) as number | null

  const phaseXpAmount = XP_CONFIG.XP_PER_PHASE + (perfectScore ? XP_CONFIG.XP_PERFECT_SCORE_BONUS : 0)

  // Helper: upsert event, and detect whether it was newly created.
  const insertEvent = async (
    eventType: XpEventType,
    refId: number,
    xpAmount: number
  ): Promise<{ inserted: boolean }> => {
    // Use INSERT ... ON CONFLICT DO NOTHING via upsert(ignoreDuplicates).
    // Supabase returns [] when ignored; returns inserted row when inserted.
    const { data, error } = await admin
      .from('xp_events')
      .upsert(
        {
          user_id: studentId,
          event_type: eventType,
          ref_id: refId,
          xp_amount: xpAmount,
        },
        { onConflict: 'user_id,event_type,ref_id', ignoreDuplicates: true }
      )
      .select('id')

    if (error) {
      throw new Error(`Failed to write XP event: ${error.message}`)
    }

    return { inserted: Array.isArray(data) && data.length > 0 }
  }

  // 1) Phase event (fold perfect into the phase amount)
  const phaseInsert = await insertEvent('PHASE_COMPLETE', phaseId, phaseXpAmount)

  // 2) Mission event (chapter complete)
  let missionComplete = false
  {
    const [{ count: totalCount }, { count: completedCount }] = await Promise.all([
      supabase.from('phases').select('id', { count: 'exact', head: true }).eq('chapter_id', chapterId),
      supabase
        .from('student_progress')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', studentId)
        .eq('chapter_id', chapterId)
        .not('completed_at', 'is', null),
    ])

    missionComplete = (totalCount ?? 0) > 0 && (completedCount ?? 0) >= (totalCount ?? 0)
  }

  const missionInsert = missionComplete ? await insertEvent('MISSION_COMPLETE', chapterId, XP_CONFIG.XP_PER_MISSION) : { inserted: false }

  // 3) Zone event (zone complete)
  let zoneComplete = false

  // Compute zone completion properly (needs chapter ids in zone)
  let zoneInsert = { inserted: false }
  if (zoneId) {
    const { data: zoneChapters, error: zoneChaptersError } = await supabase
      .from('chapters')
      .select('id')
      .eq('zone_id', zoneId)

    if (zoneChaptersError) {
      throw new Error('Failed to fetch zone chapters for XP awarding')
    }

    const chapterIds = (zoneChapters ?? []).map((c: any) => c.id).filter((n: any) => typeof n === 'number')

    if (chapterIds.length > 0) {
      const [{ count: totalCount }, { count: completedCount }] = await Promise.all([
        supabase.from('phases').select('id', { count: 'exact', head: true }).in('chapter_id', chapterIds),
        supabase
          .from('student_progress')
          .select('id', { count: 'exact', head: true })
          .eq('student_id', studentId)
          .eq('zone_id', zoneId)
          .not('completed_at', 'is', null),
      ])

      zoneComplete = (totalCount ?? 0) > 0 && (completedCount ?? 0) >= (totalCount ?? 0)
      if (zoneComplete) {
        zoneInsert = await insertEvent('ZONE_COMPLETE', zoneId, XP_CONFIG.XP_PER_ZONE)
      }
    }
  }

  const xpAwarded = {
    phase: phaseInsert.inserted ? phaseXpAmount : 0,
    mission: missionInsert.inserted ? XP_CONFIG.XP_PER_MISSION : 0,
    zone: zoneInsert.inserted ? XP_CONFIG.XP_PER_ZONE : 0,
    total: 0,
  }
  xpAwarded.total = xpAwarded.phase + xpAwarded.mission + xpAwarded.zone

  // Dual-write behavior
  if (XP_CONFIG.XP_SYSTEM_VERSION === 'v1') {
    if (xpAwarded.total > 0) {
      // Keep existing UI/result behavior for v1 path.
      const v1Result = await awardXPForPhase(studentId, phaseId, XP_CONFIG.XP_PER_PHASE, {
        chapter: missionInsert.inserted ? XP_CONFIG.XP_PER_MISSION : undefined,
        zone: zoneInsert.inserted ? XP_CONFIG.XP_PER_ZONE : undefined,
        perfect: phaseInsert.inserted && perfectScore ? XP_CONFIG.XP_PERFECT_SCORE_BONUS : undefined,
      })

      return {
        xpAwarded,
        profile: {
          xp: v1Result.newXP,
          level: v1Result.newLevel,
          totalXpEarned: v1Result.newTotalXpEarned,
          leveledUp: v1Result.leveledUp,
          oldLevel: v1Result.oldLevel,
        },
      }
    }

    // No new events inserted; don't touch profile.
    return { xpAwarded }
  }

  // v2: set profile totals from the ledger
  const { data: sumRows, error: sumError } = await admin
    .from('xp_events')
    .select('xp_amount')
    .eq('user_id', studentId)

  if (sumError) {
    throw new Error('Failed to compute XP total from events')
  }

  const totalFromEvents = (sumRows ?? []).reduce((acc: number, r: any) => acc + (r.xp_amount ?? 0), 0)

  const { data: existingProfile, error: profileError } = await admin
    .from('profiles')
    .select('level')
    .eq('id', studentId)
    .single()

  if (profileError) {
    throw new Error('Failed to fetch profile for XP update')
  }

  const oldLevel = existingProfile?.level ?? getLevelFromXp(totalFromEvents)

  const { data: updatedProfile, error: updateProfileError } = await admin
    .from('profiles')
    .update({
      xp: totalFromEvents,
      total_xp_earned: totalFromEvents,
    })
    .eq('id', studentId)
    .select('xp, level, total_xp_earned')
    .single()

  if (updateProfileError || !updatedProfile) {
    throw new Error('Failed to update profile XP from events')
  }

  const leveledUp = (updatedProfile.level ?? 1) > oldLevel

  if (leveledUp) {
    await createLevelUpNotification(studentId, updatedProfile.level ?? 1)
  }

  revalidatePath('/student')

  return {
    xpAwarded,
    profile: {
      xp: updatedProfile.xp ?? totalFromEvents,
      level: updatedProfile.level ?? getLevelFromXp(totalFromEvents),
      totalXpEarned: updatedProfile.total_xp_earned ?? totalFromEvents,
      leveledUp,
      oldLevel,
    },
  }
}

/**
 * Get student's current XP and level information
 */
export async function getStudentXP(studentId: string): Promise<{
  xp: number
  level: number
  totalXpEarned: number
  levelProgress: LevelProgress
  breakdown?: {
    phase: number
    mission: number
    zone: number
    total: number
  }
}> {
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('xp, level, total_xp_earned')
    .eq('id', studentId)
    .single()

  if (error || !profile) {
    // Return defaults if profile not found
    return {
      xp: 0,
      level: 1,
      totalXpEarned: 0,
      levelProgress: {
        level: 1,
        currentLevelXp: 0,
        nextLevelXp: 100,
        progress: 0,
        xpNeeded: 100,
      },
    }
  }

  const xp = profile.xp || 0
  const level = profile.level || 1
  const totalXpEarned = profile.total_xp_earned || 0
  const levelProgress = getLevelProgress(xp)

  let breakdown: { phase: number; mission: number; zone: number; total: number } | undefined
  if (XP_CONFIG.XP_SYSTEM_VERSION === 'v2') {
    const { data: events } = await supabase
      .from('xp_events')
      .select('event_type, xp_amount')
      .eq('user_id', studentId)

    const phase = (events ?? [])
      .filter((e: any) => e.event_type === 'PHASE_COMPLETE')
      .reduce((acc: number, e: any) => acc + (e.xp_amount ?? 0), 0)

    const mission = (events ?? [])
      .filter((e: any) => e.event_type === 'MISSION_COMPLETE')
      .reduce((acc: number, e: any) => acc + (e.xp_amount ?? 0), 0)

    const zone = (events ?? [])
      .filter((e: any) => e.event_type === 'ZONE_COMPLETE')
      .reduce((acc: number, e: any) => acc + (e.xp_amount ?? 0), 0)

    breakdown = { phase, mission, zone, total: phase + mission + zone }
  }

  return {
    xp,
    level,
    totalXpEarned,
    levelProgress,
    breakdown,
  }
}

/**
 * Check if a student leveled up between two XP values
 */
export async function checkLevelUp(
  studentId: string,
  oldXP: number,
  newXP: number
): Promise<{ leveledUp: boolean; newLevel?: number; oldLevel?: number }> {
  const oldLevel = getLevelFromXp(oldXP)
  const newLevel = getLevelFromXp(newXP)

  if (newLevel > oldLevel) {
    return {
      leveledUp: true,
      newLevel,
      oldLevel,
    }
  }

  return { leveledUp: false }
}

/**
 * Create a notification for level up
 */
async function createLevelUpNotification(studentId: string, newLevel: number): Promise<void> {
  const supabase = await createClient()

  await supabase.from('notifications').insert({
    user_id: studentId,
    type: 'level_up',
    title: `Level Up! You're now Level ${newLevel}`,
    message: `Congratulations! You've reached Level ${newLevel}. Keep up the great work!`,
    metadata: { level: newLevel },
  })
}

/**
 * Get XP leaderboard (top students by XP)
 */
export async function getXPLeaderboard(limit: number = 10): Promise<
  Array<{
    id: string
    full_name: string
    xp: number
    level: number
    rank: number
  }>
> {
  const supabase = await createClient()

  const { data: students, error } = await supabase
    .from('profiles')
    .select('id, full_name, xp, level')
    .eq('role', 'student')
    .order('xp', { ascending: false })
    .limit(limit)

  if (error || !students) {
    return []
  }

  return students.map((student, index) => ({
    ...student,
    rank: index + 1,
  }))
}
