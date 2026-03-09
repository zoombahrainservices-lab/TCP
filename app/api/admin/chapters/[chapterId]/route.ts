import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/guards'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  try {
    await requireAuth('admin')

    const { chapterId } = await params

    const supabase = await createClient()

    // Support both UUID and chapter number (e.g. /admin/chapters/1 or /admin/chapters/2)
    const isNumericId = /^\d+$/.test(chapterId)
    let query = supabase.from('chapters').select('*')

    if (isNumericId) {
      query = query.eq('chapter_number', Number(chapterId))
    } else {
      query = query.eq('id', chapterId)
    }

    const { data: chapter, error } = await query.single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
    }

    return NextResponse.json(chapter)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
