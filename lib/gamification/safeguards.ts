'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { XPReason } from '@/app/actions/gamification'

// ============================================================================
// DAILY XP CAPS
// ============================================================================

/**
 * Apply daily XP cap to prevent grinding
 * Returns the amount of XP that can still be awarded today
 */
export async function applyDailyXPCap(
  userId: string,
  reason: XPReason,
  proposedAmount: number
): Promise<number> {
  const supabase = createAdminClient()
  
  // Get today's XP logs for this reason
  const today = new Date().toISOString().split('T')[0]
  
  const { data: todaysLogs } = await supabase
    .from('xp_logs')
    .select('amount')
    .eq('user_id', userId)
    .eq('reason', reason)
    .gte('created_at', `${today}T00:00:00Z`)
    .lte('created_at', `${today}T23:59:59Z`)
  
  const totalToday = todaysLogs?.reduce((sum, log) => sum + log.amount, 0) || 0
  
  // Define caps per reason
  const dailyCaps: Record<XPReason, number> = {
    'section_completion': 120, // Max 6 sections per day (20 XP each)
    'daily_activity': 20, // Only once per day
    'chapter_completion': 200, // Max 2-3 chapters per day
    'improvement': 100, // Cap improvement XP per day
    'streak_bonus': 1000, // High cap for milestones
    'milestone': 1000 // High cap for special events
  }
  
  const cap = dailyCaps[reason]
  const remainingCap = Math.max(0, cap - totalToday)
  
  return Math.min(proposedAmount, remainingCap)
}

// ============================================================================
// DUPLICATE AWARD PREVENTION
// ============================================================================

/**
 * Check if XP has already been awarded for this specific action
 * Returns true if duplicate found
 */
export async function checkDuplicateAward(
  userId: string,
  reason: XPReason,
  referenceId?: string
): Promise<boolean> {
  if (!referenceId) return false
  
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('xp_logs')
    .select('id')
    .eq('user_id', userId)
    .eq('reason', reason)
    .contains('metadata', { reference_id: referenceId })
    .single()
  
  return !!data // True if duplicate found
}

// ============================================================================
// REPEAT CHAPTER PENALTY
// ============================================================================

/**
 * Apply diminishing returns on repeating same chapter
 * First time: 100%, Second time: 50%, Third+ time: 25%
 */
export async function applyRepeatPenalty(
  userId: string,
  chapterId: number,
  baseXP: number
): Promise<number> {
  const completionCount = await getChapterCompletionCount(userId, chapterId)
  
  if (completionCount === 0) return baseXP // First time: full XP
  if (completionCount === 1) return Math.floor(baseXP * 0.5) // Second time: 50%
  return Math.floor(baseXP * 0.25) // Third+ time: 25%
}

/**
 * Get number of times user has completed a chapter
 */
export async function getChapterCompletionCount(
  userId: string,
  chapterId: number
): Promise<number> {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('xp_logs')
    .select('id')
    .eq('user_id', userId)
    .eq('reason', 'chapter_completion')
    .eq('chapter_id', chapterId)
  
  return data?.length || 0
}

// ============================================================================
// STEP COMPLETION RATE LIMITING
// ============================================================================

/**
 * Check if user is completing steps too quickly (potential bot)
 * Returns true if rate is suspicious
 */
export async function checkSuspiciousStepRate(
  userId: string,
  timeWindowMinutes: number = 5,
  maxStepsInWindow: number = 10
): Promise<boolean> {
  const supabase = createAdminClient()
  
  const windowStart = new Date()
  windowStart.setMinutes(windowStart.getMinutes() - timeWindowMinutes)
  
  const { data } = await supabase
    .from('step_completions')
    .select('id')
    .eq('user_id', userId)
    .gte('completed_at', windowStart.toISOString())
  
  return (data?.length || 0) > maxStepsInWindow
}

// ============================================================================
// XP VELOCITY MONITORING
// ============================================================================

/**
 * Track XP gained in the last hour to detect anomalies
 * Returns XP gained in the last hour
 */
export async function getRecentXPVelocity(
  userId: string,
  hoursBack: number = 1
): Promise<number> {
  const supabase = createAdminClient()
  
  const windowStart = new Date()
  windowStart.setHours(windowStart.getHours() - hoursBack)
  
  const { data } = await supabase
    .from('xp_logs')
    .select('amount')
    .eq('user_id', userId)
    .gte('created_at', windowStart.toISOString())
  
  return data?.reduce((sum, log) => sum + log.amount, 0) || 0
}

/**
 * Check if XP velocity is suspicious (potential exploit)
 * Returns true if velocity exceeds reasonable limits
 */
export async function checkSuspiciousXPVelocity(
  userId: string
): Promise<boolean> {
  const xpLastHour = await getRecentXPVelocity(userId, 1)
  
  // Maximum reasonable XP per hour: ~200
  // (10 daily activity + 6 sections * 20 + some bonuses)
  const MAX_XP_PER_HOUR = 300
  
  return xpLastHour > MAX_XP_PER_HOUR
}

// ============================================================================
// COMPREHENSIVE VALIDATION
// ============================================================================

/**
 * Validate XP award before processing
 * Returns validated amount or 0 if invalid
 */
export async function validateXPAward(
  userId: string,
  reason: XPReason,
  amount: number,
  metadata?: Record<string, any>
): Promise<{
  valid: boolean
  validatedAmount: number
  reason?: string
}> {
  // Check for negative or zero XP
  if (amount <= 0) {
    return {
      valid: false,
      validatedAmount: 0,
      reason: 'XP amount must be positive'
    }
  }
  
  // Check for suspiciously large single award
  if (amount > 500) {
    return {
      valid: false,
      validatedAmount: 0,
      reason: 'Single XP award exceeds maximum (500)'
    }
  }
  
  // Check for duplicate awards
  if (metadata?.reference_id) {
    const isDuplicate = await checkDuplicateAward(
      userId,
      reason,
      metadata.reference_id
    )
    
    if (isDuplicate) {
      return {
        valid: false,
        validatedAmount: 0,
        reason: 'Duplicate award detected'
      }
    }
  }
  
  // Check suspicious XP velocity
  const suspiciousVelocity = await checkSuspiciousXPVelocity(userId)
  if (suspiciousVelocity) {
    return {
      valid: false,
      validatedAmount: 0,
      reason: 'XP velocity exceeds safe limits'
    }
  }
  
  // Apply daily cap
  const cappedAmount = await applyDailyXPCap(userId, reason, amount)
  
  if (cappedAmount === 0) {
    return {
      valid: false,
      validatedAmount: 0,
      reason: 'Daily XP cap reached for this activity'
    }
  }
  
  // Apply repeat penalty if chapter completion
  let finalAmount = cappedAmount
  if (reason === 'chapter_completion' && metadata?.chapter_id) {
    finalAmount = await applyRepeatPenalty(
      userId,
      metadata.chapter_id,
      cappedAmount
    )
  }
  
  return {
    valid: true,
    validatedAmount: finalAmount
  }
}

// ============================================================================
// COOLDOWN MANAGEMENT
// ============================================================================

/**
 * Check if user is in cooldown for specific action
 */
export async function checkCooldown(
  userId: string,
  action: string,
  cooldownMinutes: number
): Promise<boolean> {
  const supabase = createAdminClient()
  
  const cooldownStart = new Date()
  cooldownStart.setMinutes(cooldownStart.getMinutes() - cooldownMinutes)
  
  const { data } = await supabase
    .from('xp_logs')
    .select('id')
    .eq('user_id', userId)
    .contains('metadata', { action })
    .gte('created_at', cooldownStart.toISOString())
    .single()
  
  return !!data // True if in cooldown
}
