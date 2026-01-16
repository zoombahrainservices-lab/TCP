import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateChapterPdfBytes } from '@/lib/pdf/chapter'

export async function GET(
  request: NextRequest,
  { params }: { params: { dayNumber: string } }
) {
  try {
    const dayNumber = parseInt(params.dayNumber)
    
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
    
    // Fetch chapter from database
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('*')
      .eq('day_number', dayNumber)
      .single()
    
    if (chapterError || !chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      )
    }
    
    // Generate PDF
    const pdfBytes = await generateChapterPdfBytes(chapter)
    
    // Return PDF as download
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Day-${dayNumber}-${chapter.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating chapter PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
