import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    await requireAuth('admin')
    const admin = createAdminClient()
    
    const { data: parts, error } = await admin
      .from('parts')
      .select('*')
      .order('order_index', { ascending: true })

    if (error) throw error

    return NextResponse.json(parts || [])
  } catch (error: any) {
    console.error('Error fetching parts:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
