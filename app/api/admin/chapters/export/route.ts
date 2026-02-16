import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    await requireAuth('admin')
    const admin = createAdminClient()

    // Fetch all parts, chapters, steps, and pages
    const [partsResult, chaptersResult, stepsResult, pagesResult] = await Promise.all([
      admin.from('parts').select('*').order('order_index'),
      admin.from('chapters').select('*').order('order_index'),
      admin.from('chapter_steps').select('*').order('order_index'),
      admin.from('step_pages').select('*').order('order_index'),
    ])

    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      parts: partsResult.data || [],
      chapters: chaptersResult.data || [],
      steps: stepsResult.data || [],
      pages: pagesResult.data || [],
    }

    return NextResponse.json(exportData, {
      headers: {
        'Content-Disposition': `attachment; filename="chapters-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
  } catch (error) {
    console.error('Error exporting chapters:', error)
    return NextResponse.json(
      { error: 'Failed to export chapters' },
      { status: 500 }
    )
  }
}
