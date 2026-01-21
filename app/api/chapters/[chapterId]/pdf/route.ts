import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateChapterPdfBytes } from '@/lib/pdf/chapter'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> | { chapterId: string } }
) {
  try {
    // Handle both Promise and direct params (Next.js 14 vs 15)
    const resolvedParams = await Promise.resolve(params)
    const chapterIdStr = resolvedParams.chapterId
    
    if (!chapterIdStr) {
      return NextResponse.json(
        { error: 'Chapter ID is required' },
        { status: 400 }
      )
    }
    
    const chapterId = parseInt(chapterIdStr, 10)
    
    if (isNaN(chapterId)) {
      return NextResponse.json(
        { error: 'Invalid chapter ID' },
        { status: 400 }
      )
    }
    
    // Check authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Fetch chapter from database
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('*')
      .eq('id', chapterId)
      .single()
    
    if (chapterError || !chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      )
    }
    
    // For Day 1 (legacy_day_number = 1), serve the static Foundation PDF from public directory
    if (chapter.legacy_day_number === 1 || chapter.day_number === 1) {
      try {
        const pdfPath = join(process.cwd(), 'public', 'tcp-foundation-chapter1.pdf')
        const pdfBytes = await readFile(pdfPath)
        
        const dayNumber = chapter.legacy_day_number || chapter.day_number || 1
        return new NextResponse(pdfBytes, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="Day-${dayNumber}-${chapter.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf"`,
          },
        })
      } catch (error: any) {
        console.error('Error reading Foundation PDF:', error)
        // Fall through to generate PDF from database if file not found
      }
    }
    
    // Generate PDF
    try {
      const pdfBytes = await generateChapterPdfBytes(chapter)
      
      // Use legacy_day_number or day_number for filename
      const dayNumber = chapter.legacy_day_number || chapter.day_number || chapterId
      
      // Return PDF as download (convert Uint8Array to Buffer for NextResponse)
      return new NextResponse(Buffer.from(pdfBytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="Day-${dayNumber}-${chapter.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf"`,
        },
      })
    } catch (pdfError: any) {
      console.error('Error generating chapter PDF:', pdfError)
      console.error('Chapter data:', {
        id: chapter.id,
        legacy_day_number: chapter.legacy_day_number,
        day_number: chapter.day_number,
        title: chapter.title,
        content_length: chapter.content?.length,
        task_length: chapter.task_description?.length
      })
      return NextResponse.json(
        { error: 'Failed to generate PDF', details: pdfError?.message || 'Unknown error' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error in chapter PDF route:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}
