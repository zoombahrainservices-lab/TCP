import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateChapterPdfBytes } from '@/lib/pdf/chapter'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dayNumber: string }> | { dayNumber: string } }
) {
  try {
    // Handle both Promise and direct params (Next.js 14 vs 15)
    const resolvedParams = await Promise.resolve(params)
    const dayNumberStr = resolvedParams.dayNumber
    
    if (!dayNumberStr) {
      return NextResponse.json(
        { error: 'Day number is required' },
        { status: 400 }
      )
    }
    
    const dayNumber = parseInt(dayNumberStr, 10)
    
    if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 30) {
      return NextResponse.json(
        { error: 'Invalid day number' },
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
    
    // For Day 1, serve the static Foundation PDF from public directory
    if (dayNumber === 1) {
      try {
        const pdfPath = join(process.cwd(), 'public', 'tcp-foundation-chapter1.pdf')
        const pdfBytes = await readFile(pdfPath)
        
        return new NextResponse(pdfBytes, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="Day-1-From-Stage-Star-to-Silent-Struggles.pdf"',
          },
        })
      } catch (error: any) {
        console.error('Error reading Foundation PDF:', error)
        // Fall through to generate PDF from database if file not found
      }
    }
    
    // Fetch chapter from database - try legacy_day_number first, then day_number
    let chapter = null
    let chapterError = null
    
    // Try legacy_day_number first (new system)
    const { data: chapterByLegacy, error: legacyError } = await supabase
      .from('chapters')
      .select('*')
      .eq('legacy_day_number', dayNumber)
      .single()
    
    if (!legacyError && chapterByLegacy) {
      chapter = chapterByLegacy
    } else {
      // Fallback to day_number (old system)
      const { data: chapterByDay, error: dayError } = await supabase
        .from('chapters')
        .select('*')
        .eq('day_number', dayNumber)
        .single()
      
      if (!dayError && chapterByDay) {
        chapter = chapterByDay
      } else {
        chapterError = legacyError || dayError
      }
    }
    
    if (chapterError || !chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      )
    }
    
    // Generate PDF
    try {
      const pdfBytes = await generateChapterPdfBytes(chapter)
      
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
