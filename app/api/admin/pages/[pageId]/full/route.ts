import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/guards'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    await requireAuth('admin')
    const { pageId } = await params
    const supabase = await createClient()

    // Fetch page
    const { data: page, error: pageError } = await supabase
      .from('step_pages')
      .select('*')
      .eq('id', pageId)
      .single()
    
    if (pageError) throw pageError

    // Fetch related chapter and step in parallel
    const [chapterRes, stepRes] = await Promise.all([
      page.chapter_id 
        ? supabase.from('chapters').select('*').eq('id', page.chapter_id).maybeSingle()
        : Promise.resolve({ data: null }),
      page.step_id
        ? supabase.from('chapter_steps').select('*').eq('id', page.step_id).maybeSingle()
        : Promise.resolve({ data: null })
    ])

    return NextResponse.json({
      page,
      chapter: chapterRes.data,
      step: stepRes.data,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
