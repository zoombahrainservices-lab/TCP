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
    // Get user stats
    const { data: profiles, error: profilesError } = await admin
      .from('profiles')
      .select('role, created_at')

    if (profilesError) throw profilesError

    const totalUsers = profiles?.length || 0
    const usersByRole = profiles?.reduce((acc, p) => {
      acc[p.role || 'student'] = (acc[p.role || 'student'] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Users active today (have any activity in last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: activeUsers, error: activeUsersError } = await admin
      .from('user_gamification')
      .select('user_id')
      .gte('last_active_date', oneDayAgo)
    
    if (activeUsersError) {
      console.error('Error fetching active users:', activeUsersError)
      // Don't throw, just log - this is non-critical data
    }

    // New users this week
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const newUsersThisWeek = profiles?.filter(p => p.created_at >= oneWeekAgo).length || 0

    // Get chapter stats
    const { data: chapters, error: chaptersError } = await admin
      .from('chapters')
      .select('is_published')
    
    if (chaptersError) {
      console.error('Error fetching chapters:', chaptersError)
      throw new Error(`Failed to fetch chapters: ${chaptersError.message}`)
    }

    const totalChapters = chapters?.length || 0
    const publishedChapters = chapters?.filter(c => c.is_published).length || 0
    const draftChapters = totalChapters - publishedChapters

    // Get XP stats
    const { data: gamification, error: gamificationError } = await admin
      .from('user_gamification')
      .select('total_xp, level')
    
    if (gamificationError) {
      console.error('Error fetching gamification data:', gamificationError)
      // Don't throw, just log - this is non-critical data
    }

    const totalXP = gamification?.reduce((sum, g) => sum + (g.total_xp || 0), 0) || 0
    const avgLevel = gamification?.length 
      ? (gamification.reduce((sum, g) => sum + (g.level || 1), 0) / gamification.length).toFixed(1)
      : '1.0'

    // Get parts count
    const { data: parts, error: partsError } = await admin
      .from('parts')
      .select('id')
    
    if (partsError) {
      console.error('Error fetching parts:', partsError)
      // Don't throw, just log - this is non-critical data
    }

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
    // Get recent user signups
    const { data: recentUsers } = await admin
      .from('profiles')
      .select('id, full_name, email, created_at')
      .order('created_at', { ascending: false })
      .limit(limit)

    // Get recent chapter completions
    const { data: completions } = await admin
      .from('chapter_sessions')
      .select('id, chapter_id, completed_at, user_id')
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(limit)

    // Get user info for completions
    const completionUserIds = completions?.map(c => c.user_id) || []
    const { data: completionUsers } = await admin
      .from('profiles')
      .select('id, full_name, email')
      .in('id', completionUserIds)

    const recentCompletions = completions?.map(c => ({
      ...c,
      profiles: completionUsers?.find(u => u.id === c.user_id)
    })) || []

    // Get recent XP awards
    const { data: xpLogs } = await admin
      .from('xp_logs')
      .select('id, user_id, reason, amount, created_at')
      .order('created_at', { ascending: false })
      .limit(limit)

    // Get user info for XP logs
    const xpUserIds = xpLogs?.map(x => x.user_id) || []
    const { data: xpUsers } = await admin
      .from('profiles')
      .select('id, full_name, email')
      .in('id', xpUserIds)

    const recentXP = xpLogs?.map(x => ({
      ...x,
      profiles: xpUsers?.find(u => u.id === x.user_id)
    })) || []

    return {
      recentUsers: recentUsers || [],
      recentCompletions: recentCompletions || [],
      recentXP: recentXP || [],
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
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError) throw profileError

    const { data: gamification } = await admin
      .from('user_gamification')
      .select('*')
      .eq('user_id', userId)
      .single()

    // Get chapters completed count
    const { data: completedChapters } = await admin
      .from('chapter_progress')
      .select('chapter_id')
      .eq('user_id', userId)
      .eq('chapter_complete', true)

    // Get badges earned
    const { data: badges } = await admin
      .from('user_badges')
      .select(`
        *,
        badges (*)
      `)
      .eq('user_id', userId)

    return {
      profile,
      gamification: gamification || null,
      stats: {
        chaptersCompleted: completedChapters?.length || 0,
        badgesEarned: badges?.length || 0,
      },
      badges: badges || [],
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
    // Get progress
    const { data: progress, error: progressError } = await admin
      .from('chapter_progress')
      .select('*')
      .eq('user_id', userId)
      .order('chapter_id', { ascending: true })

    if (progressError) {
      console.error('Error fetching progress:', progressError)
      throw progressError
    }

    // Get chapters for the progress
    const chapterIds = progress?.map(p => p.chapter_id).filter(Boolean) || []
    const { data: chapters } = await admin
      .from('chapters')
      .select('id, chapter_number, title, slug')
      .in('id', chapterIds)

    // Merge chapter data with progress
    const progressWithChapters = progress?.map(p => ({
      ...p,
      chapters: chapters?.find(c => c.id === p.chapter_id)
    })) || []

    // Get assessment scores
    const { data: assessments } = await admin
      .from('chapter_skill_scores')
      .select('*')
      .eq('user_id', userId)

    // Get chapter sessions
    const { data: sessions } = await admin
      .from('chapter_sessions')
      .select('*')
      .eq('user_id', userId)

    // Get XP breakdown by chapter
    const { data: xpLogs } = await admin
      .from('xp_logs')
      .select('chapter_id, amount')
      .eq('user_id', userId)

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

    // Update gamification
    const { error: updateError } = await admin
      .from('user_gamification')
      .update({ 
        total_xp: newXP,
        level: newLevel,
      })
      .eq('user_id', userId)

    if (updateError) throw updateError

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

export async function duplicateChapter(chapterId: string) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    // Get original chapter
    const { data: original, error: fetchError } = await admin
      .from('chapters')
      .select('*')
      .eq('id', chapterId)
      .single()

    if (fetchError) throw fetchError

    // Create duplicate
    const { data: duplicate, error: createError } = await admin
      .from('chapters')
      .insert({
        ...original,
        id: undefined,
        title: `${original.title} (Copy)`,
        slug: `${original.slug}-copy`,
        is_published: false,
      })
      .select()
      .single()

    if (createError) throw createError

    revalidatePath('/admin/chapters')

    return { success: true, chapter: duplicate }
  } catch (error) {
    console.error('Error duplicating chapter:', error)
    throw error
  }
}

export async function publishChapter(chapterId: string, isPublished: boolean) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
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
    // Total XP distributed
    const { data: gamification } = await admin
      .from('user_gamification')
      .select('total_xp, level, current_streak')

    const totalXP = gamification?.reduce((sum, g) => sum + (g.total_xp || 0), 0) || 0
    const avgLevel = gamification?.length
      ? (gamification.reduce((sum, g) => sum + (g.level || 1), 0) / gamification.length).toFixed(1)
      : '1.0'
    const activeStreaks = gamification?.filter(g => (g.current_streak || 0) > 0).length || 0

    // Badges awarded
    const { data: userBadges } = await admin
      .from('user_badges')
      .select('id')

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
    const topUsers = gamification
      ?.sort((a, b) => (b.total_xp || 0) - (a.total_xp || 0))
      .slice(0, 10) || []

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

// ============================================================================
// ANALYTICS
// ============================================================================

export async function getUserEngagementStats(dateRange?: { from: string; to: string }) {
  await requireAuth('admin')
  const admin = createAdminClient()

  try {
    // This is a simplified version - you'd want more sophisticated analytics
    const { data: profiles } = await admin
      .from('profiles')
      .select('created_at')

    const { data: gamification } = await admin
      .from('user_gamification')
      .select('last_active_date')

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
    const { data: chapters } = await admin
      .from('chapters')
      .select('id, chapter_number, title')

    const { data: progress } = await admin
      .from('chapter_progress')
      .select('chapter_id, chapter_complete')

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
    const { data: progress } = await admin
      .from('chapter_progress')
      .select('*')

    const { data: profiles } = await admin
      .from('profiles')
      .select('id')

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
