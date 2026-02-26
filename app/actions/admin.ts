'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/guards'
import { revalidatePath } from 'next/cache'

// ============================================================================
// DASHBOARD STATS
// ============================================================================

export async function getAdminDashboardStats() {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    // Calculate date filters
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    // OPTIMIZED: Run all queries in parallel
    const [
      { data: profiles, error: profilesError },
      { data: activeUsers, error: activeUsersError },
      { data: chapters, error: chaptersError },
      { data: gamification, error: gamificationError },
      { data: parts, error: partsError }
    ] = await Promise.all([
      admin.from('profiles').select('role, created_at'),
      admin.from('user_gamification').select('user_id').gte('last_active_date', oneDayAgo),
      admin.from('chapters').select('is_published'),
      admin.from('user_gamification').select('total_xp, level'),
      admin.from('parts').select('id')
    ])

    // Handle errors
    if (profilesError) throw profilesError
    if (chaptersError) throw new Error(`Failed to fetch chapters: ${chaptersError.message}`)
    
    if (activeUsersError) {
      console.error('Error fetching active users:', activeUsersError)
    }
    if (gamificationError) {
      console.error('Error fetching gamification data:', gamificationError)
    }
    if (partsError) {
      console.error('Error fetching parts:', partsError)
    }

    // Process results
    const totalUsers = profiles?.length || 0
    const usersByRole = profiles?.reduce((acc, p) => {
      acc[p.role || 'student'] = (acc[p.role || 'student'] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const newUsersThisWeek = profiles?.filter(p => p.created_at >= oneWeekAgo).length || 0

    const totalChapters = chapters?.length || 0
    const publishedChapters = chapters?.filter(c => c.is_published).length || 0
    const draftChapters = totalChapters - publishedChapters

    const totalXP = gamification?.reduce((sum, g) => sum + (g.total_xp || 0), 0) || 0
    const avgLevel = gamification?.length 
      ? (gamification.reduce((sum, g) => sum + (g.level || 1), 0) / gamification.length).toFixed(1)
      : '1.0'

    return {
      users: {
        total: totalUsers,
        activeToday: activeUsers?.length || 0,
        newThisWeek: newUsersThisWeek,
        byRole: usersByRole,
      },
      chapters: {
        total: totalChapters,
        published: publishedChapters,
        drafts: draftChapters,
      },
      parts: {
        total: parts?.length || 0,
      },
      xp: {
        totalAwarded: totalXP,
        avgLevel: parseFloat(avgLevel),
      },
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    throw error
  }
}

export async function getRecentActivity(limit: number = 10) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    // OPTIMIZED: Parallelize all queries
    const [
      { data: recentUsers },
      { data: completions },
      { data: xpLogs }
    ] = await Promise.all([
      admin.from('profiles').select('id, full_name, email, created_at').order('created_at', { ascending: false }).limit(limit),
      admin.from('chapter_sessions').select('id, chapter_id, completed_at, user_id').not('completed_at', 'is', null).order('completed_at', { ascending: false }).limit(limit),
      admin.from('xp_logs').select('id, user_id, reason, amount, created_at').order('created_at', { ascending: false }).limit(limit)
    ])

    // Get all unique user IDs
    const completionUserIds = completions?.map(c => c.user_id) || []
    const xpUserIds = xpLogs?.map(x => x.user_id) || []
    const allUserIds = [...new Set([...completionUserIds, ...xpUserIds])]

    // Fetch all user profiles at once
    const { data: userProfiles } = allUserIds.length > 0
      ? await admin.from('profiles').select('id, full_name, email').in('id', allUserIds)
      : { data: [] }

    const recentCompletions = completions?.map(c => ({
      ...c,
      profiles: userProfiles?.find(u => u.id === c.user_id)
    })) || []

    const recentXP = xpLogs?.map(x => ({
      ...x,
      profiles: userProfiles?.find(u => u.id === x.user_id)
    })) || []

    return {
      recentUsers: recentUsers || [],
      recentCompletions,
      recentXP,
    }
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    throw error
  }
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export async function getAllUsers(filters?: {
  role?: string
  search?: string
  sortBy?: 'xp' | 'level' | 'created' | 'lastActive'
  sortOrder?: 'asc' | 'desc'
}, pagination?: {
  page: number
  perPage: number
}) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    // Fetch profiles first
    let profileQuery = admin
      .from('profiles')
      .select('*')

    // Apply role filter
    if (filters?.role && filters.role !== 'all') {
      profileQuery = profileQuery.eq('role', filters.role)
    }

    // Apply search filter
    if (filters?.search) {
      profileQuery = profileQuery.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
    }

    // Get profiles
    const { data: profiles, error: profilesError } = await profileQuery

    if (profilesError) throw profilesError

    // Get gamification data for all users
    const { data: gamificationData, error: gamificationError } = await admin
      .from('user_gamification')
      .select('*')
      .in('user_id', profiles?.map(p => p.id) || [])

    if (gamificationError) {
      console.error('Error fetching gamification data:', gamificationError)
    }

    // Merge the data
    const users = profiles?.map(profile => ({
      ...profile,
      user_gamification: gamificationData?.filter(g => g.user_id === profile.id) || []
    })) || []

    // Sort in memory (since we need to sort by joined data)
    let sortedUsers = users || []
    if (filters?.sortBy) {
      sortedUsers.sort((a, b) => {
        let aVal: any, bVal: any
        
        switch (filters.sortBy) {
          case 'xp':
            aVal = a.user_gamification?.[0]?.total_xp || 0
            bVal = b.user_gamification?.[0]?.total_xp || 0
            break
          case 'level':
            aVal = a.user_gamification?.[0]?.level || 1
            bVal = b.user_gamification?.[0]?.level || 1
            break
          case 'created':
            aVal = new Date(a.created_at).getTime()
            bVal = new Date(b.created_at).getTime()
            break
          case 'lastActive':
            aVal = a.user_gamification?.[0]?.last_active_date 
              ? new Date(a.user_gamification[0].last_active_date).getTime()
              : 0
            bVal = b.user_gamification?.[0]?.last_active_date
              ? new Date(b.user_gamification[0].last_active_date).getTime()
              : 0
            break
          default:
            return 0
        }

        return filters.sortOrder === 'asc' ? aVal - bVal : bVal - aVal
      })
    }

    // Apply pagination
    const page = pagination?.page || 1
    const perPage = pagination?.perPage || 50
    const start = (page - 1) * perPage
    const end = start + perPage
    const paginatedUsers = sortedUsers.slice(start, end)

    return {
      users: paginatedUsers,
      total: sortedUsers.length,
      page,
      perPage,
      totalPages: Math.ceil(sortedUsers.length / perPage),
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

export async function getUserDetailById(userId: string) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    // OPTIMIZED: Parallelize all queries
    const [
      { data: profile, error: profileError },
      { data: gamification },
      { data: completedChapters },
      { data: badgeRecords }
    ] = await Promise.all([
      admin.from('profiles').select('*').eq('id', userId).single(),
      admin.from('user_gamification').select('*').eq('user_id', userId).single(),
      admin.from('chapter_progress').select('chapter_id').eq('user_id', userId).eq('chapter_complete', true),
      admin.from('user_badges').select('*, badge_id, earned_at').eq('user_id', userId)
    ])

    if (profileError) throw profileError

    // Get badge details separately
    const badgeIds = badgeRecords?.map(b => b.badge_id).filter(Boolean) || []
    const { data: badgeDetails } = badgeIds.length > 0
      ? await admin.from('badges').select('*').in('id', badgeIds)
      : { data: [] }

    // Merge badge data
    const badges = badgeRecords?.map(record => ({
      ...record,
      badges: badgeDetails?.find(b => b.id === record.badge_id)
    })) || []

    return {
      profile,
      gamification: gamification || null,
      stats: {
        chaptersCompleted: completedChapters?.length || 0,
        badgesEarned: badges?.length || 0,
      },
      badges,
    }
  } catch (error) {
    console.error('Error fetching user detail:', error)
    throw error
  }
}

export async function getUserProgressTimeline(userId: string) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    // OPTIMIZED: Parallelize all queries
    const [
      { data: progress, error: progressError },
      { data: assessments },
      { data: sessions },
      { data: xpLogs }
    ] = await Promise.all([
      admin.from('chapter_progress').select('*').eq('user_id', userId).order('chapter_id', { ascending: true }).limit(50),
      admin.from('chapter_skill_scores').select('*').eq('user_id', userId).limit(50),
      admin.from('chapter_sessions').select('*').eq('user_id', userId).limit(50),
      admin.from('xp_logs').select('chapter_id, amount').eq('user_id', userId).limit(100)
    ])

    if (progressError) {
      console.error('Error fetching progress:', progressError)
      throw progressError
    }

    // Get chapters for the progress
    const chapterIds = progress?.map(p => p.chapter_id).filter(Boolean) || []
    const { data: chapters } = chapterIds.length > 0
      ? await admin.from('chapters').select('id, chapter_number, title, slug').in('id', chapterIds)
      : { data: [] }

    // Merge chapter data with progress
    const progressWithChapters = progress?.map(p => ({
      ...p,
      chapters: chapters?.find(c => c.id === p.chapter_id)
    })) || []

    const xpByChapter = xpLogs?.reduce((acc, log) => {
      if (log.chapter_id) {
        acc[log.chapter_id] = (acc[log.chapter_id] || 0) + log.amount
      }
      return acc
    }, {} as Record<number, number>) || {}

    return {
      progress: progressWithChapters,
      assessments: assessments || [],
      sessions: sessions || [],
      xpByChapter,
    }
  } catch (error) {
    console.error('Error fetching user progress timeline:', error)
    throw error
  }
}

export async function getUserXPHistory(userId: string, filters?: {
  reason?: string
  limit?: number
}) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    let query = admin
      .from('xp_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (filters?.reason) {
      query = query.eq('reason', filters.reason)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching XP history:', error)
    throw error
  }
}

export async function updateUserRole(userId: string, newRole: string) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    const { error } = await admin
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (error) throw error

    revalidatePath('/admin/users')
    revalidatePath(`/admin/users/${userId}`)

    return { success: true }
  } catch (error) {
    console.error('Error updating user role:', error)
    throw error
  }
}

export async function adjustUserXP(userId: string, amount: number, reason: string) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    // Get current XP
    const { data: gamification } = await admin
      .from('user_gamification')
      .select('total_xp')
      .eq('user_id', userId)
      .single()

    const currentXP = gamification?.total_xp || 0
    const newXP = Math.max(0, currentXP + amount)

    // Calculate new level
    const newLevel = Math.floor(Math.pow(newXP / 100, 0.45)) + 1

    if (gamification) {
      const { error: updateError } = await admin
        .from('user_gamification')
        .update({ 
          total_xp: newXP,
          level: newLevel,
        })
        .eq('user_id', userId)
      if (updateError) throw updateError
    } else {
      const { error: insertError } = await admin
        .from('user_gamification')
        .insert({
          user_id: userId,
          total_xp: newXP,
          level: newLevel,
          current_streak: 0,
          longest_streak: 0,
        })
      if (insertError) throw insertError
    }

    // Log the XP change
    const { error: logError } = await admin
      .from('xp_logs')
      .insert({
        user_id: userId,
        reason: 'manual_adjustment',
        amount: amount,
        metadata: { admin_reason: reason },
      })

    if (logError) throw logError

    revalidatePath(`/admin/users/${userId}`)

    return { success: true, newXP, newLevel }
  } catch (error) {
    console.error('Error adjusting user XP:', error)
    throw error
  }
}

export async function adjustUserStreak(userId: string, currentStreak: number, longestStreak: number) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    const { error } = await admin
      .from('user_gamification')
      .update({ 
        current_streak: currentStreak,
        longest_streak: longestStreak,
      })
      .eq('user_id', userId)

    if (error) throw error

    revalidatePath(`/admin/users/${userId}`)

    return { success: true }
  } catch (error) {
    console.error('Error adjusting user streak:', error)
    throw error
  }
}

export async function resetUserChapterProgress(userId: string, chapterId?: number) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    if (chapterId) {
      // Reset specific chapter
      await admin
        .from('chapter_progress')
        .delete()
        .eq('user_id', userId)
        .eq('chapter_id', chapterId)

      await admin
        .from('step_completions')
        .delete()
        .eq('user_id', userId)
        .match({ chapter_id: chapterId })

      await admin
        .from('chapter_sessions')
        .delete()
        .eq('user_id', userId)
        .eq('chapter_id', chapterId)
    } else {
      // Reset all progress
      await admin
        .from('chapter_progress')
        .delete()
        .eq('user_id', userId)

      await admin
        .from('step_completions')
        .delete()
        .eq('user_id', userId)

      await admin
        .from('chapter_sessions')
        .delete()
        .eq('user_id', userId)
    }

    revalidatePath(`/admin/users/${userId}`)

    return { success: true }
  } catch (error) {
    console.error('Error resetting user progress:', error)
    throw error
  }
}

export async function deleteUser(userId: string) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    // Delete user's auth account
    const { error: authError } = await admin.auth.admin.deleteUser(userId)
    if (authError) throw authError

    // Profile and related data will be deleted by CASCADE

    revalidatePath('/admin/users')

    return { success: true }
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

export async function awardBadge(userId: string, badgeId: number) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    const { error } = await admin
      .from('user_badges')
      .insert({
        user_id: userId,
        badge_id: badgeId,
        awarded_at: new Date().toISOString(),
      })

    if (error) throw error

    revalidatePath(`/admin/users/${userId}`)

    return { success: true }
  } catch (error) {
    console.error('Error awarding badge:', error)
    throw error
  }
}

export async function revokeBadge(userId: string, badgeId: number) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    const { error } = await admin
      .from('user_badges')
      .delete()
      .eq('user_id', userId)
      .eq('badge_id', badgeId)

    if (error) throw error

    revalidatePath(`/admin/users/${userId}`)

    return { success: true }
  } catch (error) {
    console.error('Error revoking badge:', error)
    throw error
  }
}

// ============================================================================
// CHAPTER MANAGEMENT (CRUD)
// ============================================================================

export async function getAllParts() {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    const { data, error } = await admin
      .from('parts')
      .select('*')
      .order('order_index')
      .limit(100) // OPTIMIZED: Add pagination limit

    if (error) {
      console.error('Error fetching parts:', error)
      throw new Error(`Failed to fetch parts: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('Error in getAllParts:', error)
    throw error
  }
}

export async function getAllChapters() {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    const { data, error } = await admin
      .from('chapters')
      .select('*')
      .order('chapter_number')
      .limit(100) // OPTIMIZED: Add pagination limit

    if (error) {
      console.error('Error fetching chapters:', error)
      throw new Error(`Failed to fetch chapters: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('Error in getAllChapters:', error)
    throw error
  }
}

export async function getChapter(chapterId: string) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    const { data, error } = await admin
      .from('chapters')
      .select('*')
      .eq('id', chapterId)
      .single()

    if (error) {
      console.error('Error fetching chapter:', error)
      throw new Error(`Failed to fetch chapter: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Error in getChapter:', error)
    throw error
  }
}

export async function getAllStepsForChapter(chapterId: string) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    const { data, error } = await admin
      .from('chapter_steps')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('order_index')

    if (error) {
      console.error('Error fetching steps:', error)
      throw new Error(`Failed to fetch steps: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('Error in getAllStepsForChapter:', error)
    throw error
  }
}

export async function createPart(data: { title: string; slug: string; order_index: number }) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    const { data: part, error } = await admin
      .from('parts')
      .insert(data)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/admin/chapters')

    return { success: true, part }
  } catch (error) {
    console.error('Error creating part:', error)
    throw error
  }
}

export async function createChapterWithSteps(data: {
  basicInfo: {
    title: string
    subtitle: string
    slug: string
    part_id: string
    chapter_number: number
    framework_code?: string
    framework_letters?: string[]
    hero_image_url?: string
    pdf_url?: string
  }
  selectedSteps: string[]
  useTemplates: boolean
}) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    // Create the chapter
    const { data: chapter, error: chapterError } = await admin
      .from('chapters')
      .insert({
        ...data.basicInfo,
        order_index: data.basicInfo.chapter_number,
        is_published: false,
      })
      .select()
      .single()

    if (chapterError) throw chapterError

    // Create steps
    const stepTypeNames: Record<string, string> = {
      read: 'Reading',
      self_check: 'Self-Check',
      framework: 'Framework',
      techniques: 'Techniques',
      resolution: 'Resolution',
      follow_through: 'Follow-Through',
    }

    const stepPromises = data.selectedSteps.map((stepType, index) => {
      return admin
        .from('chapter_steps')
        .insert({
          chapter_id: chapter.id,
          step_type: stepType,
          title: stepTypeNames[stepType] || stepType,
          slug: stepType.replace('_', '-'),
          order_index: index,
          is_required: stepType === 'read', // Only reading is required by default
        })
        .select()
        .single()
    })

    const stepResults = await Promise.all(stepPromises)

    // If useTemplates, create starter pages
    if (data.useTemplates) {
      for (const result of stepResults) {
        if (result.data) {
          await admin
            .from('step_pages')
            .insert({
              step_id: result.data.id,
              slug: 'introduction',
              title: 'Introduction',
              order_index: 0,
              estimated_minutes: 5,
              xp_award: 10,
              content: [
                { type: 'heading', level: 2, text: 'Introduction' },
                { type: 'paragraph', text: 'Start adding your content here...' }
              ],
            })
        }
      }
    }

    revalidatePath('/admin/chapters')

    return { success: true, chapter }
  } catch (error) {
    console.error('Error creating chapter with steps:', error)
    throw error
  }
}

export async function updatePart(partId: string, data: Partial<{ title: string; slug: string; order_index: number }>) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    const { error } = await admin
      .from('parts')
      .update(data)
      .eq('id', partId)

    if (error) throw error

    revalidatePath('/admin/chapters')

    return { success: true }
  } catch (error) {
    console.error('Error updating part:', error)
    throw error
  }
}

export async function deletePart(partId: string) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    const { error } = await admin
      .from('parts')
      .delete()
      .eq('id', partId)

    if (error) throw error

    revalidatePath('/admin/chapters')

    return { success: true }
  } catch (error) {
    console.error('Error deleting part:', error)
    throw error
  }
}

export async function createChapter(data: any) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    const { data: chapter, error } = await admin
      .from('chapters')
      .insert(data)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/admin/chapters')

    return { success: true, chapter }
  } catch (error) {
    console.error('Error creating chapter:', error)
    throw error
  }
}

export async function updateChapter(chapterId: string, data: any) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    const { error } = await admin
      .from('chapters')
      .update(data)
      .eq('id', chapterId)

    if (error) throw error

    revalidatePath('/admin/chapters')
    revalidatePath(`/admin/chapters/${chapterId}`)

    return { success: true }
  } catch (error) {
    console.error('Error updating chapter:', error)
    throw error
  }
}

export async function deleteChapter(chapterId: string) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    const { error } = await admin
      .from('chapters')
      .delete()
      .eq('id', chapterId)

    if (error) throw error

    revalidatePath('/admin/chapters')

    return { success: true }
  } catch (error) {
    console.error('Error deleting chapter:', error)
    throw error
  }
}

export async function validateChapterForPublish(chapterId: string): Promise<{
  valid: boolean
  errors: string[]
}> {
  await requireAuth('admin')
  const admin = createAdminClient()

  const errors: string[] = []

  try {
    // Get chapter steps
    const { data: steps, error: stepsError } = await admin
      .from('chapter_steps')
      .select('id, step_type, title')
      .eq('chapter_id', chapterId)
      .order('order_index')

    if (stepsError) {
      errors.push('Failed to fetch chapter steps')
      return { valid: false, errors }
    }

    // Check for all 6 canonical step types
    const REQUIRED_STEP_TYPES = ['read', 'self_check', 'framework', 'techniques', 'resolution', 'follow_through']
    const existingStepTypes = new Set(steps?.map(s => s.step_type) || [])
    const missingStepTypes = REQUIRED_STEP_TYPES.filter(type => !existingStepTypes.has(type))
    
    if (missingStepTypes.length > 0) {
      errors.push(`Missing required steps: ${missingStepTypes.join(', ')}`)
    }

    // Check that each step has at least 1 page
    for (const step of steps || []) {
      const { data: pages, error: pagesError } = await admin
        .from('step_pages')
        .select('id, content')
        .eq('step_id', step.id)

      if (pagesError) {
        errors.push(`Failed to check pages for step "${step.title}"`)
        continue
      }

      if (!pages || pages.length === 0) {
        errors.push(`Step "${step.title}" has no pages`)
        continue
      }

      // Check that every page has valid block JSON
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i]
        
        if (!page.content || !Array.isArray(page.content)) {
          errors.push(`Step "${step.title}", Page ${i + 1}: Invalid content structure`)
          continue
        }

        if (page.content.length === 0) {
          errors.push(`Step "${step.title}", Page ${i + 1}: No content blocks`)
          continue
        }

        // Validate blocks using Zod validator
        const { validateBlocks } = await import('@/lib/blocks/validator')
        const validation = validateBlocks(page.content)
        
        if (!validation.valid) {
          errors.push(`Step "${step.title}", Page ${i + 1}: ${validation.errors[0]}`)
        }

        // Check that all prompt blocks have non-empty IDs
        for (const block of page.content) {
          if (block.type === 'prompt' && (!block.id || block.id.trim() === '')) {
            errors.push(`Step "${step.title}", Page ${i + 1}: Prompt block missing required ID`)
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  } catch (error) {
    console.error('Error validating chapter:', error)
    return {
      valid: false,
      errors: ['Validation failed: ' + (error as Error).message],
    }
  }
}

export async function publishChapter(chapterId: string, isPublished: boolean) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    // Validate before publishing
    if (isPublished) {
      const validation = await validateChapterForPublish(chapterId)
      if (!validation.valid) {
        throw new Error(`Cannot publish: ${validation.errors.join('; ')}`)
      }
    }

    const { error } = await admin
      .from('chapters')
      .update({ is_published: isPublished })
      .eq('id', chapterId)

    if (error) throw error

    revalidatePath('/admin/chapters')
    revalidatePath(`/admin/chapters/${chapterId}`)

    return { success: true }
  } catch (error) {
    console.error('Error publishing chapter:', error)
    throw error
  }
}

export async function createStep(chapterId: string, data: any) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    const { data: step, error } = await admin
      .from('chapter_steps')
      .insert({
        ...data,
        chapter_id: chapterId,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath(`/admin/chapters/${chapterId}`)

    return { success: true, step }
  } catch (error) {
    console.error('Error creating step:', error)
    throw error
  }
}

export async function updateStep(stepId: string, data: any) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    const { error } = await admin
      .from('chapter_steps')
      .update(data)
      .eq('id', stepId)

    if (error) throw error

    revalidatePath('/admin/chapters')

    return { success: true }
  } catch (error) {
    console.error('Error updating step:', error)
    throw error
  }
}

export async function deleteStep(stepId: string) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    const { error } = await admin
      .from('chapter_steps')
      .delete()
      .eq('id', stepId)

    if (error) throw error

    revalidatePath('/admin/chapters')

    return { success: true }
  } catch (error) {
    console.error('Error deleting step:', error)
    throw error
  }
}

export async function createPage(stepId: string, data: any) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    const { data: page, error } = await admin
      .from('step_pages')
      .insert({
        ...data,
        step_id: stepId,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/admin/chapters')

    return { success: true, page }
  } catch (error) {
    console.error('Error creating page:', error)
    throw error
  }
}

export async function updatePage(pageId: string, data: any) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    const { error } = await admin
      .from('step_pages')
      .update(data)
      .eq('id', pageId)

    if (error) throw error

    revalidatePath('/admin/chapters')

    return { success: true }
  } catch (error) {
    console.error('Error updating page:', error)
    throw error
  }
}

export async function deletePage(pageId: string) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    const { error } = await admin
      .from('step_pages')
      .delete()
      .eq('id', pageId)

    if (error) throw error

    revalidatePath('/admin/chapters')

    return { success: true }
  } catch (error) {
    console.error('Error deleting page:', error)
    throw error
  }
}

export async function updatePageContent(pageId: string, content: any[]) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    // Validate blocks before saving
    const { validateBlocks } = await import('@/lib/blocks/validator')
    const validation = validateBlocks(content)
    
    if (!validation.valid) {
      throw new Error(`Invalid block content: ${validation.errors.join('; ')}`)
    }

    const { error } = await admin
      .from('step_pages')
      .update({ content })
      .eq('id', pageId)

    if (error) throw error

    revalidatePath('/admin/chapters')

    return { success: true }
  } catch (error) {
    console.error('Error updating page content:', error)
    throw error
  }
}

export async function toggleStepRequired(stepId: string, isRequired: boolean) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    const { error } = await admin
      .from('chapter_steps')
      .update({ is_required: isRequired })
      .eq('id', stepId)

    if (error) throw error

    revalidatePath('/admin/chapters')

    return { success: true }
  } catch (error) {
    console.error('Error toggling step required:', error)
    throw error
  }
}

export async function adminEnsureRequiredSteps(chapterId: string) {
  await requireAuth('admin')
  const admin = createAdminClient()

  const CANONICAL_STEPS = [
    { step_type: 'read',          slug: 'read',          title: 'Reading',      order_index: 0 },
    { step_type: 'self_check',    slug: 'assessment',    title: 'Self-Check',   order_index: 1 },
    { step_type: 'framework',     slug: 'framework',     title: 'Framework',    order_index: 2 },
    { step_type: 'techniques',    slug: 'techniques',    title: 'Techniques',   order_index: 3 },
    { step_type: 'resolution',    slug: 'proof',         title: 'Resolution',   order_index: 4 },
    { step_type: 'follow_through',slug: 'follow-through',title: 'Follow-Through',order_index: 5 },
  ]

  try {
    // Fetch existing steps for this chapter
    const { data: existingSteps, error: fetchError } = await admin
      .from('chapter_steps')
      .select('step_type')
      .eq('chapter_id', chapterId)

    if (fetchError) throw fetchError

    const existingStepTypes = new Set(existingSteps?.map(s => s.step_type) || [])

    // Find missing steps
    const missingSteps = CANONICAL_STEPS.filter(cs => !existingStepTypes.has(cs.step_type))

    // Insert missing steps
    let createdCount = 0
    if (missingSteps.length > 0) {
      const stepsToInsert = missingSteps.map(step => ({
        chapter_id: chapterId,
        step_type: step.step_type,
        slug: step.slug,
        title: step.title,
        order_index: step.order_index,
        is_required: true,
      }))

      const { error: insertError } = await admin
        .from('chapter_steps')
        .insert(stepsToInsert)

      if (insertError) throw insertError
      createdCount = stepsToInsert.length
    }

    // Update order_index for all steps to match canonical order
    const { data: allSteps, error: allStepsError } = await admin
      .from('chapter_steps')
      .select('id, step_type')
      .eq('chapter_id', chapterId)

    if (allStepsError) throw allStepsError

    for (const step of allSteps || []) {
      const canonical = CANONICAL_STEPS.find(cs => cs.step_type === step.step_type)
      if (canonical) {
        await admin
          .from('chapter_steps')
          .update({ order_index: canonical.order_index })
          .eq('id', step.id)
      }
    }

    revalidatePath('/admin/chapters')
    revalidatePath(`/admin/chapters/${chapterId}`)

    return { success: true, createdCount }
  } catch (error) {
    console.error('Error ensuring required steps:', error)
    throw error
  }
}

export async function reorderSteps(chapterId: string, stepOrder: { id: string; order_index: number }[]) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    // Update each step's order_index
    for (const step of stepOrder) {
      const { error } = await admin
        .from('chapter_steps')
        .update({ order_index: step.order_index })
        .eq('id', step.id)
        .eq('chapter_id', chapterId)

      if (error) throw error
    }

    revalidatePath('/admin/chapters')

    return { success: true }
  } catch (error) {
    console.error('Error reordering steps:', error)
    throw error
  }
}

export async function reorderPages(stepId: string, pageOrder: { id: string; order_index: number }[]) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    // Update each page's order_index
    for (const page of pageOrder) {
      const { error } = await admin
        .from('step_pages')
        .update({ order_index: page.order_index })
        .eq('id', page.id)
        .eq('step_id', stepId)

      if (error) throw error
    }

    revalidatePath('/admin/chapters')

    return { success: true }
  } catch (error) {
    console.error('Error reordering pages:', error)
    throw error
  }
}

export async function duplicateStep(stepId: string, targetChapterId: string) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    // Get original step
    const { data: originalStep, error: stepError } = await admin
      .from('chapter_steps')
      .select('*')
      .eq('id', stepId)
      .single()

    if (stepError) throw stepError

    // Get all pages for the step
    const { data: originalPages, error: pagesError } = await admin
      .from('step_pages')
      .select('*')
      .eq('step_id', stepId)
      .order('order_index')

    if (pagesError) throw pagesError

    // Create new step
    const { data: newStep, error: createStepError } = await admin
      .from('chapter_steps')
      .insert({
        chapter_id: targetChapterId,
        step_type: originalStep.step_type,
        title: `${originalStep.title} (Copy)`,
        slug: `${originalStep.slug}-copy`,
        order_index: originalStep.order_index,
        is_required: originalStep.is_required,
      })
      .select()
      .single()

    if (createStepError) throw createStepError

    // Copy all pages
    if (originalPages && originalPages.length > 0) {
      const newPages = originalPages.map(page => ({
        step_id: newStep.id,
        slug: page.slug,
        title: page.title,
        order_index: page.order_index,
        estimated_minutes: page.estimated_minutes,
        xp_award: page.xp_award,
        content: page.content,
      }))

      const { error: insertPagesError } = await admin
        .from('step_pages')
        .insert(newPages)

      if (insertPagesError) throw insertPagesError
    }

    revalidatePath('/admin/chapters')

    return { success: true, step: newStep }
  } catch (error) {
    console.error('Error duplicating step:', error)
    throw error
  }
}

export async function bulkDeletePages(pageIds: string[]) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    const { error } = await admin
      .from('step_pages')
      .delete()
      .in('id', pageIds)

    if (error) throw error

    revalidatePath('/admin/chapters')

    return { success: true }
  } catch (error) {
    console.error('Error bulk deleting pages:', error)
    throw error
  }
}

export async function bulkMovePages(pageIds: string[], targetStepId: string) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    const { error } = await admin
      .from('step_pages')
      .update({ step_id: targetStepId })
      .in('id', pageIds)

    if (error) throw error

    revalidatePath('/admin/chapters')

    return { success: true }
  } catch (error) {
    console.error('Error bulk moving pages:', error)
    throw error
  }
}

export async function bulkDuplicatePages(pageIds: string[], targetStepId: string) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    // Get original pages
    const { data: originalPages, error: fetchError } = await admin
      .from('step_pages')
      .select('*')
      .in('id', pageIds)

    if (fetchError) throw fetchError

    if (!originalPages || originalPages.length === 0) {
      return { success: true }
    }

    // Get max order_index in target step
    const { data: targetPages } = await admin
      .from('step_pages')
      .select('order_index')
      .eq('step_id', targetStepId)
      .order('order_index', { ascending: false })
      .limit(1)

    const maxOrder = targetPages?.[0]?.order_index || 0

    // Create duplicates
    const newPages = originalPages.map((page, index) => ({
      step_id: targetStepId,
      slug: `${page.slug}-copy`,
      title: `${page.title} (Copy)`,
      order_index: maxOrder + index + 1,
      estimated_minutes: page.estimated_minutes,
      xp_award: page.xp_award,
      content: page.content,
    }))

    const { error: insertError } = await admin
      .from('step_pages')
      .insert(newPages)

    if (insertError) throw insertError

    revalidatePath('/admin/chapters')

    return { success: true }
  } catch (error) {
    console.error('Error bulk duplicating pages:', error)
    throw error
  }
}

// ============================================================================
// XP SYSTEM MANAGEMENT
// ============================================================================

export async function getXPSystemStats() {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    // OPTIMIZED: Parallelize queries
    const [
      { data: gamification },
      { data: userBadges }
    ] = await Promise.all([
      admin.from('user_gamification').select('total_xp, level, current_streak'),
      admin.from('user_badges').select('id').limit(1000)
    ])

    const totalXP = gamification?.reduce((sum, g) => sum + (g.total_xp || 0), 0) || 0
    const avgLevel = gamification?.length
      ? (gamification.reduce((sum, g) => sum + (g.level || 1), 0) / gamification.length).toFixed(1)
      : '1.0'
    const activeStreaks = gamification?.filter(g => (g.current_streak || 0) > 0).length || 0

    // XP distribution
    const xpDistribution = {
      '0-100': 0,
      '101-500': 0,
      '501-1000': 0,
      '1001-2000': 0,
      '2000+': 0,
    }

    gamification?.forEach(g => {
      const xp = g.total_xp || 0
      if (xp <= 100) xpDistribution['0-100']++
      else if (xp <= 500) xpDistribution['101-500']++
      else if (xp <= 1000) xpDistribution['501-1000']++
      else if (xp <= 2000) xpDistribution['1001-2000']++
      else xpDistribution['2000+']++
    })

    // Top users by XP
    const topUsersRaw = gamification
      ?.sort((a, b) => (b.total_xp || 0) - (a.total_xp || 0))
      .slice(0, 10) || []

    const topUserIds = topUsersRaw.map((u: any) => u.user_id).filter(Boolean)
    const { data: topProfiles } = topUserIds.length > 0
      ? await admin.from('profiles').select('id, full_name, email').in('id', topUserIds)
      : { data: [] }

    const topUsers = topUsersRaw.map((u: any) => ({
      ...u,
      profiles: topProfiles?.find((p: any) => p.id === u.user_id),
    }))

    return {
      totalXP,
      avgLevel: parseFloat(avgLevel),
      activeStreaks,
      badgesAwarded: userBadges?.length || 0,
      xpDistribution,
      topUsers,
    }
  } catch (error) {
    console.error('Error fetching XP system stats:', error)
    throw error
  }
}

export async function getAllXPLogs(filters?: {
  userId?: string
  reason?: string
  dateFrom?: string
  dateTo?: string
}, pagination?: {
  page: number
  perPage: number
}) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    let query = admin
      .from('xp_logs')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId)
    }

    if (filters?.reason) {
      query = query.eq('reason', filters.reason)
    }

    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom)
    }

    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo)
    }

    const { data: xpLogs, error } = await query

    if (error) throw error

    // Get user info for XP logs
    const userIds = xpLogs?.map(x => x.user_id).filter(Boolean) || []
    const { data: users } = await admin
      .from('profiles')
      .select('id, full_name, email')
      .in('id', userIds)

    // Merge user data
    const logsWithUsers = xpLogs?.map(log => ({
      ...log,
      profiles: users?.find(u => u.id === log.user_id)
    })) || []

    // Apply pagination
    const page = pagination?.page || 1
    const perPage = pagination?.perPage || 50
    const start = (page - 1) * perPage
    const end = start + perPage
    const paginatedLogs = logsWithUsers.slice(start, end)

    return {
      logs: paginatedLogs,
      total: logsWithUsers.length,
      page,
      perPage,
      totalPages: Math.ceil(logsWithUsers.length / perPage),
    }
  } catch (error) {
    console.error('Error fetching XP logs:', error)
    throw error
  }
}

export async function getAllBadges() {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    const { data: badges, error } = await admin
      .from('badges')
      .select(`
        *,
        user_badges (id)
      `)
      .order('id', { ascending: true })
      .limit(50) // OPTIMIZED: Add pagination limit

    if (error) throw error

    return badges?.map(badge => ({
      ...badge,
      timesAwarded: badge.user_badges?.length || 0,
    })) || []
  } catch (error) {
    console.error('Error fetching badges:', error)
    throw error
  }
}

export async function createBadge(data: any) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    const { data: badge, error } = await admin
      .from('badges')
      .insert(data)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/admin/xp')

    return { success: true, badge }
  } catch (error) {
    console.error('Error creating badge:', error)
    throw error
  }
}

export async function updateBadge(badgeId: number, data: any) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    const { error } = await admin
      .from('badges')
      .update(data)
      .eq('id', badgeId)

    if (error) throw error

    revalidatePath('/admin/xp')

    return { success: true }
  } catch (error) {
    console.error('Error updating badge:', error)
    throw error
  }
}

export async function deleteBadge(badgeId: number) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    const { error } = await admin
      .from('badges')
      .delete()
      .eq('id', badgeId)

    if (error) throw error

    revalidatePath('/admin/xp')

    return { success: true }
  } catch (error) {
    console.error('Error deleting badge:', error)
    throw error
  }
}

export async function setUserXP(userId: string, newTotalXP: number, reason: string) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    newTotalXP = Math.max(0, Math.floor(newTotalXP))
    const newLevel = Math.floor(Math.pow(newTotalXP / 100, 0.45)) + 1

    const { data: existing } = await admin
      .from('user_gamification')
      .select('total_xp')
      .eq('user_id', userId)
      .single()

    const currentXP = existing?.total_xp || 0
    const amount = newTotalXP - currentXP

    if (existing) {
      const { error: updateError } = await admin
        .from('user_gamification')
        .update({ total_xp: newTotalXP, level: newLevel })
        .eq('user_id', userId)
      if (updateError) throw updateError
    } else {
      const { error: insertError } = await admin
        .from('user_gamification')
        .insert({
          user_id: userId,
          total_xp: newTotalXP,
          level: newLevel,
          current_streak: 0,
          longest_streak: 0,
        })
      if (insertError) throw insertError
    }

    if (amount !== 0) {
      await admin.from('xp_logs').insert({
        user_id: userId,
        reason: 'manual_adjustment',
        amount,
        metadata: { admin_reason: reason },
      })
    }

    revalidatePath('/admin/xp')
    revalidatePath(`/admin/users/${userId}`)
    return { success: true, newXP: newTotalXP, newLevel }
  } catch (error) {
    console.error('Error setting user XP:', error)
    throw error
  }
}

export async function deleteXPLog(logId: string) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    const { error } = await admin.from('xp_logs').delete().eq('id', logId)
    if (error) throw error
    revalidatePath('/admin/xp')
    return { success: true }
  } catch (error) {
    console.error('Error deleting XP log:', error)
    throw error
  }
}

export async function getUserBadges(userId: string) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    const { data: userBadges, error } = await admin
      .from('user_badges')
      .select('*, badges(*)')
      .eq('user_id', userId)
    if (error) throw error
    return userBadges || []
  } catch (error) {
    console.error('Error fetching user badges:', error)
    throw error
  }
}

export async function getChapterXPOverview() {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    const [{ data: chapters, error: chaptersError }, { data: steps, error: stepsError }, { data: pages, error: pagesError }] =
      await Promise.all([
        admin
          .from('chapters')
          .select('id, chapter_number, title')
          .order('chapter_number', { ascending: true }),
        admin
          .from('chapter_steps')
          .select('id, chapter_id'),
        admin
          .from('step_pages')
          .select('step_id, xp_award'),
      ])

    if (chaptersError) throw chaptersError
    if (stepsError) throw stepsError
    if (pagesError) throw pagesError

    const stepToChapter = new Map<string, string>()
    steps?.forEach((s: any) => {
      if (s.id && s.chapter_id) {
        stepToChapter.set(s.id, s.chapter_id)
      }
    })

    const chapterStats: Record<
      string,
      { pageCount: number; totalXP: number; minXP: number | null; maxXP: number | null }
    > = {}

    pages?.forEach((p: any) => {
      const chapterId = stepToChapter.get(p.step_id)
      if (!chapterId) return

      const xp = typeof p.xp_award === 'number' ? p.xp_award : 0
      const stats = chapterStats[chapterId] || {
        pageCount: 0,
        totalXP: 0,
        minXP: null,
        maxXP: null,
      }

      stats.pageCount += 1
      stats.totalXP += xp
      stats.minXP = stats.minXP === null ? xp : Math.min(stats.minXP, xp)
      stats.maxXP = stats.maxXP === null ? xp : Math.max(stats.maxXP, xp)

      chapterStats[chapterId] = stats
    })

    return (
      chapters?.map((c: any) => {
        const stats = chapterStats[c.id] || {
          pageCount: 0,
          totalXP: 0,
          minXP: null,
          maxXP: null,
        }
        const avgXP = stats.pageCount > 0 ? stats.totalXP / stats.pageCount : 0

        return {
          id: c.id,
          chapter_number: c.chapter_number,
          title: c.title,
          pageCount: stats.pageCount,
          totalXP: stats.totalXP,
          avgXP,
          minXP: stats.minXP,
          maxXP: stats.maxXP,
        }
      }) || []
    )
  } catch (error) {
    console.error('Error fetching chapter XP overview:', error)
    throw error
  }
}

export async function setChapterXPForAllPages(chapterId: string, xpPerPage: number) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    const safeXP = Math.max(0, Math.floor(xpPerPage))

    const { data: steps, error: stepsError } = await admin
      .from('chapter_steps')
      .select('id')
      .eq('chapter_id', chapterId)

    if (stepsError) throw stepsError

    const stepIds = (steps || []).map((s: any) => s.id).filter(Boolean)
    if (stepIds.length === 0) {
      return { success: true, updatedPages: 0 }
    }

    const { error: updateError } = await admin
      .from('step_pages')
      .update({ xp_award: safeXP })
      .in('step_id', stepIds)

    if (updateError) throw updateError

    revalidatePath('/admin/xp')
    revalidatePath('/admin/chapters')

    return { success: true }
  } catch (error) {
    console.error('Error setting chapter XP for pages:', error)
    throw error
  }
}

// ============================================================================
// ANALYTICS
// ============================================================================

export async function getUserEngagementStats(dateRange?: { from: string; to: string }) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    // OPTIMIZED: Parallelize queries
    const [
      { data: profiles },
      { data: gamification }
    ] = await Promise.all([
      admin.from('profiles').select('created_at'),
      admin.from('user_gamification').select('last_active_date')
    ])

    // Calculate DAU, WAU, MAU
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const dau = gamification?.filter(g => 
      g.last_active_date && new Date(g.last_active_date) >= oneDayAgo
    ).length || 0

    const wau = gamification?.filter(g => 
      g.last_active_date && new Date(g.last_active_date) >= oneWeekAgo
    ).length || 0

    const mau = gamification?.filter(g => 
      g.last_active_date && new Date(g.last_active_date) >= oneMonthAgo
    ).length || 0

    return {
      dau,
      wau,
      mau,
      totalUsers: profiles?.length || 0,
    }
  } catch (error) {
    console.error('Error fetching engagement stats:', error)
    throw error
  }
}

export async function getChapterAnalytics() {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    // OPTIMIZED: Parallelize queries
    const [
      { data: chapters },
      { data: progress }
    ] = await Promise.all([
      admin.from('chapters').select('id, chapter_number, title').limit(100),
      admin.from('chapter_progress').select('chapter_id, chapter_complete')
    ])

    // Calculate completion rates
    const chapterStats = chapters?.map(chapter => {
      const chapterProgress = progress?.filter(p => p.chapter_id === chapter.chapter_number) || []
      const completed = chapterProgress.filter(p => p.chapter_complete).length
      const total = chapterProgress.length

      return {
        ...chapter,
        completionRate: total > 0 ? (completed / total) * 100 : 0,
        totalAttempts: total,
        totalCompleted: completed,
      }
    }) || []

    return chapterStats
  } catch (error) {
    console.error('Error fetching chapter analytics:', error)
    throw error
  }
}

export async function getProgressMetrics() {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    // OPTIMIZED: Parallelize queries
    const [
      { data: progress },
      { data: profiles }
    ] = await Promise.all([
      admin.from('chapter_progress').select('*'),
      admin.from('profiles').select('id')
    ])

    const totalUsers = profiles?.length || 0
    const usersWithProgress = new Set(progress?.map(p => p.user_id)).size

    // Calculate average chapters completed
    const chaptersPerUser: Record<string, number> = {}
    progress?.forEach(p => {
      if (p.chapter_complete) {
        chaptersPerUser[p.user_id] = (chaptersPerUser[p.user_id] || 0) + 1
      }
    })

    const avgChaptersCompleted = Object.values(chaptersPerUser).length > 0
      ? Object.values(chaptersPerUser).reduce((sum, count) => sum + count, 0) / Object.values(chaptersPerUser).length
      : 0

    return {
      totalUsers,
      usersWithProgress,
      avgChaptersCompleted: avgChaptersCompleted.toFixed(1),
    }
  } catch (error) {
    console.error('Error fetching progress metrics:', error)
    throw error
  }
}

// ============================================================================
// PAGE CONTENT MANAGEMENT
// ============================================================================

export async function getPageWithContent(pageId: string) {
  await requireAuth('admin')
  const admin = createAdminClient()
  
  try {
    const { data, error } = await admin
      .from('step_pages')
      .select('*')
      .eq('id', pageId)
      .single()
    
    if (error) {
      console.error('Error fetching page:', error)
      throw new Error(`Failed to fetch page: ${error.message}`)
    }
    
    return data
  } catch (error) {
    console.error('Error in getPageWithContent:', error)
    throw error
  }
}

export async function getAllPagesForStep(stepId: string) {
  await requireAuth('admin')
  const admin = createAdminClient()
  
  try {
    const { data, error } = await admin
      .from('step_pages')
      .select('*')
      .eq('step_id', stepId)
      .order('order_index')
    
    if (error) {
      console.error('Error fetching pages:', error)
      throw new Error(`Failed to fetch pages: ${error.message}`)
    }
    
    return data || []
  } catch (error) {
    console.error('Error in getAllPagesForStep:', error)
    throw error
  }
}

// OPTIMIZED: Batch fetch all pages for a chapter (fixes N+1 pattern)
export async function getAllPagesForChapter(chapterId: string) {
  await requireAuth('admin')
  const admin = createAdminClient()
  
  try {
    // First get all steps for this chapter
    const { data: steps, error: stepsError } = await admin
      .from('chapter_steps')
      .select('id')
      .eq('chapter_id', chapterId)
    
    if (stepsError) {
      console.error('Error fetching steps:', stepsError)
      throw new Error(`Failed to fetch steps: ${stepsError.message}`)
    }
    
    if (!steps || steps.length === 0) {
      return []
    }
    
    const stepIds = steps.map(s => s.id)
    
    // Then fetch all pages for these steps in one query
    const { data: pages, error: pagesError } = await admin
      .from('step_pages')
      .select('*')
      .in('step_id', stepIds)
      .order('order_index')
    
    if (pagesError) {
      console.error('Error fetching pages:', pagesError)
      throw new Error(`Failed to fetch pages: ${pagesError.message}`)
    }
    
    return pages || []
  } catch (error) {
    console.error('Error in getAllPagesForChapter:', error)
    throw error
  }
}

export async function duplicatePage(pageId: string) {
  await requireAuth('admin')
  const admin = createAdminClient()
  
  try {
    // Get original page
    const { data: original, error: fetchError } = await admin
      .from('step_pages')
      .select('*')
      .eq('id', pageId)
      .single()
    
    if (fetchError) throw fetchError
    
    // Create duplicate
    const { data: duplicate, error: createError } = await admin
      .from('step_pages')
      .insert({
        ...original,
        id: undefined,
        title: `${original.title} (Copy)`,
        slug: `${original.slug}-copy`,
      })
      .select()
      .single()
    
    if (createError) throw createError
    
    revalidatePath('/admin/chapters')
    
    return { success: true, page: duplicate }
  } catch (error) {
    console.error('Error duplicating page:', error)
    throw error
  }
}

// ============================================
// Storage Management Actions
// ============================================

export async function listStorageImages(path?: string) {
  'use server'
  await requireAuth('admin')
  
  const { listAllImages } = await import('@/lib/storage/management')
  return await listAllImages(path)
}

export async function deleteStorageImage(path: string) {
  'use server'
  await requireAuth('admin')
  
  const { deleteImage } = await import('@/lib/storage/management')
  return await deleteImage(path)
}

export async function getStorageImageUrl(path: string) {
  'use server'
  await requireAuth('admin')
  
  const admin = createAdminClient()
  const { data: { publicUrl } } = admin.storage
    .from('chapter-assets')
    .getPublicUrl(path)
  
  return publicUrl
}

export async function getImageUsage(imageUrl: string) {
  'use server'
  await requireAuth('admin')
  
  const admin = createAdminClient()
  
  try {
    const { data: references, error } = await admin
      .from('image_references')
      .select(`
        *,
        chapters!image_references_chapter_id_fkey(id, title, chapter_number),
        chapter_steps!image_references_step_id_fkey(id, title, step_type),
        step_pages!image_references_page_id_fkey(id, title)
      `)
      .eq('image_url', imageUrl)
    
    if (error) {
      console.error('Error fetching image usage:', error)
      return []
    }
    
    return references || []
  } catch (error) {
    console.error('Exception getting image usage:', error)
    return []
  }
}

// ============================================
// Chapter Duplication
// ============================================

export async function duplicateChapter(chapterId: string, newChapterNumber: number) {
  'use server'
  await requireAuth('admin')
  
  const admin = createAdminClient()
  
  try {
    // 1. Fetch source chapter
    const { data: sourceChapter, error: chapterError } = await admin
      .from('chapters')
      .select('*')
      .eq('id', chapterId)
      .single()
    
    if (chapterError || !sourceChapter) {
      throw new Error('Source chapter not found')
    }
    
    // 2. Fetch all steps
    const { data: sourceSteps, error: stepsError } = await admin
      .from('chapter_steps')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('order_index')
    
    if (stepsError) {
      throw new Error(`Failed to fetch steps: ${stepsError.message}`)
    }
    
    // 3. Fetch all pages for all steps
    const stepIds = (sourceSteps || []).map(s => s.id)
    const { data: sourcePages, error: pagesError } = await admin
      .from('step_pages')
      .select('*')
      .in('step_id', stepIds)
      .order('order_index')
    
    if (pagesError) {
      throw new Error(`Failed to fetch pages: ${pagesError.message}`)
    }
    
    // 4. Create new chapter
    const newSlug = `${sourceChapter.slug}-copy-${Date.now()}`
    const { data: newChapter, error: createChapterError } = await admin
      .from('chapters')
      .insert({
        part_id: sourceChapter.part_id,
        chapter_number: newChapterNumber,
        slug: newSlug,
        title: `${sourceChapter.title} (Copy)`,
        subtitle: sourceChapter.subtitle,
        thumbnail_url: sourceChapter.thumbnail_url,
        hero_image_url: sourceChapter.hero_image_url,
        pdf_url: sourceChapter.pdf_url,
        framework_code: sourceChapter.framework_code,
        framework_letters: sourceChapter.framework_letters,
        framework_letter_images: sourceChapter.framework_letter_images,
        order_index: newChapterNumber,
        level_min: sourceChapter.level_min,
        is_published: false, // Start as draft
      })
      .select()
      .single()
    
    if (createChapterError || !newChapter) {
      throw new Error(`Failed to create chapter: ${createChapterError?.message}`)
    }
    
    // 5. Clone all steps
    const stepIdMap: Record<string, string> = {}
    
    for (const sourceStep of sourceSteps || []) {
      const { data: newStep, error: createStepError } = await admin
        .from('chapter_steps')
        .insert({
          chapter_id: newChapter.id,
          step_type: sourceStep.step_type,
          title: sourceStep.title,
          slug: sourceStep.slug,
          order_index: sourceStep.order_index,
          is_required: sourceStep.is_required,
          hero_image_url: sourceStep.hero_image_url,
          unlock_rule: sourceStep.unlock_rule,
        })
        .select()
        .single()
      
      if (createStepError || !newStep) {
        throw new Error(`Failed to create step: ${createStepError?.message}`)
      }
      
      stepIdMap[sourceStep.id] = newStep.id
    }
    
    // 6. Clone all pages
    for (const sourcePage of sourcePages || []) {
      const newStepId = stepIdMap[sourcePage.step_id]
      if (!newStepId) continue
      
      // Deep clone content blocks (this also clones image URLs)
      const clonedContent = JSON.parse(JSON.stringify(sourcePage.content))
      
      const { error: createPageError } = await admin
        .from('step_pages')
        .insert({
          step_id: newStepId,
          slug: sourcePage.slug,
          title: sourcePage.title,
          order_index: sourcePage.order_index,
          estimated_minutes: sourcePage.estimated_minutes,
          xp_award: sourcePage.xp_award,
          chunk_id: sourcePage.chunk_id,
          content: clonedContent,
        })
      
      if (createPageError) {
        throw new Error(`Failed to create page: ${createPageError.message}`)
      }
    }
    
    revalidatePath('/admin/chapters')
    
    return { success: true, chapterId: newChapter.id, slug: newChapter.slug }
  } catch (error: any) {
    console.error('Error duplicating chapter:', error)
    throw new Error(error.message || 'Failed to duplicate chapter')
  }
}

// ============================================
// Bulk Operations
// ============================================

export async function bulkPublishChapters(chapterIds: string[], isPublished: boolean) {
  'use server'
  await requireAuth('admin')
  
  const admin = createAdminClient()
  
  try {
    const { error } = await admin
      .from('chapters')
      .update({ is_published: isPublished })
      .in('id', chapterIds)
    
    if (error) {
      throw new Error(error.message)
    }
    
    revalidatePath('/admin/chapters')
    
    return { success: true, count: chapterIds.length }
  } catch (error: any) {
    console.error('Error bulk publishing chapters:', error)
    throw new Error(error.message || 'Failed to bulk publish')
  }
}

export async function bulkDeleteChapters(chapterIds: string[]) {
  'use server'
  await requireAuth('admin')
  
  const admin = createAdminClient()
  
  try {
    // Delete chapters (cascade will handle steps and pages)
    const { error } = await admin
      .from('chapters')
      .delete()
      .in('id', chapterIds)
    
    if (error) {
      throw new Error(error.message)
    }
    
    revalidatePath('/admin/chapters')
    
    return { success: true, count: chapterIds.length }
  } catch (error: any) {
    console.error('Error bulk deleting chapters:', error)
    throw new Error(error.message || 'Failed to bulk delete')
  }
}

// ============================================
// Import/Export
// ============================================

export interface ChapterExportData {
  version: string
  chapter: {
    chapter_number: number
    slug: string
    title: string
    subtitle: string | null
    thumbnail_url: string | null
    hero_image_url: string | null
    pdf_url: string | null
    framework_code: string | null
    framework_letters: string[] | null
    framework_letter_images: string[] | null
    level_min: number
    part_id: string
  }
  steps: Array<{
    step_type: string
    title: string
    slug: string
    order_index: number
    is_required: boolean
    hero_image_url: string | null
    unlock_rule: any | null
    pages: Array<{
      slug: string
      title: string | null
      order_index: number
      estimated_minutes: number | null
      xp_award: number
      chunk_id: number | null
      content: any[]
    }>
  }>
  images: Array<{
    originalPath: string
    filename: string
    url: string
  }>
}

export async function exportChapter(chapterId: string): Promise<ChapterExportData> {
  'use server'
  await requireAuth('admin')
  
  const admin = createAdminClient()
  
  try {
    // Fetch chapter
    const { data: chapter, error: chapterError } = await admin
      .from('chapters')
      .select('*')
      .eq('id', chapterId)
      .single()
    
    if (chapterError || !chapter) {
      throw new Error('Chapter not found')
    }
    
    // Fetch all steps
    const { data: steps, error: stepsError } = await admin
      .from('chapter_steps')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('order_index')
    
    if (stepsError) {
      throw new Error(`Failed to fetch steps: ${stepsError.message}`)
    }
    
    // Fetch all pages for all steps
    const stepIds = (steps || []).map(s => s.id)
    const { data: pages, error: pagesError } = stepIds.length > 0
      ? await admin
          .from('step_pages')
          .select('*')
          .in('step_id', stepIds)
          .order('order_index')
      : { data: [], error: null }
    
    if (pagesError) {
      throw new Error(`Failed to fetch pages: ${pagesError.message}`)
    }
    
    // Group pages by step
    const pagesByStep: Record<string, any[]> = {}
    for (const page of pages || []) {
      if (!pagesByStep[page.step_id]) {
        pagesByStep[page.step_id] = []
      }
      pagesByStep[page.step_id].push(page)
    }
    
    // Collect all image URLs from chapter and content
    const imageUrls = new Set<string>()
    
    // Chapter images
    if (chapter.thumbnail_url) imageUrls.add(chapter.thumbnail_url)
    if (chapter.hero_image_url) imageUrls.add(chapter.hero_image_url)
    if (chapter.pdf_url) imageUrls.add(chapter.pdf_url)
    if (chapter.framework_letter_images) {
      chapter.framework_letter_images.forEach(url => imageUrls.add(url))
    }
    
    // Step images
    for (const step of steps || []) {
      if (step.hero_image_url) imageUrls.add(step.hero_image_url)
    }
    
    // Page content images
    for (const page of pages || []) {
      if (page.content && Array.isArray(page.content)) {
        for (const block of page.content) {
          if (block.type === 'image' && block.src) {
            imageUrls.add(block.src)
          }
        }
      }
    }
    
    // Format image metadata
    const images = Array.from(imageUrls).map(url => ({
      originalPath: url,
      filename: url.split('/').pop() || url,
      url
    }))
    
    // Build export data
    const exportData: ChapterExportData = {
      version: '1.0',
      chapter: {
        chapter_number: chapter.chapter_number,
        slug: chapter.slug,
        title: chapter.title,
        subtitle: chapter.subtitle,
        thumbnail_url: chapter.thumbnail_url,
        hero_image_url: chapter.hero_image_url,
        pdf_url: chapter.pdf_url,
        framework_code: chapter.framework_code,
        framework_letters: chapter.framework_letters,
        framework_letter_images: chapter.framework_letter_images,
        level_min: chapter.level_min,
        part_id: chapter.part_id,
      },
      steps: (steps || []).map(step => ({
        step_type: step.step_type,
        title: step.title,
        slug: step.slug,
        order_index: step.order_index,
        is_required: step.is_required,
        hero_image_url: step.hero_image_url,
        unlock_rule: step.unlock_rule,
        pages: (pagesByStep[step.id] || []).map(page => ({
          slug: page.slug,
          title: page.title,
          order_index: page.order_index,
          estimated_minutes: page.estimated_minutes,
          xp_award: page.xp_award,
          chunk_id: page.chunk_id,
          content: page.content,
        })),
      })),
      images,
    }
    
    return exportData
  } catch (error: any) {
    console.error('Error exporting chapter:', error)
    throw new Error(error.message || 'Failed to export chapter')
  }
}

export async function exportMultipleChapters(chapterIds: string[]): Promise<ChapterExportData[]> {
  'use server'
  await requireAuth('admin')
  
  try {
    const exports: ChapterExportData[] = []
    
    for (const chapterId of chapterIds) {
      const exportData = await exportChapter(chapterId)
      exports.push(exportData)
    }
    
    return exports
  } catch (error: any) {
    console.error('Error exporting multiple chapters:', error)
    throw new Error(error.message || 'Failed to export chapters')
  }
}

export async function importChapter(data: ChapterExportData): Promise<string> {
  'use server'
  await requireAuth('admin')
  
  const admin = createAdminClient()
  
  try {
    // Validate version
    if (data.version !== '1.0') {
      throw new Error(`Unsupported export version: ${data.version}`)
    }
    
    // Check if part exists
    const { data: partExists, error: partError } = await admin
      .from('parts')
      .select('id')
      .eq('id', data.chapter.part_id)
      .single()
    
    if (partError || !partExists) {
      throw new Error('Part not found. Please create the required part first.')
    }
    
    // Find next available chapter number
    const { data: existingChapters } = await admin
      .from('chapters')
      .select('chapter_number')
      .order('chapter_number', { ascending: false })
      .limit(1)
    
    const maxChapterNumber = existingChapters?.[0]?.chapter_number || 0
    const newChapterNumber = maxChapterNumber + 1
    
    // Generate unique slug
    const timestamp = Date.now()
    const newSlug = `${data.chapter.slug}-imported-${timestamp}`
    
    // Create new chapter
    const { data: newChapter, error: createChapterError } = await admin
      .from('chapters')
      .insert({
        part_id: data.chapter.part_id,
        chapter_number: newChapterNumber,
        slug: newSlug,
        title: `${data.chapter.title} (Imported)`,
        subtitle: data.chapter.subtitle,
        thumbnail_url: data.chapter.thumbnail_url,
        hero_image_url: data.chapter.hero_image_url,
        pdf_url: data.chapter.pdf_url,
        framework_code: data.chapter.framework_code,
        framework_letters: data.chapter.framework_letters,
        framework_letter_images: data.chapter.framework_letter_images,
        order_index: newChapterNumber,
        level_min: data.chapter.level_min,
        is_published: false,
      })
      .select()
      .single()
    
    if (createChapterError || !newChapter) {
      throw new Error(`Failed to create chapter: ${createChapterError?.message}`)
    }
    
    // Create steps with pages
    for (const stepData of data.steps) {
      const { data: newStep, error: createStepError } = await admin
        .from('chapter_steps')
        .insert({
          chapter_id: newChapter.id,
          step_type: stepData.step_type,
          title: stepData.title,
          slug: stepData.slug,
          order_index: stepData.order_index,
          is_required: stepData.is_required,
          hero_image_url: stepData.hero_image_url,
          unlock_rule: stepData.unlock_rule,
        })
        .select()
        .single()
      
      if (createStepError || !newStep) {
        throw new Error(`Failed to create step: ${createStepError?.message}`)
      }
      
      // Create pages for this step
      for (const pageData of stepData.pages) {
        const { error: createPageError } = await admin
          .from('step_pages')
          .insert({
            step_id: newStep.id,
            slug: pageData.slug,
            title: pageData.title,
            order_index: pageData.order_index,
            estimated_minutes: pageData.estimated_minutes,
            xp_award: pageData.xp_award,
            chunk_id: pageData.chunk_id,
            content: pageData.content,
          })
        
        if (createPageError) {
          throw new Error(`Failed to create page: ${createPageError.message}`)
        }
      }
    }
    
    revalidatePath('/admin/chapters')
    
    return newChapter.id
  } catch (error: any) {
    console.error('Error importing chapter:', error)
    throw new Error(error.message || 'Failed to import chapter')
  }
}
