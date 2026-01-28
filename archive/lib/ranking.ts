export interface RankInfo {
  name: string
  icon: string
  nextRank: string | null
  progressToNext: number // percentage to next rank (0-100)
}

/**
 * Calculate rank based on completed phases (NEW: 0-150 scale)
 * Ranks: Novice (0-25), Apprentice (26-50), Adept (51-100), Expert (101-140), Master (141-150)
 */
export function getRank(completedPhases: number): RankInfo {
  if (completedPhases >= 141) {
    return {
      name: 'Master',
      icon: '👑',
      nextRank: null,
      progressToNext: 100
    }
  }
  
  if (completedPhases >= 101) {
    const progressInRank = completedPhases - 101
    const rankSize = 40 // 101-140 is 40 phases
    return {
      name: 'Expert',
      icon: '⭐',
      nextRank: 'Master',
      progressToNext: Math.round((progressInRank / rankSize) * 100)
    }
  }
  
  if (completedPhases >= 51) {
    const progressInRank = completedPhases - 51
    const rankSize = 50 // 51-100 is 50 phases
    return {
      name: 'Adept',
      icon: '🎯',
      nextRank: 'Expert',
      progressToNext: Math.round((progressInRank / rankSize) * 100)
    }
  }
  
  if (completedPhases >= 26) {
    const progressInRank = completedPhases - 26
    const rankSize = 25 // 26-50 is 25 phases
    return {
      name: 'Apprentice',
      icon: '🌱',
      nextRank: 'Adept',
      progressToNext: Math.round((progressInRank / rankSize) * 100)
    }
  }
  
  // Novice Agent (0-25)
  const progressInRank = completedPhases
  const rankSize = 26 // 0-25 is 26 phases
  return {
    name: 'Novice Agent',
    icon: '🌱',
    nextRank: 'Apprentice',
    progressToNext: Math.round((progressInRank / rankSize) * 100)
  }
}
