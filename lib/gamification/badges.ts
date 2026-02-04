'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ============================================================================
// TYPES
// ============================================================================

export interface Badge {
  id: number
  badge_key: string
  name: string
  description: string | null
  icon: string | null
  requirement_type: string | null
  requirement_value: number | null
  created_at: string
}

export interface UserBadge {
  id: number
  user_id: string
  badge_id: number
  awarded_at: string
  badge?: Badge
}

// ============================================================================
// BADGE QUERIES
// ============================================================================

/**
 * Get all available badges
 */
export async function getAllBadges(): Promise<Badge[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .order('requirement_value', { ascending: true })
  
  if (error) {
    console.error('Error fetching badges:', error)
    return []
  }
  
  return data || []
}

/**
 * Get user's earned badges
 */
export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_badges')
    .select(`
      *,
      badge:badges(*)
    `)
    .eq('user_id', userId)
    .order('awarded_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching user badges:', error)
    return []
  }
  
  return data || []
}

/**
 * Check if user has a specific badge
 */
export async function hasBadge(
  userId: string,
  badgeKey: string
): Promise<boolean> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('user_badges')
    .select(`
      id,
      badge:badges!inner(badge_key)
    `)
    .eq('user_id', userId)
    .eq('badges.badge_key', badgeKey)
    .single()
  
  return !!data
}

// ============================================================================
// BADGE AWARDING
// ============================================================================

/**
 * Award a badge to a user
 */
export async function awardBadge(
  userId: string,
  badgeKey: string
): Promise<{ success: boolean; badge?: Badge; error?: string }> {
  const supabase = createAdminClient()
  
  try {
    // Check if badge exists
    const { data: badge, error: badgeError } = await supabase
      .from('badges')
      .select('*')
      .eq('badge_key', badgeKey)
      .single()
    
    if (badgeError || !badge) {
      return { success: false, error: 'Badge not found' }
    }
    
    // Check if user already has this badge
    const alreadyHas = await hasBadge(userId, badgeKey)
    if (alreadyHas) {
      return { success: false, error: 'Badge already earned' }
    }
    
    // Award the badge
    const { error: awardError } = await supabase
      .from('user_badges')
      .insert({
        user_id: userId,
        badge_id: badge.id,
        awarded_at: new Date().toISOString()
      })
    
    if (awardError) {
      console.error('Error awarding badge:', awardError)
      return { success: false, error: 'Failed to award badge' }
    }
    
    return { success: true, badge }
  } catch (error) {
    console.error('Error in awardBadge:', error)
    return { success: false, error: 'An error occurred' }
  }
}

// ============================================================================
// AUTOMATIC BADGE CHECKING
// ============================================================================

/**
 * Check and award all eligible badges for a user
 * Returns newly awarded badges
 */
export async function checkAndAwardBadges(
  userId: string
): Promise<Badge[]> {
  const supabase = createAdminClient()
  
  try {
    // Get user stats
    const { data: userData } = await supabase
      .from('user_gamification')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (!userData) {
      return []
    }
    
    // Get all badges user doesn't have
    const { data: userBadges } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', userId)
    
    const earnedBadgeIds = userBadges?.map(ub => ub.badge_id) || []
    
    const { data: availableBadges } = await supabase
      .from('badges')
      .select('*')
      .not('id', 'in', `(${earnedBadgeIds.join(',') || '0'})`)
    
    if (!availableBadges) {
      return []
    }
    
    // Check requirements and award
    const newBadges: Badge[] = []
    
    for (const badge of availableBadges) {
      let earned = false
      
      switch (badge.requirement_type) {
        case 'streak':
          earned = userData.current_streak >= (badge.requirement_value || 0)
          break
          
        case 'level':
          earned = userData.level >= (badge.requirement_value || 0)
          break
          
        case 'step_count':
          const { data: steps } = await supabase
            .from('step_completions')
            .select('id')
            .eq('user_id', userId)
          earned = (steps?.length || 0) >= (badge.requirement_value || 0)
          break
          
        case 'chapter_count':
          const { data: chapters } = await supabase
            .from('xp_logs')
            .select('id')
            .eq('user_id', userId)
            .eq('reason', 'chapter_completion')
          earned = (chapters?.length || 0) >= (badge.requirement_value || 0)
          break
          
        case 'improvement':
          const { data: scores } = await supabase
            .from('chapter_skill_scores')
            .select('improvement')
            .eq('user_id', userId)
            .gte('improvement', badge.requirement_value || 0)
          earned = (scores?.length || 0) > 0
          break
      }
      
      if (earned) {
        const { error } = await supabase
          .from('user_badges')
          .insert({
            user_id: userId,
            badge_id: badge.id,
            awarded_at: new Date().toISOString()
          })
        
        if (!error) {
          newBadges.push(badge)
        }
      }
    }
    
    return newBadges
  } catch (error) {
    console.error('Error in checkAndAwardBadges:', error)
    return []
  }
}

/**
 * Check badges after specific events
 */
export async function checkBadgesAfterEvent(
  userId: string,
  eventType: 'step' | 'chapter' | 'level_up' | 'streak' | 'improvement'
): Promise<Badge[]> {
  // Run badge check based on event type
  // This is a convenience function that can be called after major events
  
  const relevantBadgeTypes: Record<typeof eventType, string[]> = {
    'step': ['step_count'],
    'chapter': ['chapter_count'],
    'level_up': ['level'],
    'streak': ['streak'],
    'improvement': ['improvement']
  }
  
  // For now, just run full check
  // In optimization, you could filter badges by type
  return await checkAndAwardBadges(userId)
}

// ============================================================================
// BADGE PROGRESS
// ============================================================================

/**
 * Get progress towards earning a specific badge
 */
export async function getBadgeProgress(
  userId: string,
  badgeKey: string
): Promise<{
  badge: Badge | null
  current: number
  required: number
  earned: boolean
  progress: number
}> {
  const supabase = await createClient()
  
  // Get badge info
  const { data: badge } = await supabase
    .from('badges')
    .select('*')
    .eq('badge_key', badgeKey)
    .single()
  
  if (!badge) {
    return {
      badge: null,
      current: 0,
      required: 0,
      earned: false,
      progress: 0
    }
  }
  
  // Check if already earned
  const earned = await hasBadge(userId, badgeKey)
  
  if (earned) {
    return {
      badge,
      current: badge.requirement_value || 0,
      required: badge.requirement_value || 0,
      earned: true,
      progress: 100
    }
  }
  
  // Get current progress
  let current = 0
  
  switch (badge.requirement_type) {
    case 'streak':
      const { data: gamData } = await supabase
        .from('user_gamification')
        .select('current_streak')
        .eq('user_id', userId)
        .single()
      current = gamData?.current_streak || 0
      break
      
    case 'level':
      const { data: levelData } = await supabase
        .from('user_gamification')
        .select('level')
        .eq('user_id', userId)
        .single()
      current = levelData?.level || 0
      break
      
    case 'step_count':
      const { data: steps } = await supabase
        .from('step_completions')
        .select('id')
        .eq('user_id', userId)
      current = steps?.length || 0
      break
      
    case 'chapter_count':
      const { data: chapters } = await supabase
        .from('xp_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('reason', 'chapter_completion')
      current = chapters?.length || 0
      break
  }
  
  const required = badge.requirement_value || 0
  const progress = required > 0 ? Math.min((current / required) * 100, 100) : 0
  
  return {
    badge,
    current,
    required,
    earned: false,
    progress
  }
}

/**
 * Get progress for all badges
 */
export async function getAllBadgeProgress(userId: string) {
  const badges = await getAllBadges()
  
  const progressPromises = badges.map(badge =>
    getBadgeProgress(userId, badge.badge_key)
  )
  
  return await Promise.all(progressPromises)
}
