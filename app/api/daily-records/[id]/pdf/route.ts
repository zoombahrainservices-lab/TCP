import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateDailyResultPdfBytes } from '@/lib/pdf/daily-result'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recordId = parseInt(params.id)
    
    if (isNaN(recordId)) {
      return NextResponse.json(
        { error: 'Invalid record ID' },
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
    
    // Use admin client to fetch record with related data
    const adminClient = createAdminClient()
    
    // Fetch daily record with chapter info
    const { data: record, error: recordError } = await adminClient
      .from('daily_records')
      .select(`
        *,
        chapters (
          day_number,
          title,
          subtitle,
          before_questions,
          after_questions
        )
      `)
      .eq('id', recordId)
      .single()
    
    if (recordError || !record) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      )
    }
    
    // Verify access: user must be the student, or a parent/mentor of the student
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    let hasAccess = false
    
    if (record.student_id === user.id) {
      // User is the student
      hasAccess = true
    } else if (profile?.role === 'parent' || profile?.role === 'mentor') {
      // Check if user is linked to this student
      const { data: link } = await adminClient
        .from('parent_child_links')
        .select('id')
        .eq('parent_id', user.id)
        .eq('child_id', record.student_id)
        .maybeSingle()
      
      hasAccess = !!link
    } else if (profile?.role === 'admin') {
      // Admins have access to all records
      hasAccess = true
    }
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }
    
    // Prepare data for PDF generation
    const chapter = record.chapters as any
    const pdfData = {
      dayNumber: record.day_number,
      chapterTitle: chapter?.title || `Day ${record.day_number}`,
      chapterSubtitle: chapter?.subtitle,
      beforeQuestions: chapter?.before_questions || [],
      afterQuestions: chapter?.after_questions || [],
      beforeAnswers: record.before_answers || [],
      afterAnswers: record.after_answers || [],
      reflection: record.reflection_text || '',
      completed: record.completed,
      completedAt: record.updated_at,
    }
    
    // Generate PDF
    const pdfBytes = await generateDailyResultPdfBytes(pdfData)
    
    // Return PDF as download
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Day-${record.day_number}-Results.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating daily result PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
