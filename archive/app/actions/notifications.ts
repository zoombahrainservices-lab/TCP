'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export type NotificationType = 
  | 'phase_reminder'
  | 'zone_unlocked'
  | 'chapter_completed'
  | 'zone_completed'
  | 'review_received'
  | 'task_due_soon'
  | 'general'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  metadata: any
  read: boolean
  created_at: string
}

/**
 * Create a notification for a user
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  metadata?: any
): Promise<{ success: boolean; error?: string }> {
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      metadata: metadata || {},
      read: false,
    })

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('createNotification error:', error)
    }
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Get notifications for a user
 */
export async function getNotifications(
  userId: string,
  unreadOnly = false
): Promise<Notification[]> {
  const adminClient = createAdminClient()

  let query = adminClient
    .from('notifications')
    .select('*')
    .eq('user_id', userId)

  if (unreadOnly) {
    query = query.eq('read', false)
  }

  const { data: notifications, error } = await query
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('getNotifications error:', error)
    }
    return []
  }

  return notifications || []
}

/**
 * Alias for getNotifications (for backward compatibility)
 */
export async function getUserNotifications(
  userId: string,
  unreadOnly = false
): Promise<Notification[]> {
  return getNotifications(userId, unreadOnly)
}

/**
 * Get count of unread notifications for a user
 */
export async function getUnreadNotificationCount(
  userId: string
): Promise<number> {
  const adminClient = createAdminClient()

  const { count, error } = await adminClient
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false)

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('getUnreadNotificationCount error:', error)
    }
    return 0
  }

  return count || 0
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(
  notificationId: string
): Promise<{ success: boolean; error?: string }> {
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)

  if (error) {
    console.error('markNotificationRead error:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsRead(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false)

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('markAllNotificationsRead error:', error)
    }
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Send zone unlocked notification
 */
export async function notifyZoneUnlocked(
  userId: string,
  zoneNumber: number,
  zoneName: string
): Promise<void> {
  await createNotification(
    userId,
    'zone_unlocked',
    `Zone ${zoneNumber} Unlocked!`,
    `Congratulations! You've unlocked ${zoneName}. Start exploring new chapters!`,
    { zoneNumber }
  )
}

/**
 * Send chapter completed notification
 */
export async function notifyChapterCompleted(
  userId: string,
  zoneNumber: number,
  chapterNumber: number,
  chapterTitle: string
): Promise<void> {
  await createNotification(
    userId,
    'chapter_completed',
    'Chapter Complete!',
    `Great work completing Chapter ${chapterNumber}: ${chapterTitle} in Zone ${zoneNumber}!`,
    { zoneNumber, chapterNumber }
  )
}

/**
 * Send zone completed notification
 */
export async function notifyZoneCompleted(
  userId: string,
  zoneNumber: number,
  zoneName: string
): Promise<void> {
  await createNotification(
    userId,
    'zone_completed',
    `Zone ${zoneNumber} Mastered!`,
    `Amazing! You've completed all chapters in ${zoneName}. The next zone awaits!`,
    { zoneNumber }
  )
}

/**
 * Send task due soon reminder
 */
export async function notifyTaskDueSoon(
  userId: string,
  chapterTitle: string,
  hoursRemaining: number
): Promise<void> {
  await createNotification(
    userId,
    'task_due_soon',
    'Task Due Soon',
    `Your field mission for "${chapterTitle}" is due in ${hoursRemaining} hours. Don't forget to submit your proof!`,
    { hoursRemaining }
  )
}
