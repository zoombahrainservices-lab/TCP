import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/guards'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ stepId: string }> }
) {
  try {
    await requireAuth('admin')
    
    const { stepId } = await params
    
    const supabase = await createClient()
    const { data: step, error } = await supabase
      .from('chapter_steps')
      .select('*')
      .eq('id', stepId)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(step)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
