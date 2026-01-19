'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { validateEmail } from '@/lib/utils/validation'

export async function createStudentAccount(
  parentId: string, 
  email: string, 
  fullName: string,
  password?: string // Optional password for testing (if not provided, sends invitation email)
) {
  if (!validateEmail(email)) {
    return { error: 'Invalid email format' }
  }

  if (!fullName || fullName.trim().length < 2) {
    return { error: 'Please provide a valid name' }
  }

  const adminClient = createAdminClient()

  // Create user with admin client
  const createUserOptions: any = {
    email,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
  }

  // If password provided, set it directly (for testing)
  if (password) {
    createUserOptions.password = password
  }

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser(createUserOptions)

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

  // Link parent and child (use adminClient to bypass RLS)
  const { error: linkError } = await adminClient
    .from('parent_child_links')
    .insert({
      parent_id: parentId,
      child_id: authData.user.id,
    })

  if (linkError) {
    console.error('Failed to link parent and child:', linkError)
    return { error: 'Failed to link parent and child' }
  }

  // If password was provided, skip email invitation
  if (!password) {
    // Send password reset email (invitation)
    const { error: resetError } = await adminClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`,
    })

    if (resetError) {
      console.error('Failed to send invitation email:', resetError)
      // Don't fail the whole operation if email fails
    }
  }

  return { success: true, studentId: authData.user.id }
}

export async function getMyChildren(parentId: string) {
  const adminClient = createAdminClient()

  // Get child IDs first
  const { data: links, error: linksError } = await adminClient
    .from('parent_child_links')
    .select('child_id')
    .eq('parent_id', parentId)

  if (linksError) {
    console.error('getMyChildren - linksError:', linksError)
    throw new Error('Failed to fetch children')
  }

  if (!links || links.length === 0) {
    return []
  }

  // Get profiles separately
  const childIds = links.map(l => l.child_id)
  const { data: profiles, error: profilesError } = await adminClient
    .from('profiles')
    .select('id, full_name')
    .in('id', childIds)

  if (profilesError) {
    console.error('getMyChildren - profilesError:', profilesError)
    throw new Error('Failed to fetch children profiles')
  }

  // Get progress for each child
  const childrenWithProgress = await Promise.all(
    (profiles || []).map(async (profile: any) => {
      const childId = profile.id
      const fullName = profile.full_name

      // Get completed days
      const { data: records } = await adminClient
        .from('daily_records')
        .select('day_number, completed, updated_at')
        .eq('student_id', childId)
        .eq('completed', true)
        .order('updated_at', { ascending: false })

      const completedDays = records?.length || 0
      const completionPercentage = Math.round((completedDays / 30) * 100)
      const lastActivity = records?.[0]?.updated_at || null

      // Get all records to calculate in-progress days
      const { data: allRecords } = await adminClient
        .from('daily_records')
        .select('day_number, completed')
        .eq('student_id', childId)
      
      const inProgressDays = allRecords?.filter(r => !r.completed).map(r => r.day_number) || []
      const completedDayNumbers = allRecords?.filter(r => r.completed).map(r => r.day_number) || []
      
      // Calculate suggested day
      let suggestedDay = 1
      if (inProgressDays.length > 0) {
        suggestedDay = Math.min(...inProgressDays)
      } else if (completedDayNumbers.length > 0) {
        suggestedDay = Math.min(Math.max(...completedDayNumbers) + 1, 30)
      }

      return {
        id: childId,
        fullName,
        currentDay: suggestedDay, // Keep field name for compatibility but use suggested day logic
        completionPercentage,
        lastActivity,
      }
    })
  )

  return childrenWithProgress
}

export async function getChildProgress(parentId: string, childId: string) {
  const adminClient = createAdminClient()

  // Verify parent-child relationship
  const { data: link, error: linkError } = await adminClient
    .from('parent_child_links')
    .select('id')
    .eq('parent_id', parentId)
    .eq('child_id', childId)
    .maybeSingle()

  if (linkError) {
    console.error('getChildProgress - linkError:', linkError)
  }

  if (!link) {
    console.error('getChildProgress - No link found for parentId:', parentId, 'childId:', childId)
    throw new Error('Access denied')
  }

  // Get child profile
  const { data: profile } = await adminClient
    .from('profiles')
    .select('full_name')
    .eq('id', childId)
    .single()

  // Get all records (include id for PDF downloads)
  const { data: records } = await adminClient
    .from('daily_records')
    .select('id, day_number, completed, updated_at')
    .eq('student_id', childId)
    .order('day_number', { ascending: true })

  const completedDays = records?.filter(r => r.completed).map(r => r.day_number) || []
  const inProgressDays = records?.filter(r => !r.completed).map(r => r.day_number) || []
  
  // Calculate suggested day
  let suggestedDay = 1
  if (inProgressDays.length > 0) {
    suggestedDay = Math.min(...inProgressDays)
  } else if (completedDays.length > 0) {
    suggestedDay = Math.min(Math.max(...completedDays) + 1, 30)
  }

  // Build day statuses map for all 30 days
  const dayStatuses: Record<number, 'completed' | 'in-progress' | 'not-started'> = {}
  for (let day = 1; day <= 30; day++) {
    if (completedDays.includes(day)) {
      dayStatuses[day] = 'completed'
    } else if (inProgressDays.includes(day)) {
      dayStatuses[day] = 'in-progress'
    } else {
      dayStatuses[day] = 'not-started'
    }
  }

  // Get chapter info for all 30 days
  const { data: chapters } = await adminClient
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
      inProgress: inProgressDays.includes(dayNumber),
      updatedAt: record?.updated_at || null,
      recordId: record?.id || null, // Add record ID for PDF downloads
    }
  })

  return {
    childName: profile?.full_name || 'Student',
    completedDays,
    inProgressDays,
    currentDay: suggestedDay, // Keep field name for compatibility but use suggested day logic
    suggestedDay,
    completionPercentage: Math.round((completedDays.length / 30) * 100),
    dayStatuses,
    days: daysInfo,
  }
}

export async function getChildDaySubmission(parentId: string, childId: string, dayNumber: number) {
  const adminClient = createAdminClient()

  // Verify parent-child relationship
  const { data: link } = await adminClient
    .from('parent_child_links')
    .select('id')
    .eq('parent_id', parentId)
    .eq('child_id', childId)
    .maybeSingle()

  if (!link) {
    throw new Error('Access denied')
  }

  // Get chapter info
  const { data: chapter } = await adminClient
    .from('chapters')
    .select('title, subtitle, before_questions, after_questions')
    .eq('day_number', dayNumber)
    .single()

  // Get daily record with uploads
  const { data: record } = await adminClient
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
    id: record.id,
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
    reviewed_at: record.reviewed_at,
    review_feedback: record.review_feedback,
  }
}

export async function getChildReport(parentId: string, childId: string) {
  const adminClient = createAdminClient()

  // Verify parent-child relationship
  const { data: link } = await adminClient
    .from('parent_child_links')
    .select('id')
    .eq('parent_id', parentId)
    .eq('child_id', childId)
    .maybeSingle()

  if (!link) {
    throw new Error('Access denied')
  }

  // Use unified report builder
  const { buildStudentReport } = await import('@/lib/reports')
  const fullReport = await buildStudentReport(childId)

  // Transform phase-based report to match existing report format for backwards compatibility
  // Group phases by chapter to create day-like entries
  const phasesByChapter = new Map<number, typeof fullReport.phases>()
  fullReport.phases.forEach(phase => {
    const chapterKey = phase.chapterNumber
    if (!phasesByChapter.has(chapterKey)) {
      phasesByChapter.set(chapterKey, [])
    }
    phasesByChapter.get(chapterKey)!.push(phase)
  })

  const reportData = Array.from(phasesByChapter.entries())
    .map(([chapterNumber, phases]) => {
      // Get power-scan (before) and level-up (after) phases for this chapter
      const powerScanPhase = phases.find(p => p.phaseType === 'power-scan')
      const levelUpPhase = phases.find(p => p.phaseType === 'level-up')
      const reflectionPhase = phases.find(p => p.reflectionText)

      return {
        dayNumber: chapterNumber,
        title: phases[0]?.chapterTitle || `Chapter ${chapterNumber}`,
        beforeScore: powerScanPhase?.beforeScore !== null && powerScanPhase?.beforeScore !== undefined 
          ? powerScanPhase.beforeScore.toFixed(1) 
          : 'N/A',
        afterScore: levelUpPhase?.afterScore !== null && levelUpPhase?.afterScore !== undefined 
          ? levelUpPhase.afterScore.toFixed(1) 
          : 'N/A',
        reflection: reflectionPhase?.reflectionText || '',
        completedAt: phases[0]?.completedAt || '',
        recordId: null, // Phase-based system doesn't have record IDs in the same way
      }
    })
    .sort((a, b) => a.dayNumber - b.dayNumber)

  return {
    childName: fullReport.studentName,
    completionPercentage: fullReport.completionPercentage,
    completedDays: fullReport.completedChapters,
    reportData,
    // Include new metrics
    summary: {
      ...fullReport.summary,
      completionPercentage: fullReport.completionPercentage,
      completedDays: fullReport.completedChapters,
    },
    baseline: null, // Baseline not available in phase-based system
  }
}
