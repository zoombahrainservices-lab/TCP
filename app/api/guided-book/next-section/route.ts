import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getNextStepWithContentV2 } from '@/lib/content/queries';
import { getSectionImageUrlPrimary, type SectionStepType } from '@/lib/chapterImages';
import { getNextStepUrl } from '@/lib/guided-book/navigation';

/**
 * Lightweight API for prefetching next section metadata.
 * Returns minimal data to warm the transition without full payload.
 * 
 * Query params:
 * - chapterId: chapter UUID
 * - currentStepOrder: current step's order_index
 * - chapterNumber: chapter number for URL building
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const chapterId = searchParams.get('chapterId');
    const currentStepOrder = searchParams.get('currentStepOrder');
    const chapterNumber = searchParams.get('chapterNumber');

    if (!chapterId || !currentStepOrder || !chapterNumber) {
      return NextResponse.json(
        { error: 'Missing required params' },
        { status: 400 }
      );
    }

    const orderIndex = parseInt(currentStepOrder, 10);
    const chapNum = parseInt(chapterNumber, 10);

    if (!Number.isFinite(orderIndex) || !Number.isFinite(chapNum)) {
      return NextResponse.json(
        { error: 'Invalid order_index or chapter number' },
        { status: 400 }
      );
    }

    // Get next step (minimal fields only)
    const nextStep = await getNextStepWithContentV2(chapterId, orderIndex);

    if (!nextStep) {
      return NextResponse.json(
        { nextSection: null },
        {
          headers: {
            'Cache-Control': 'no-store, must-revalidate',
          },
        }
      );
    }

    // Build response with minimal data
    const nextUrl = getNextStepUrl(chapNum, nextStep.step_type);
    const nextHeroImage = nextStep.step_type
      ? getSectionImageUrlPrimary(chapNum, nextStep.step_type as SectionStepType)
      : null;

    return NextResponse.json(
      {
        nextSection: {
          url: nextUrl,
          title: nextStep.title,
          stepType: nextStep.step_type,
          heroImage: nextHeroImage,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('[next-section API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
