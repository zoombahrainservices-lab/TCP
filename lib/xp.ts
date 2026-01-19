/**
 * XP Points System - Updated for Zone → Chapter → Phase structure
 * Calculates and manages experience points for completed phases
 * Now includes level calculation and database integration
 */

import { XP_CONFIG } from '@/config/xp'

const BASE_XP_PER_PHASE = XP_CONFIG.XP_PER_PHASE
const CHAPTER_COMPLETION_BONUS = XP_CONFIG.XP_PER_MISSION
const ZONE_COMPLETION_BONUS = XP_CONFIG.XP_PER_ZONE
const PERFECT_SCORE_BONUS = XP_CONFIG.XP_PERFECT_SCORE_BONUS

export interface XPResult {
  baseXP: number
  bonuses: {
    chapterCompletion?: number
    zoneCompletion?: number
    perfectScore?: number
  }
  totalXP: number
  message: string
}

export interface LevelProgress {
  level: number
  currentLevelXp: number
  nextLevelXp: number
  progress: number // 0-1
  xpNeeded: number
}

/**
 * Calculate XP earned for completing a phase
 */
export function calculateXPForPhase(
  completed: boolean,
  beforeAnswers?: Array<{ answer: number }>,
  afterAnswers?: Array<{ answer: number }>,
  isChapterComplete?: boolean,
  isZoneComplete?: boolean
): XPResult {
  let totalXP = BASE_XP_PER_PHASE
  const bonuses: XPResult['bonuses'] = {}
  const messages: string[] = [`Earned ${BASE_XP_PER_PHASE} XP`]

  // Chapter completion bonus (all 5 phases done)
  if (isChapterComplete) {
    totalXP += CHAPTER_COMPLETION_BONUS
    bonuses.chapterCompletion = CHAPTER_COMPLETION_BONUS
    messages.push(`+${CHAPTER_COMPLETION_BONUS} XP for completing chapter`)
  }

  // Zone completion bonus (all chapters in zone done)
  if (isZoneComplete) {
    totalXP += ZONE_COMPLETION_BONUS
    bonuses.zoneCompletion = ZONE_COMPLETION_BONUS
    messages.push(`+${ZONE_COMPLETION_BONUS} XP for completing zone!`)
  }

  // Perfect score bonus (all 5s or all 7s)
  const allPerfectBefore = beforeAnswers?.every(a => a.answer === 5 || a.answer === 7) ?? false
  const allPerfectAfter = afterAnswers?.every(a => a.answer === 5 || a.answer === 7) ?? false

  if (allPerfectBefore || allPerfectAfter) {
    totalXP += PERFECT_SCORE_BONUS
    bonuses.perfectScore = PERFECT_SCORE_BONUS
    messages.push(`+${PERFECT_SCORE_BONUS} XP bonus for perfect score`)
  }

  return {
    baseXP: BASE_XP_PER_PHASE,
    bonuses,
    totalXP,
    message: `You earned ${totalXP} XP! ${messages.slice(1).join(' ')}`
  }
}

/**
 * Calculate level from XP
 * Formula: level = floor(sqrt(xp / 100)) + 1
 * Level 1: 0-99 XP, Level 2: 100-399 XP, Level 3: 400-899 XP, etc.
 */
export function getLevelFromXp(xp: number): number {
  if (xp <= 0) return 1
  return Math.floor(Math.sqrt(xp / 100)) + 1
}

/**
 * Get XP needed for a specific level
 * Level 1 = 0 XP, Level 2 = 100 XP, Level 3 = 400 XP, etc.
 */
export function getXpForLevel(level: number): number {
  if (level <= 1) return 0
  return Math.pow(level - 1, 2) * 100
}

/**
 * Get XP needed for next level
 */
export function getXpForNextLevel(level: number): number {
  return Math.pow(level, 2) * 100
}

/**
 * Get level progress information
 */
export function getLevelProgress(xp: number): LevelProgress {
  const level = getLevelFromXp(xp)
  const currentLevelXp = getXpForLevel(level)
  const nextLevelXp = getXpForNextLevel(level)
  const span = nextLevelXp - currentLevelXp
  const gainedInLevel = xp - currentLevelXp
  const progress = span === 0 ? 0 : Math.max(0, Math.min(1, gainedInLevel / span))
  const xpNeeded = nextLevelXp - xp

  return {
    level,
    currentLevelXp,
    nextLevelXp,
    progress,
    xpNeeded: Math.max(0, xpNeeded),
  }
}

/**
 * Get total XP from localStorage (DEPRECATED - use database)
 * Kept for backward compatibility during migration
 */
export function getTotalXP(studentId: string): number {
  if (typeof window === 'undefined') return 0

  try {
    const stored = localStorage.getItem(`xp_${studentId}`)
    return stored ? parseInt(stored, 10) : 0
  } catch {
    return 0
  }
}

/**
 * Add XP and store in localStorage (DEPRECATED - use database)
 * Kept for backward compatibility during migration
 */
export function addXP(studentId: string, xp: number): void {
  if (typeof window === 'undefined') return

  try {
    const current = getTotalXP(studentId)
    const newTotal = current + xp
    localStorage.setItem(`xp_${studentId}`, newTotal.toString())
  } catch (err) {
    console.error('Failed to save XP:', err)
  }
}

/**
 * Calculate expected total XP for number of phases completed
 * Useful for validation and displaying potential XP
 */
export function calculateExpectedXP(
  completedPhases: number,
  completedChapters: number,
  completedZones: number
): number {
  const baseXP = completedPhases * BASE_XP_PER_PHASE
  const chapterBonuses = completedChapters * CHAPTER_COMPLETION_BONUS
  const zoneBonuses = completedZones * ZONE_COMPLETION_BONUS
  
  return baseXP + chapterBonuses + zoneBonuses
}
