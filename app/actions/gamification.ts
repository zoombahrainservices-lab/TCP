'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  calculateLevel,
  getStreakMultiplier,
  getStreakMilestoneBonus,
} from '@/lib/gamification/math'
import { XP } from '@/lib/gamification/constants'
import { getTodayKey, getYesterdayKey } from '@/lib/gamification/dateUtils'

// ============================================================================
// TYPES
// ============================================================================

export type XPReason = 
  | 'daily_activity'
  | 'section_completion' 
  | 'chapter_completion'
  | 'improvement'
  | 'streak_bonus'
  | 'milestone'

export type AssessmentType = 'baseline' | 'after'

export type XPReasonCode =
  | 'awarded'
  | 'already_awarded'
  | 'first_time'
  | 'repeat_completion'
  | 'no_improvement'
  | 'streak_continued'
  | 'milestone'
  | 'daily_activity'

export interface XPResult {
  xpAwarded: number
  newTotalXP: number
  newLevel: number
  leveledUp: boolean
  multiplierApplied: boolean
  /** True when eventKey was already used (no XP awarded, no double-count) */
  alreadyAwarded?: boolean
  /** User-facing reason for XP outcome */
  reasonCode?: XPReasonCode
}

export interface StreakResult {
  streakContinued: boolean
  currentStreak: number
  milestoneReached?: number
  bonusXP?: number
  /** True when user was already active today — no transition, no XP */
  alreadyActiveToday?: boolean
  /** XP awarded this transition (daily +10, streak +5, milestone) */
  xpAwarded?: number
  /** Reason codes for feedback (daily_activity, streak_continued, milestone) */
  reasonCodes?: XPReasonCode[]
}

export interface ImprovementResult {
  improvement: number
  xpAwarded: number
}

// ============================================================================
// INITIALIZATION
// ============================================================================

export async function initializeGamification(userId: string) {
  const supabase = createAdminClient()
  
  // Check if already exists
  const { data: existing } = await supabase
    .from('user_gamification')
    .select('id')
    .eq('user_id', userId)
    .single()
  
  if (existing) {
    return { data: existing, error: null }
  }
  
  const { data, error } = await supabase
    .from('user_gamification')
    .insert({
      user_id: userId,
      total_xp: 0,
      level: 1,
      current_streak: 0,
      longest_streak: 0
    })
    .select()
    .single()
    
  return { data, error }
}

export async function getGamificationData(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_gamification')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  // Initialize if doesn't exist
  if (error && error.code === 'PGRST116') {
    return await initializeGamification(userId)
  }
  
  return { data, error }
}

// ============================================================================
// XP AWARDING
// ============================================================================

export async function awardXP(
  userId: string,
  reason: XPReason,
  baseAmount: number,
  metadata?: Record<string, any>,
  eventKey?: string | null
): Promise<XPResult> {
  const supabase = createAdminClient()
  
  // 1. Get current gamification data
  const { data: userData, error: userError } = await supabase
    .from('user_gamification')
    .select('*')
    .eq('user_id', userId)
    .single()
    
  if (userError || !userData) {
    // Initialize if doesn't exist
    const initResult = await initializeGamification(userId)
    if (initResult.error) {
      throw new Error(`Failed to initialize gamification: ${initResult.error.message}`)
    }
    const { data: newUserData } = await supabase
      .from('user_gamification')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (!newUserData) {
      throw new Error('Gamification row missing after init - user_gamification insert may have failed')
    }
    
    return awardXP(userId, reason, baseAmount, metadata, eventKey)
  }
  
  // 2. Apply streak multiplier only for section_completion (not daily_activity)
  let finalAmount = baseAmount
  if (reason === 'section_completion') {
    const multiplier = getStreakMultiplier(userData.current_streak)
    finalAmount = Math.floor(baseAmount * multiplier)
  }
  
  // 3. Log XP event (with optional eventKey for idempotency)
  const insertPayload: Record<string, unknown> = {
    user_id: userId,
    reason,
    amount: finalAmount,
    metadata: { ...metadata, base_amount: baseAmount },
    chapter_id: metadata?.chapter_id,
  }
  if (eventKey != null && eventKey !== '') {
    insertPayload.xp_event_key = eventKey
  }

  const { error: xpLogError } = await supabase.from('xp_logs').insert(insertPayload)
  
  // 4. On unique violation (eventKey already used) → return "already awarded", no XP
  if (xpLogError?.code === '23505') {
    return {
      xpAwarded: 0,
      newTotalXP: userData.total_xp,
      newLevel: userData.level,
      leveledUp: false,
      multiplierApplied: false,
      alreadyAwarded: true,
      reasonCode: 'already_awarded',
    }
  }
  if (xpLogError) {
    throw new Error(`xp_logs insert failed: ${xpLogError.message} (${xpLogError.code})`)
  }
  
  // 5. Update total XP and level
  const newTotalXP = userData.total_xp + finalAmount
  const newLevel = calculateLevel(newTotalXP)
  
  const { error: updateError } = await supabase
    .from('user_gamification')
    .update({
      total_xp: newTotalXP,
      level: newLevel,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
  if (updateError) {
    throw new Error(`user_gamification update failed: ${updateError.message} (${updateError.code})`)
  }
    
  // 6. Check for level up
  const leveledUp = newLevel > userData.level
  
  return {
    xpAwarded: finalAmount,
    newTotalXP,
    newLevel,
    leveledUp,
    multiplierApplied: finalAmount !== baseAmount,
    reasonCode: 'awarded' as const,
  }
}

// ============================================================================
// STREAK MANAGEMENT
// ============================================================================

export async function updateStreak(userId: string): Promise<StreakResult> {
  const supabase = createAdminClient()
  
  const { data: userData, error } = await supabase
    .from('user_gamification')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  const timezone = (userData?.timezone as string) || 'UTC'
  const today = getTodayKey(timezone)
  const yesterdayStr = getYesterdayKey(timezone)
    
  if (error || !userData) {
    const initResult = await initializeGamification(userId)
    if (initResult.error) {
      throw new Error(`Failed to initialize gamification for streak: ${initResult.error.message}`)
    }
    const { error: updateErr } = await supabase
      .from('user_gamification')
      .update({
        current_streak: 1,
        longest_streak: 1,
        last_active_date: today,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
    if (updateErr) throw new Error(`user_gamification streak update failed: ${updateErr.message}`)
    const dailyResult = await awardXP(userId, 'daily_activity', XP.DAILY_ACTIVITY, {}, `daily_activity:${userId}:${today}`)
    return {
      streakContinued: false,
      currentStreak: 1,
      xpAwarded: dailyResult.xpAwarded,
      reasonCodes: dailyResult.xpAwarded > 0 ? ['daily_activity'] : [],
    }
  }
  
  const lastActive = userData.last_active_date
  
  if (lastActive === today) {
    return {
      streakContinued: false,
      currentStreak: userData.current_streak,
      alreadyActiveToday: true,
    }
  }
  
  const streakContinued = lastActive === yesterdayStr
  const newStreak = streakContinued ? userData.current_streak + 1 : 1
  const streakRunId = (userData.streak_run_id ?? 1) + (streakContinued ? 0 : 1)
  
  // Primary path: update including streak_run_id (requires 20260206_xp_quality.sql migration)
  let { error: updateErr } = await supabase
    .from('user_gamification')
    .update({
      current_streak: newStreak,
      longest_streak: Math.max(userData.longest_streak, newStreak),
      last_active_date: today,
      streak_run_id: streakRunId,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)

  // Fallback: if the column streak_run_id does not exist (migration not yet applied),
  // retry without touching that column so streaks still work.
  if (updateErr && typeof updateErr.message === 'string' && updateErr.message.includes('streak_run_id')) {
    console.error(
      '[XP] user_gamification.streak_run_id column missing. ' +
      'Run supabase/migrations/20260206_xp_quality.sql to enable full streak features. ' +
      'Falling back to update without streak_run_id.'
    )

    const fallback = await supabase
      .from('user_gamification')
      .update({
        current_streak: newStreak,
        longest_streak: Math.max(userData.longest_streak, newStreak),
        last_active_date: today,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    updateErr = fallback.error
  }

  if (updateErr) {
    throw new Error(`user_gamification streak update failed: ${updateErr.message}`)
  }
  
  let totalXPAwarded = 0
  const reasonCodes: XPReasonCode[] = []
  
  const dailyResult = await awardXP(userId, 'daily_activity', XP.DAILY_ACTIVITY, {}, `daily_activity:${userId}:${today}`)
  totalXPAwarded += dailyResult.xpAwarded
  if (dailyResult.xpAwarded > 0) reasonCodes.push('daily_activity')
  
  if (streakContinued && newStreak >= 2) {
    const streakResult = await awardXP(userId, 'streak_bonus', XP.DAILY_STREAK_BONUS, { daily_streak: true }, `daily_streak:${userId}:${today}`)
    totalXPAwarded += streakResult.xpAwarded
    if (streakResult.xpAwarded > 0) reasonCodes.push('streak_continued')
  }
  
  const milestones = [3, 7, 30, 100]
  if (milestones.includes(newStreak)) {
    const bonusXP = getStreakMilestoneBonus(newStreak)
    const milestoneResult = await awardXP(userId, 'streak_bonus', bonusXP, { milestone: newStreak }, `streak_milestone:${userId}:${streakRunId}:${newStreak}`)
    totalXPAwarded += milestoneResult.xpAwarded
    if (milestoneResult.xpAwarded > 0) reasonCodes.push('milestone')
    
    const { error: histErr } = await supabase.from('streak_history').insert({
      user_id: userId,
      streak_length: newStreak,
      milestone_reached: newStreak,
      bonus_xp_awarded: bonusXP
    })
    if (histErr) console.error('streak_history insert failed (non-fatal):', histErr)
    
    return {
      streakContinued: true,
      currentStreak: newStreak,
      milestoneReached: newStreak,
      bonusXP: milestoneResult.xpAwarded,
      xpAwarded: totalXPAwarded,
      reasonCodes,
    }
  }
  
  return {
    streakContinued,
    currentStreak: newStreak,
    xpAwarded: totalXPAwarded,
    reasonCodes,
  }
}

// ============================================================================
// SKILL SCORES & IMPROVEMENT
// ============================================================================

export async function recordAssessmentScore(
  userId: string,
  chapterId: number,
  assessmentType: AssessmentType,
  score: number,
  assessmentId?: number
): Promise<ImprovementResult | null> {
  const supabase = createAdminClient()
  
  const { data: skillData } = await supabase
    .from('chapter_skill_scores')
    .select('*')
    .eq('user_id', userId)
    .eq('chapter_id', chapterId)
    .single()
    
  if (assessmentType === 'baseline') {
    if (skillData) {
      await supabase
        .from('chapter_skill_scores')
        .update({ score_before: score, best_score: score })
        .eq('id', skillData.id)
    } else {
      await supabase
        .from('chapter_skill_scores')
        .insert({
          user_id: userId,
          chapter_id: chapterId,
          score_before: score,
          best_score: score
        })
    }
    return null
  }

  // After assessment
  if (!skillData || skillData.score_before === null) {
    throw new Error('Baseline score not found')
  }

  const baseline = skillData.best_score ?? skillData.score_before
  const improvement = Math.max(0, baseline - score) // lower is better

  let xpAwarded = 0
  if (improvement > 0 && assessmentId != null) {
    const improvementXP = improvement * XP.IMPROVEMENT_PER_POINT
    const eventKey = `improvement:${userId}:${chapterId}:${assessmentId}`
    const result = await awardXP(userId, 'improvement', improvementXP, {
      chapter_id: chapterId,
      improvement_points: improvement,
      from_score: baseline,
      to_score: score,
      assessment_id: assessmentId,
    }, eventKey)
    xpAwarded = result.xpAwarded
  }

  await supabase
    .from('chapter_skill_scores')
    .update({
      score_after: score,
      improvement: skillData.score_before - score,
      best_score: Math.min(skillData.best_score ?? score, score),
      updated_at: new Date().toISOString()
    })
    .eq('id', skillData.id)

  return {
    improvement: skillData.score_before - score,
    xpAwarded
  }
}

export async function getChapterSkillScore(userId: string, chapterId: number) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('chapter_skill_scores')
    .select('*')
    .eq('user_id', userId)
    .eq('chapter_id', chapterId)
    .single()
  
  return { data, error }
}

export async function getAllChapterSkillScores(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('chapter_skill_scores')
    .select('*')
    .eq('user_id', userId)
    .order('chapter_id', { ascending: true })
  
  return { data, error }
}

// ============================================================================
// XP LOGS & HISTORY
// ============================================================================

export async function getRecentXPLogs(userId: string, limit: number = 10) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('xp_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  return { data, error }
}

export async function getTodaysXPLogs(userId: string, reason?: XPReason) {
  const supabase = await createClient()
  
  const today = new Date().toISOString().split('T')[0]
  
  let query = supabase
    .from('xp_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', `${today}T00:00:00Z`)
    .lte('created_at', `${today}T23:59:59Z`)
  
  if (reason) {
    query = query.eq('reason', reason)
  }
  
  const { data, error } = await query
  
  return { data, error }
}

// ============================================================================
// STREAK HISTORY
// ============================================================================

export async function getStreakHistory(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('streak_history')
    .select('*')
    .eq('user_id', userId)
    .order('achieved_at', { ascending: false })
  
  return { data, error }
}

// ============================================================================
// WEEKLY REPORTS DATA
// ============================================================================

export async function getWeeklyReportsData(userId: string) {
  const supabase = await createClient()

  // Build 4 weeks: [4w ago, 3w ago, 2w ago, this week] using UTC day boundaries
  const now = new Date()
  const weeks: { start: string; end: string }[] = []
  for (let i = 3; i >= 0; i--) {
    const weekEndDate = new Date(now)
    weekEndDate.setUTCDate(now.getUTCDate() - (i * 7))
    const weekStartDate = new Date(weekEndDate)
    weekStartDate.setUTCDate(weekEndDate.getUTCDate() - 6)
    const startStr = weekStartDate.toISOString().slice(0, 10) + 'T00:00:00.000Z'
    const endStr = weekEndDate.toISOString().slice(0, 10) + 'T23:59:59.999Z'
    weeks.push({ start: startStr, end: endStr })
  }

  // Get XP logs for last 28 days
  const startDate = weeks[0].start
  const { data: xpLogs } = await supabase
    .from('xp_logs')
    .select('amount, created_at')
    .eq('user_id', userId)
    .gte('created_at', startDate)
    .order('created_at', { ascending: true })

  // Group by week
  const weeklyXP = weeks.map(week => {
    const weekLogs = xpLogs?.filter(log => {
      const created = log.created_at
      return created >= week.start && created <= week.end
    }) || []
    return weekLogs.reduce((sum, log) => sum + log.amount, 0)
  })

  // XP this week = last 7 days (weeks[3])
  const xpThisWeek = weeklyXP[3] ?? 0
  
  // Skill improvement (sum of all positive improvements)
  const { data: skillScores } = await supabase
    .from('chapter_skill_scores')
    .select('improvement')
    .eq('user_id', userId)
  
  const totalImprovement = skillScores?.reduce((sum, s) => 
    sum + Math.max(0, s.improvement || 0), 0
  ) || 0
  
  return {
    xpThisWeek,
    skillImprovement: totalImprovement,
    weeklyXPData: weeklyXP, // [week1, week2, week3, week4]
  }
}

/** 7 weeks of XP data for Report page graph (6w ago ... This Week) */
export async function getReportWeeklyData(userId: string) {
  const supabase = await createClient()
  const now = new Date()
  const weeks: { start: string; end: string }[] = []
  for (let i = 6; i >= 0; i--) {
    const weekEndDate = new Date(now)
    weekEndDate.setUTCDate(now.getUTCDate() - (i * 7))
    const weekStartDate = new Date(weekEndDate)
    weekStartDate.setUTCDate(weekEndDate.getUTCDate() - 6)
    weeks.push({
      start: weekStartDate.toISOString().slice(0, 10) + 'T00:00:00.000Z',
      end: weekEndDate.toISOString().slice(0, 10) + 'T23:59:59.999Z',
    })
  }
  const startDate = weeks[0].start
  const { data: xpLogs } = await supabase
    .from('xp_logs')
    .select('amount, created_at')
    .eq('user_id', userId)
    .gte('created_at', startDate)
  const weeklyXP = weeks.map((week) => {
    const weekLogs =
      xpLogs?.filter(
        (log) => log.created_at >= week.start && log.created_at <= week.end
      ) || []
    return weekLogs.reduce((sum, log) => sum + log.amount, 0)
  })
  return weeklyXP
}

/** XP breakdown by reason for a chapter (completion, streak, improvement, etc.) */
export async function getChapterXPBreakdown(userId: string, chapterId: number) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('xp_logs')
    .select('reason, amount')
    .eq('user_id', userId)
    .eq('chapter_id', chapterId)
  const byReason: Record<string, number> = {}
  for (const row of data || []) {
    const r = row.reason || 'other'
    byReason[r] = (byReason[r] ?? 0) + (row.amount ?? 0)
  }
  return byReason
}

// ============================================================================
// CHAPTER REPORTS DATA
// ============================================================================

const SECTION_BLOCKS = ['reading', 'assessment', 'framework', 'techniques', 'proof', 'follow_through'] as const

export async function getChapterReportsData(userId: string) {
  const supabase = await createClient()

  const { data: progressRows } = await supabase
    .from('chapter_progress')
    .select('chapter_id, reading_complete, assessment_complete, framework_complete, techniques_complete, proof_complete, follow_through_complete')
    .eq('user_id', userId)
    .order('chapter_id', { ascending: true })

  const { data: xpLogs } = await supabase
    .from('xp_logs')
    .select('amount, chapter_id')
    .eq('user_id', userId)
    .not('chapter_id', 'is', null)

  const xpByChapter: Record<number, number> = {}
  for (const log of xpLogs || []) {
    const cid = log.chapter_id as number
    if (cid) {
      xpByChapter[cid] = (xpByChapter[cid] ?? 0) + (log.amount ?? 0)
    }
  }

  const chapters = (progressRows || []).map(row => {
    const completed = SECTION_BLOCKS.filter(b => row[`${b}_complete`] === true).length
    const total = SECTION_BLOCKS.length
    const xp = xpByChapter[row.chapter_id] ?? 0
    return {
      chapter_id: row.chapter_id,
      title: `Chapter ${row.chapter_id}`,
      completed: `${completed}/${total}`,
      completedCount: completed,
      totalSections: total,
      xp,
    }
  })

  return chapters
}

// Note: pure math helpers now live in '@/lib/gamification/math'
