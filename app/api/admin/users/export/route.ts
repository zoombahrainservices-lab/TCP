import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    await requireAuth('admin')
    const admin = createAdminClient()

    // Fetch all users with gamification data
    const { data: users, error } = await admin
      .from('profiles')
      .select(`
        *,
        user_gamification (
          total_xp,
          level,
          current_streak,
          longest_streak,
          last_active_date
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Convert to CSV
    const headers = [
      'ID',
      'Email',
      'Full Name',
      'Role',
      'Level',
      'Total XP',
      'Current Streak',
      'Longest Streak',
      'Last Active',
      'Created At',
    ]

    const rows = users?.map((user: any) => {
      const gamification = user.user_gamification?.[0]
      return [
        user.id,
        user.email,
        user.full_name || '',
        user.role || 'student',
        gamification?.level || 1,
        gamification?.total_xp || 0,
        gamification?.current_streak || 0,
        gamification?.longest_streak || 0,
        gamification?.last_active_date || '',
        user.created_at,
      ]
    }) || []

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error exporting users:', error)
    return NextResponse.json(
      { error: 'Failed to export users' },
      { status: 500 }
    )
  }
}
