'use client'

import { useCelebrationStore } from './store'
import type { CelebrationPayload, SectionKey } from './types'
import { toast } from 'react-hot-toast'
import { Sparkles } from 'lucide-react'

// Re-export types for backward compatibility
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
  oldLevel: number
  newLevel: number
  leveledUp: boolean
  multiplierApplied?: boolean
  alreadyAwarded?: boolean
  reasonCode?: XPReasonCode
}

export interface StreakResult {
  streakContinued: boolean
  currentStreak: number
  milestoneReached?: number
  bonusXP?: number
  alreadyActiveToday?: boolean
  xpAwarded?: number
  reasonCodes?: XPReasonCode[]
  dailyXP?: number
  streakBonus?: number
  milestone?: {
    days: number
    bonusXP: number
  }
}

export interface CelebrationOptions {
  xpResult?: XPResult | null
  reasonCode?: XPReasonCode
  streakResult?: StreakResult | null
  chapterCompleted?: boolean
  title: string
}

// Helper to derive section key from title
function deriveSectionKey(title: string): SectionKey {
  const titleLower = title.toLowerCase()
  if (titleLower.includes('reading')) return 'reading'
  if (titleLower.includes('self') || titleLower.includes('check') || titleLower.includes('assessment')) return 'assessment'
  if (titleLower.includes('framework')) return 'framework'
  if (titleLower.includes('technique')) return 'techniques'
  if (titleLower.includes('proof') || titleLower.includes('resolution')) return 'proof'
  if (titleLower.includes('follow')) return 'follow_through'
  return 'reading' // fallback
}

// Simple toast for minimal cases
function showSimpleToast(message: string, description?: string) {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <Sparkles className="h-6 w-6 text-purple-500" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {message}
            </p>
            {description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  ), {
    duration: 3000,
    position: 'top-center',
  })
}

// Main celebration orchestrator
export function celebrateSectionCompletion(options: CelebrationOptions) {
  const { xpResult, reasonCode, streakResult, title, chapterCompleted } = options
  
  // Repeat completion - keep as simple toast (no fullscreen)
  if (reasonCode === 'repeat_completion' || reasonCode === 'already_awarded') {
    showSimpleToast('Completed again 💪', 'No XP (already completed)')
    return
  }
  
  const store = useCelebrationStore.getState()
  const payloads: CelebrationPayload[] = []
  
  // Priority 1: Level-up (mega)
  if (xpResult?.leveledUp) {
    payloads.push({
      type: 'levelup',
      title: 'LEVEL UP!',
      subtitle: `Level ${xpResult.newLevel}`,
      newLevel: xpResult.newLevel,
      intensity: 'mega',
      autoCloseMs: 2800
    })
  }
  
  // Priority 2: Chapter complete (mega)
  if (chapterCompleted) {
    payloads.push({
      type: 'chapter',
      title: 'Chapter Complete!',
      subtitle: '6/6 Sections Mastered',
      xp: xpResult?.xpAwarded,
      intensity: 'mega',
      autoCloseMs: 3000
    })
  }
  
  // Priority 3: Streak milestone (big)
  if (streakResult?.milestoneReached) {
    payloads.push({
      type: 'streak',
      title: `🔥 ${streakResult.milestoneReached}-day Streak!`,
      bonusXp: streakResult.bonusXP,
      streakDays: streakResult.milestoneReached,
      intensity: 'big',
      autoCloseMs: 2400
    })
  } else if (streakResult?.milestone) {
    // Legacy format support
    payloads.push({
      type: 'streak',
      title: `🔥 ${streakResult.milestone.days}-day Streak!`,
      bonusXp: streakResult.milestone.bonusXP,
      streakDays: streakResult.milestone.days,
      intensity: 'big',
      autoCloseMs: 2400
    })
  }
  
  // Priority 4: Section completion (micro)
  if (xpResult?.xpAwarded && xpResult.xpAwarded > 0) {
    payloads.push({
      type: 'section',
      sectionKey: deriveSectionKey(title),
      title: title,
      xp: xpResult.xpAwarded,
      intensity: 'micro',
      autoCloseMs: 1600
    })
  }
  
  // Enqueue all (max 3)
  payloads.slice(0, 3).forEach(payload => store.enqueue(payload))
  
  // Handle small daily/streak XP with minimal toast (only if no fullscreen celebration)
  if (payloads.length === 0) {
    const dailyXP = streakResult?.dailyXP ?? 0
    const streakBonus = streakResult?.streakBonus ?? 0
    
    if (dailyXP > 0 && streakBonus > 0) {
      showSimpleToast('Daily Activity', `+${dailyXP} XP • +${streakBonus} XP streak bonus`)
    } else if (dailyXP > 0) {
      showSimpleToast('Daily Activity', `+${dailyXP} XP`)
    } else if (streakBonus > 0) {
      showSimpleToast('Streak Bonus', `+${streakBonus} XP`)
    }
  }
}

// Export for testing/debugging
export function resetCelebrationQueue() {
  const store = useCelebrationStore.getState()
  // Clear the queue
  useCelebrationStore.setState({ queue: [], current: null, open: false })
}
