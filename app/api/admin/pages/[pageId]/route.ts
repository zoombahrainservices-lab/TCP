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
    const { data: page, error } = await supabase
      .from('step_pages')
      .select('*')
      .eq('id', pageId)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(page)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
