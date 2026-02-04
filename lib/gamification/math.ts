// Shared gamification math helpers - used by both server actions and client
// from both client and server code.

export function calculateLevel(xp: number): number {
  if (xp <= 0) return 1
  // Level 1: 0-100, Level 2: 100-250, Level 3: 250-500, etc.
  return Math.floor(Math.pow(xp / 100, 0.45)) + 1
}

export function getStreakMultiplier(streak: number): number {
  if (streak >= 20) return 2.0
  if (streak >= 10) return 1.5
  if (streak >= 5) return 1.2
  return 1.0
}

export function getStreakMilestoneBonus(milestone: number): number {
  const bonuses: Record<number, number> = {
    3: 20,
    7: 50,
    30: 200,
    100: 500,
  }
  return bonuses[milestone] || 0
}

export function getLevelThreshold(level: number): number {
  if (level <= 1) return 0
  // Inverse of calculateLevel formula
  return Math.floor(100 * Math.pow(level - 1, 2.22))
}

export function getXPForNextLevel(currentLevel: number): number {
  return getLevelThreshold(currentLevel + 1)
}

export function getChapterMultiplier(chapterId: number): number {
  // Chapter 1: 1.0x, Chapter 2: 1.06x, Chapter 5: 1.24x, etc.
  return 1.0 + (chapterId - 1) * 0.06
}

