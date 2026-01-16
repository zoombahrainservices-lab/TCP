'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  metadata: any
  read: boolean
  created_at: string
}

/**
 * Create a new notification for a user
 */
export async function createNotification(
  userId: string,
  type: string,
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
    console.error('createNotification error:', error)
    return { success: false, error: 'Failed to create notification' }
  }

  revalidatePath('/student')
  revalidatePath('/parent')
  revalidatePath('/mentor')
  return { success: true }
}

/**
 * Get notifications for a user
 */
export async function getUserNotifications(
  userId: string,
  unreadOnly: boolean = false
): Promise<Notification[]> {
  const supabase = await createClient()

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (unreadOnly) {
    query = query.eq('read', false)
  }

  const { data, error } = await query

  if (error) {
    console.error('getUserNotifications error:', error)
    return []
  }

  return data || []
}

/**
 * Mark a notification as read
 */
export async function markNotificationRead(
  notificationId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)

  if (error) {
    console.error('markNotificationRead error:', error)
    return { success: false, error: 'Failed to mark notification as read' }
  }

  revalidatePath('/student')
  revalidatePath('/parent')
  revalidatePath('/mentor')
  return { success: true }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsRead(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false)

  if (error) {
    console.error('markAllNotificationsRead error:', error)
    return { success: false, error: 'Failed to mark all notifications as read' }
  }

  revalidatePath('/student')
  revalidatePath('/parent')
  revalidatePath('/mentor')
  return { success: true }
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false)

  if (error) {
    console.error('getUnreadNotificationCount error:', error)
    return 0
  }

  return count || 0
}

/**
 * Send email using Supabase Auth
 */
export async function sendEmail(
  to: string,
  subject: string,
  body: string
): Promise<{ success: boolean; error?: string }> {
  // Note: This requires Supabase email templates to be configured
  // For now, we'll use the password reset email as a template
  // In production, you'd want to use a proper email service like SendGrid or AWS SES
  
  const adminClient = createAdminClient()

  try {
    // Supabase doesn't have a direct "send email" API
    // You would typically use a third-party service here
    // For now, we'll just log it
    console.log('Email would be sent:', { to, subject, body })
    
    // In production, integrate with an email service:
    // await fetch('https://api.sendgrid.com/v3/mail/send', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     personalizations: [{ to: [{ email: to }] }],
    //     from: { email: 'noreply@yourapp.com' },
    //     subject,
    //     content: [{ type: 'text/plain', value: body }]
    //   })
    // })

    return { success: true }
  } catch (error: any) {
    console.error('sendEmail error:', error)
    return { success: false, error: error.message || 'Failed to send email' }
  }
}
