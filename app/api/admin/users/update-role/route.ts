import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/auth/guards'

export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuth('admin')
    
    const body = await request.json()
    const { userId, role } = body

    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 })
    }

    // Prevent admin from demoting themselves
    if (userId === currentUser.id && role !== 'admin') {
      return NextResponse.json({ error: 'You cannot demote yourself' }, { status: 400 })
    }

    // Use admin client to bypass RLS
    const admin = createAdminClient()
    const { error } = await admin
      .from('profiles')
      .update({ role })
      .eq('id', userId)

    if (error) {
      console.error('Error updating user role:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in update-role route:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
