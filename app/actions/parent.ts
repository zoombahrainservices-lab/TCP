'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { validateEmail } from '@/lib/utils/validation'

export async function createStudentAccount(parentId: string, email: string, fullName: string) {
  if (!validateEmail(email)) {
    return { error: 'Invalid email format' }
  }

  if (!fullName || fullName.trim().length < 2) {
    return { error: 'Please provide a valid name' }
  }

  const adminClient = createAdminClient()

  // Create user with admin client
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
  })

  if (authError || !authData.user) {
    return { error: authError?.message || 'Failed to create student account' }
  }

  // Create profile
  const { error: profileError } = await adminClient
    .from('profiles')
    .insert({
      id: authData.user.id,
      full_name: fullName,
      role: 'student',
    })

  if (profileError) {
    return { error: 'Failed to create student profile' }
  }

  // Link parent and child
  const supabase = await createClient()
  const { error: linkError } = await supabase
    .from('parent_child_links')
    .insert({
      parent_id: parentId,
      child_id: authData.user.id,
    })

  if (linkError) {
    return { error: 'Failed to link parent and child' }
  }

  // Send password reset email (invitation)
  const { error: resetError } = await adminClient.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`,
  })

  if (resetError) {
    console.error('Failed to send invitation email:', resetError)
    // Don't fail the whole operation if email fails
  }

  return { success: true, studentId: authData.user.id }
}

export async function getMyChildren(parentId: string) {
  const supabase = await createClient()

  const { data: links, error: linksError } = await supabase
    .from('parent_child_links')
    .select(`
      child_id,
      profiles!parent_child_links_child_id_fkey (
        id,
        full_name
      )
    `)
    .eq('parent_id', parentId)

  if (linksError) {
    console.error('getMyChildren - linksError:', linksError)
    throw new Error('Failed to fetch children')
  }

  // Get progress for each child
  const childrenWithProgress = await Promise.all(
    (links || []).map(async (link: any) => {
      const childId = link.profiles.id
      const fullName = link.profiles.full_name

      // Get completed days
      const { data: records } = await supabase
        .from('daily_records')
        .select('day_number, completed, updated_at')
        .eq('student_id', childId)
        .eq('completed', true)
        .order('updated_at', { ascending: false })

      const completedDays = records?.length || 0
      const completionPercentage = Math.round((completedDays / 30) * 100)
      const lastActivity = records?.[0]?.updated_at || null

      return {
        id: childId,
        fullName,
        currentDay: Math.min(completedDays + 1, 30),
        completionPercentage,
        lastActivity,
      }
    })
  )

  return childrenWithProgress
}

export async function getChildProgress(parentId: string, childId: string) {
  const supabase = await createClient()

  // Verify parent-child relationship
  const { data: link } = await supabase
    .from('parent_child_links')
    .select('id')
    .eq('parent_id', parentId)
    .eq('child_id', childId)
    .single()

  if (!link) {
    throw new Error('Access denied')
  }

  // Get child profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', childId)
    .single()

  // Get all records
  const { data: records } = await supabase
    .from('daily_records')
    .select('day_number, completed, updated_at')
    .eq('student_id', childId)
    .order('day_number', { ascending: true })

  const completedDays = records?.filter(r => r.completed).map(r => r.day_number) || []

  // Get chapter info for all 30 days
  const { data: chapters } = await supabase
    .from('chapters')
    .select('day_number, title')
    .order('day_number', { ascending: true })

  const daysInfo = Array.from({ length: 30 }, (_, i) => {
    const dayNumber = i + 1
    const chapter = chapters?.find(c => c.day_number === dayNumber)
    const record = records?.find(r => r.day_number === dayNumber)
    
    return {
      dayNumber,
      title: chapter?.title || `Day ${dayNumber}`,
      completed: completedDays.includes(dayNumber),
      updatedAt: record?.updated_at || null,
    }
  })

  return {
    childName: profile?.full_name || 'Student',
    completedDays,
    currentDay: Math.min(completedDays.length + 1, 30),
    completionPercentage: Math.round((completedDays.length / 30) * 100),
    days: daysInfo,
  }
}

export async function getChildDaySubmission(parentId: string, childId: string, dayNumber: number) {
  const supabase = await createClient()

  // Verify parent-child relationship
  const { data: link } = await supabase
    .from('parent_child_links')
    .select('id')
    .eq('parent_id', parentId)
    .eq('child_id', childId)
    .single()

  if (!link) {
    throw new Error('Access denied')
  }

  // Get chapter info
  const { data: chapter } = await supabase
    .from('chapters')
    .select('title, subtitle, before_questions, after_questions')
    .eq('day_number', dayNumber)
    .single()

  // Get daily record with uploads
  const { data: record } = await supabase
    .from('daily_records')
    .select(`
      *,
      uploads (*)
    `)
    .eq('student_id', childId)
    .eq('day_number', dayNumber)
    .single()

  if (!record) {
    return null
  }

  return {
    dayNumber,
    chapterTitle: chapter?.title || `Day ${dayNumber}`,
    chapterSubtitle: chapter?.subtitle || '',
    beforeQuestions: chapter?.before_questions || [],
    afterQuestions: chapter?.after_questions || [],
    beforeAnswers: record.before_answers || [],
    afterAnswers: record.after_answers || [],
    reflection: record.reflection_text || '',
    uploads: record.uploads || [],
    completed: record.completed,
    completedAt: record.updated_at,
  }
}

export async function getChildReport(parentId: string, childId: string) {
  const supabase = await createClient()

  // Verify parent-child relationship
  const { data: link } = await supabase
    .from('parent_child_links')
    .select('id')
    .eq('parent_id', parentId)
    .eq('child_id', childId)
    .single()

  if (!link) {
    throw new Error('Access denied')
  }

  // Get child profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', childId)
    .single()

  // Get all completed records
  const { data: records } = await supabase
    .from('daily_records')
    .select(`
      day_number,
      before_answers,
      after_answers,
      reflection_text,
      completed,
      updated_at
    `)
    .eq('student_id', childId)
    .eq('completed', true)
    .order('day_number', { ascending: true })

  // Get chapters
  const { data: chapters } = await supabase
    .from('chapters')
    .select('day_number, title')
    .order('day_number', { ascending: true })

  const reportData = (records || []).map(record => {
    const chapter = chapters?.find(c => c.day_number === record.day_number)
    
    // Calculate average scores
    const beforeAvg = record.before_answers?.length > 0
      ? (record.before_answers.reduce((sum: number, a: any) => sum + (a.answer || 0), 0) / record.before_answers.length).toFixed(1)
      : 'N/A'
    
    const afterAvg = record.after_answers?.length > 0
      ? (record.after_answers.reduce((sum: number, a: any) => sum + (a.answer || 0), 0) / record.after_answers.length).toFixed(1)
      : 'N/A'

    return {
      dayNumber: record.day_number,
      title: chapter?.title || `Day ${record.day_number}`,
      beforeScore: beforeAvg,
      afterScore: afterAvg,
      reflection: record.reflection_text,
      completedAt: record.updated_at,
    }
  })

  return {
    childName: profile?.full_name || 'Student',
    completionPercentage: Math.round(((records?.length || 0) / 30) * 100),
    completedDays: records?.length || 0,
    reportData,
  }
}
