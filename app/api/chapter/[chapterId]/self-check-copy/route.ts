export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getChapterByNumber, getChapterSteps, getStepPages } from '@/lib/content/queries';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  try {
    const { chapterId } = await params;

    if (!chapterId) {
      return NextResponse.json(
        { success: false, error: 'Missing chapterId' },
        { status: 400 }
      );
    }

    const chapterNumber = parseInt(chapterId, 10);
    if (Number.isNaN(chapterNumber)) {
      return NextResponse.json(
        { success: false, error: 'Invalid chapter number' },
        { status: 400 }
      );
    }

    const chapter = await getChapterByNumber(chapterNumber);
    if (!chapter) {
      return NextResponse.json(
        { success: false, error: `Chapter ${chapterNumber} not found or not published` },
        { status: 404 }
      );
    }

    // Find the self_check step for this chapter
    const steps = await getChapterSteps(chapter.id);
    const selfCheckStep = steps.find((s) => s.step_type === 'self_check');

    if (!selfCheckStep) {
      return NextResponse.json(
        {
          success: true,
          intro: null,
          result: null,
          message: `No self_check step found for chapter ${chapterNumber}`,
        },
        { status: 200 }
      );
    }

    // Load all pages for the self_check step
    const pages = await getStepPages(selfCheckStep.id);
    const allBlocks = pages.flatMap((p) => (p.content ?? []) as any[]);

    const introBlock = allBlocks.find(
      (b) => b && typeof b === 'object' && b.type === 'self_check_intro'
    ) as
      | {
          title?: string;
          subtitle?: string;
          body1?: string;
          body2?: string;
          highlightTitle?: string;
          highlightBody?: string;
        }
      | undefined;

    const resultBlock = allBlocks.find(
      (b) => b && typeof b === 'object' && b.type === 'self_check_result'
    ) as
      | {
          title?: string;
          subtitle?: string;
        }
      | undefined;

    return NextResponse.json(
      {
        success: true,
        intro: introBlock ?? null,
        result: resultBlock ?? null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Self-Check API] Failed to load self-check copy:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load self-check copy' },
      { status: 500 }
    );
  }
}

