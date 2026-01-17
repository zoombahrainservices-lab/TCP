import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateDailyResultPdfBytes } from '@/lib/pdf/daily-result'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle both Promise and direct params (Next.js 14 vs 15)
    const resolvedParams = await Promise.resolve(params)
    const idStr = resolvedParams.id
    
    if (!idStr) {
      return NextResponse.json(
        { error: 'Record ID is required' },
        { status: 400 }
      )
    }
    
    const recordId = parseInt(idStr, 10)
    
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
    
    if (recordError) {
      console.error('Error fetching record:', recordError)
      return NextResponse.json(
        { error: 'Record not found', details: recordError.message },
        { status: 404 }
      )
    }
    
    if (!record) {
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
    
    // Map questions to the format expected by PDF generator
    const beforeQuestions = Array.isArray(chapter?.before_questions)
      ? chapter.before_questions.map((q: any) => ({
          id: q.id || q.questionId || 0,
          question: q.question || q.text || ''
        }))
      : []
    
    const afterQuestions = Array.isArray(chapter?.after_questions)
      ? chapter.after_questions.map((q: any) => ({
          id: q.id || q.questionId || 0,
          question: q.question || q.text || ''
        }))
      : []
    
    // Map answers to the format expected by PDF generator
    const beforeAnswers = Array.isArray(record.before_answers)
      ? record.before_answers.map((a: any) => ({
          questionId: a.questionId || a.id || 0,
          question: a.question || '',
          answer: a.answer || 0
        }))
      : []
    
    const afterAnswers = Array.isArray(record.after_answers)
      ? record.after_answers.map((a: any) => ({
          questionId: a.questionId || a.id || 0,
          question: a.question || '',
          answer: a.answer || 0
        }))
      : []
    
    const pdfData = {
      dayNumber: record.day_number,
      chapterTitle: chapter?.title || `Day ${record.day_number}`,
      chapterSubtitle: chapter?.subtitle,
      beforeQuestions,
      afterQuestions,
      beforeAnswers,
      afterAnswers,
      reflection: record.reflection_text || '',
      completed: record.completed || false,
      completedAt: record.updated_at || new Date().toISOString(),
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
