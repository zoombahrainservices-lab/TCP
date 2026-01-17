import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildChildProgramReport } from '@/lib/reports'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user role
    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const { childId } = await params

    // Verify access
    if (profile.role === 'parent' || profile.role === 'mentor') {
      const { data: link } = await adminClient
        .from('parent_child_links')
        .select('id')
        .eq('parent_id', user.id)
        .eq('child_id', childId)
        .maybeSingle()

      if (!link) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    } else if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Build report
    const report = await buildChildProgramReport(childId)

    // Return as JSON download
    const filename = `${report.childName.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.json`

    return new NextResponse(JSON.stringify(report, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error: any) {
    console.error('Report API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate report' },
      { status: 500 }
    )
  }
}
