import { NextRequest, NextResponse } from 'next/server'
import { getAssessmentReportData, getResolutionReportData, getUserInfo } from '@/app/actions/reports'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const chapterId = 1 // Test with chapter 1

    // Fetch all data
    const [assessmentResult, resolutionResult, userResult] = await Promise.all([
      getAssessmentReportData(chapterId),
      getResolutionReportData(chapterId),
      getUserInfo(),
    ])

    return NextResponse.json({
      user: userResult,
      assessment: assessmentResult,
      resolution: resolutionResult,
      debug: {
        hasAssessment: assessmentResult.success,
        hasResolution: resolutionResult.success,
        assessmentQuestions: assessmentResult.success ? assessmentResult.data.questions?.length : 0,
        yourTurnFramework: resolutionResult.success ? resolutionResult.data.yourTurnByCategory?.framework?.length : 0,
        yourTurnTechniques: resolutionResult.success ? resolutionResult.data.yourTurnByCategory?.techniques?.length : 0,
        yourTurnFollowThrough: resolutionResult.success ? resolutionResult.data.yourTurnByCategory?.followThrough?.length : 0,
        hasIdentity: resolutionResult.success && !!resolutionResult.data.identityResolution,
        proofsCount: resolutionResult.success ? resolutionResult.data.proofs?.length : 0,
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
