import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import {
  getUserEngagementStats,
  getChapterAnalytics,
  getProgressMetrics,
  getXPSystemStats,
} from '@/app/actions/admin'

export async function GET() {
  try {
    await requireAuth('admin')

    // Gather all analytics data
    const [engagement, chapterStats, progress, xpStats] = await Promise.all([
      getUserEngagementStats(),
      getChapterAnalytics(),
      getProgressMetrics(),
      getXPSystemStats(),
    ])

    const report = {
      generatedAt: new Date().toISOString(),
      engagement,
      progress,
      xpStats,
      chapterStats,
    }

    return NextResponse.json(report, {
      headers: {
        'Content-Disposition': `attachment; filename="analytics-report-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
  } catch (error) {
    console.error('Error exporting analytics:', error)
    return NextResponse.json(
      { error: 'Failed to export analytics' },
      { status: 500 }
    )
  }
}
