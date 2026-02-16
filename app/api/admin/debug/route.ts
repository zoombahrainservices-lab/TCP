import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdminEnv } from '@/lib/env-check'

export async function GET() {
  try {
    // Require admin authentication
    await requireAuth('admin')
    
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      environment: {},
      database: {},
      queries: {},
    }
    
    // Check environment variables
    const envCheck = checkAdminEnv()
    diagnostics.environment = {
      status: envCheck.isValid ? 'OK' : 'ERROR',
      variables: envCheck.masked,
      missing: envCheck.missing,
    }
    
    if (!envCheck.isValid) {
      return NextResponse.json({
        status: 'error',
        message: 'Missing required environment variables',
        diagnostics,
      }, { status: 500 })
    }
    
    // Test database connection
    try {
      const admin = createAdminClient()
      
      // Test basic query
      const { data: testQuery, error: testError } = await admin
        .from('profiles')
        .select('id')
        .limit(1)
      
      diagnostics.database.connection = testError ? 'FAILED' : 'OK'
      diagnostics.database.error = testError?.message || null
      
      // Count tables
      const queries = [
        { name: 'profiles', query: admin.from('profiles').select('id', { count: 'exact', head: true }) },
        { name: 'chapters', query: admin.from('chapters').select('id', { count: 'exact', head: true }) },
        { name: 'parts', query: admin.from('parts').select('id', { count: 'exact', head: true }) },
        { name: 'chapter_steps', query: admin.from('chapter_steps').select('id', { count: 'exact', head: true }) },
        { name: 'step_pages', query: admin.from('step_pages').select('id', { count: 'exact', head: true }) },
        { name: 'user_gamification', query: admin.from('user_gamification').select('id', { count: 'exact', head: true }) },
      ]
      
      for (const { name, query } of queries) {
        const { count, error } = await query
        diagnostics.queries[name] = {
          count: count || 0,
          status: error ? 'ERROR' : 'OK',
          error: error?.message || null,
        }
      }
      
    } catch (dbError: any) {
      diagnostics.database.connection = 'FAILED'
      diagnostics.database.error = dbError.message
    }
    
    // Determine overall status
    const hasErrors = 
      !envCheck.isValid ||
      diagnostics.database.connection === 'FAILED' ||
      Object.values(diagnostics.queries).some((q: any) => q.status === 'ERROR')
    
    return NextResponse.json({
      status: hasErrors ? 'error' : 'ok',
      message: hasErrors 
        ? 'Some diagnostics failed - check details below'
        : 'All systems operational',
      diagnostics,
    })
    
  } catch (error: any) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({
      status: 'error',
      message: error.message || 'Failed to run diagnostics',
      error: error.toString(),
    }, { status: 500 })
  }
}
