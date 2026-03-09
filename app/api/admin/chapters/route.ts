import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/guards'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    await requireAuth('admin')
    
    const supabase = await createClient()
    const { data: chapters, error } = await supabase
      .from('chapters')
      .select('*')
      .order('chapter_number', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(chapters)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth('admin')
    const admin = createAdminClient()
    
    const body = await request.json()
    
    const { data: chapter, error } = await admin
      .from('chapters')
      .insert({
        ...body,
        is_published: false,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(chapter)
  } catch (error: any) {
    console.error('Error creating chapter:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
