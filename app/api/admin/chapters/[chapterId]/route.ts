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
    const { data: chapter, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('id', chapterId)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(chapter)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
