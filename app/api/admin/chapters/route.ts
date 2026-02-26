import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/guards'

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
