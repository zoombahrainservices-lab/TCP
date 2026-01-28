/**
 * Pure helper functions for Zone → Chapter → Phase progress computation
 * These functions implement the unlock rules without database calls
 */

// Types for pure computation
export interface PhaseNode {
  id: number
  zoneNumber: number
  chapterNumber: number
  phaseNumber: number
  zoneId: number
  chapterId: number
}

export interface UnlockState {
  isUnlocked: boolean
  isCompleted: boolean
  isCurrent: boolean
}

export type UnlockMap = Map<number, UnlockState> // phaseId -> state

/**
 * Compute unlock states for all phases given completion data
 * Implements the exact rules:
 * - Zone unlock: Zone 1 always, others require previous zone complete
 * - Chapter unlock: All earlier chapters in same zone must be complete
 * - Phase unlock: All earlier phases in same chapter must be complete
 */
export function computeUnlockStates(
  phases: PhaseNode[],
  completedPhaseIds: Set<number>
): UnlockMap {
  const unlockMap = new Map<number, UnlockState>()

  // Sort phases by zone, chapter, phase number
  const sortedPhases = [...phases].sort((a, b) => {
    if (a.zoneNumber !== b.zoneNumber) return a.zoneNumber - b.zoneNumber
    if (a.chapterNumber !== b.chapterNumber) return a.chapterNumber - b.chapterNumber
    return a.phaseNumber - b.phaseNumber
  })

  // Track completion by zone and chapter for efficient lookup
  const zoneCompletion = new Map<number, boolean>()
  const chapterCompletion = new Map<string, boolean>()

  for (const phase of sortedPhases) {
    const isCompleted = completedPhaseIds.has(phase.id)

    // Check if zone is unlocked
    let zoneUnlocked = false
    if (phase.zoneNumber === 1) {
      zoneUnlocked = true
    } else {
      // Check if previous zone is complete
      const previousZone = phase.zoneNumber - 1
      const previousZoneComplete = zoneCompletion.get(previousZone) ?? false
      zoneUnlocked = previousZoneComplete
    }

    // Check if chapter is unlocked (requires zone unlocked + all earlier chapters in zone complete)
    let chapterUnlocked = false
    if (!zoneUnlocked) {
      chapterUnlocked = false
    } else if (phase.chapterNumber === 1) {
      chapterUnlocked = true
    } else {
      // Check if all earlier chapters in this zone are complete
      let allEarlierChaptersComplete = true
      for (const p of sortedPhases) {
        if (p.zoneId === phase.zoneId && p.chapterNumber < phase.chapterNumber) {
          const chapterKey = `${p.zoneId}-${p.chapterNumber}`
          if (!chapterCompletion.get(chapterKey)) {
            allEarlierChaptersComplete = false
            break
          }
        }
      }
      chapterUnlocked = allEarlierChaptersComplete
    }

    // Check if phase is unlocked (requires chapter unlocked + previous phase in chapter complete)
    let phaseUnlocked = false
    if (!chapterUnlocked) {
      phaseUnlocked = false
    } else if (phase.phaseNumber === 1) {
      phaseUnlocked = true
    } else {
      // Check if previous phase in same chapter is complete
      const previousPhase = sortedPhases.find(
        p => p.chapterId === phase.chapterId && p.phaseNumber === phase.phaseNumber - 1
      )
      phaseUnlocked = previousPhase ? completedPhaseIds.has(previousPhase.id) : false
    }

    unlockMap.set(phase.id, {
      isUnlocked: phaseUnlocked,
      isCompleted,
      isCurrent: false, // Will be set by findCurrentMission
    })

    // Update chapter completion tracking
    // A chapter is complete when all its phases are complete
    const chapterPhases = sortedPhases.filter(p => p.chapterId === phase.chapterId)
    const allChapterPhasesComplete = chapterPhases.every(p => 
      p.id === phase.id ? isCompleted : completedPhaseIds.has(p.id)
    )
    if (allChapterPhasesComplete && chapterPhases.length > 0) {
      const chapterKey = `${phase.zoneId}-${phase.chapterNumber}`
      chapterCompletion.set(chapterKey, true)
    }

    // Update zone completion tracking
    // A zone is complete when all its chapters are complete
    const zoneChapters = sortedPhases
      .filter(p => p.zoneId === phase.zoneId)
      .map(p => p.chapterNumber)
      .filter((v, i, a) => a.indexOf(v) === i) // unique chapter numbers

    const allZoneChaptersComplete = zoneChapters.every(chapterNum => {
      const chapterKey = `${phase.zoneId}-${chapterNum}`
      return chapterCompletion.get(chapterKey) ?? false
    })

    if (allZoneChaptersComplete && zoneChapters.length > 0) {
      zoneCompletion.set(phase.zoneNumber, true)
    }
  }

  return unlockMap
}

/**
 * Find the current mission (first unlocked but incomplete phase)
 * Ordered by: zone_number, chapter_number, phase_number
 */
export function findCurrentMission(
  phases: PhaseNode[],
  unlockMap: UnlockMap
): PhaseNode | null {
  // Sort phases by zone, chapter, phase number
  const sortedPhases = [...phases].sort((a, b) => {
    if (a.zoneNumber !== b.zoneNumber) return a.zoneNumber - b.zoneNumber
    if (a.chapterNumber !== b.chapterNumber) return a.chapterNumber - b.chapterNumber
    return a.phaseNumber - b.phaseNumber
  })

  // Find first unlocked but incomplete phase
  for (const phase of sortedPhases) {
    const state = unlockMap.get(phase.id)
    if (state && state.isUnlocked && !state.isCompleted) {
      // Mark as current in the map
      unlockMap.set(phase.id, { ...state, isCurrent: true })
      return phase
    }
  }

  return null
}

/**
 * Helper to check if a specific phase is unlocked
 * Useful for validation in server actions
 */
export function isPhaseUnlockedInMap(
  phaseId: number,
  unlockMap: UnlockMap
): boolean {
  const state = unlockMap.get(phaseId)
  return state?.isUnlocked ?? false
}

/**
 * Get aggregate statistics from phase nodes and unlock map
 */
export function getProgressStats(
  phases: PhaseNode[],
  unlockMap: UnlockMap
): {
  totalPhases: number
  completedPhases: number
  totalChapters: number
  completedChapters: number
  totalZones: number
  completedZones: number
  completionPercentage: number
} {
  const totalPhases = phases.length
  const completedPhases = phases.filter(p => unlockMap.get(p.id)?.isCompleted).length

  // Count unique chapters
  const uniqueChapters = new Map<number, boolean>()
  phases.forEach(p => {
    const chapterKey = p.chapterId
    if (!uniqueChapters.has(chapterKey)) {
      // Check if all phases in this chapter are complete
      const chapterPhases = phases.filter(ph => ph.chapterId === p.chapterId)
      const allComplete = chapterPhases.every(ph => unlockMap.get(ph.id)?.isCompleted)
      uniqueChapters.set(chapterKey, allComplete)
    }
  })
  const totalChapters = uniqueChapters.size
  const completedChapters = Array.from(uniqueChapters.values()).filter(Boolean).length

  // Count unique zones
  const uniqueZones = new Map<number, boolean>()
  phases.forEach(p => {
    const zoneKey = p.zoneId
    if (!uniqueZones.has(zoneKey)) {
      // Check if all chapters in this zone are complete
      const zoneChapters = Array.from(
        new Set(phases.filter(ph => ph.zoneId === p.zoneId).map(ph => ph.chapterId))
      )
      const allChaptersComplete = zoneChapters.every(chapterId => {
        const chapterPhases = phases.filter(ph => ph.chapterId === chapterId)
        return chapterPhases.every(ph => unlockMap.get(ph.id)?.isCompleted)
      })
      uniqueZones.set(zoneKey, allChaptersComplete)
    }
  })
  const totalZones = uniqueZones.size
  const completedZones = Array.from(uniqueZones.values()).filter(Boolean).length

  const completionPercentage = totalPhases > 0 
    ? Math.round((completedPhases / totalPhases) * 100)
    : 0

  return {
    totalPhases,
    completedPhases,
    totalChapters,
    completedChapters,
    totalZones,
    completedZones,
    completionPercentage,
  }
}
