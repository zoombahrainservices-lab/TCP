import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    await requireAuth('admin')
    const admin = createAdminClient()

    const data = await request.json()

    // Validate import data structure
    if (!data.version || !data.parts || !data.chapters) {
      return NextResponse.json(
        { error: 'Invalid import data format' },
        { status: 400 }
      )
    }

    // Import parts
    if (data.parts.length > 0) {
      const { error: partsError } = await admin
        .from('parts')
        .upsert(data.parts, { onConflict: 'id' })
      if (partsError) throw partsError
    }

    // Import chapters
    if (data.chapters.length > 0) {
      const { error: chaptersError } = await admin
        .from('chapters')
        .upsert(data.chapters, { onConflict: 'id' })
      if (chaptersError) throw chaptersError
    }

    // Import steps
    if (data.steps && data.steps.length > 0) {
      const { error: stepsError } = await admin
        .from('chapter_steps')
        .upsert(data.steps, { onConflict: 'id' })
      if (stepsError) throw stepsError
    }

    // Import pages
    if (data.pages && data.pages.length > 0) {
      const { error: pagesError } = await admin
        .from('step_pages')
        .upsert(data.pages, { onConflict: 'id' })
      if (pagesError) throw pagesError
    }

    return NextResponse.json({
      success: true,
      imported: {
        parts: data.parts.length,
        chapters: data.chapters.length,
        steps: data.steps?.length || 0,
        pages: data.pages?.length || 0,
      },
    })
  } catch (error) {
    console.error('Error importing chapters:', error)
    return NextResponse.json(
      { error: 'Failed to import chapters' },
      { status: 500 }
    )
  }
}
