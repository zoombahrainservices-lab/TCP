export type XpSystemVersion = 'v1' | 'v2'

/**
 * XP configuration for the Zone → Mission(Chapter) → Phase structure.
 *
 * Adjust values here to rebalance progression without touching award logic.
 */
export const XP_CONFIG = {
  /** Feature flag for rollout (v1 = current direct write, v2 = ledger-based). */
  XP_SYSTEM_VERSION: (process.env.XP_SYSTEM_VERSION as XpSystemVersion) ?? 'v2',

  /** P: XP per phase completion. */
  XP_PER_PHASE: 20,

  /** M: XP bonus on mission (chapter) completion (all 5 phases). */
  XP_PER_MISSION: 50,

  /** Z: XP bonus on zone completion (all missions in zone). */
  XP_PER_ZONE: 200,

  /** Bonus for perfect scores (kept from v1 behavior). */
  XP_PERFECT_SCORE_BONUS: 25,

  /** Structure constants. */
  PHASES_PER_MISSION: 5,
  TOTAL_MISSIONS: 30,
  TOTAL_PHASES: 150,

  /**
   * Missions per zone.
   * Based on current product structure (Zone 1-4: 7 missions; Zone 5: 2 missions).
   */
  MISSIONS_PER_ZONE: [7, 7, 7, 7, 2] as const,
} as const

