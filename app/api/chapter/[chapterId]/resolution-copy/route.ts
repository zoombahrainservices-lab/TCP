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

    // URL uses chapter *number* (e.g. /chapter/6), but chapter_steps
    // are keyed by the chapter's UUID id. First resolve the number
    // to the real chapter row.
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

    // 1) Get all steps for this chapter and find the resolution step
    const steps = await getChapterSteps(chapter.id);
    const resolutionStep = steps.find((s) => s.step_type === 'resolution');

    if (!resolutionStep) {
      return NextResponse.json(
        {
          success: true,
          guidance: null,
          proof: null,
          message: `No resolution step found for chapter ${chapterNumber}`,
        },
        { status: 200 }
      );
    }

    // 2) Get pages for the resolution step (first page is the canonical copy)
    const pages = await getStepPages(resolutionStep.id);
    if (!pages || pages.length === 0) {
      return NextResponse.json(
        {
          success: true,
          guidance: null,
          proof: null,
          message: `No pages found for resolution step in chapter ${chapterNumber}`,
        },
        { status: 200 }
      );
    }

    const page = pages[0];
    const blocks = (page.content ?? []) as any[];

    if (!Array.isArray(blocks) || blocks.length === 0) {
      return NextResponse.json(
        {
          success: true,
          guidance: null,
          proof: null,
          message: `Resolution page has no content blocks for chapter ${chapterNumber}`,
        },
        { status: 200 }
      );
    }

    const guidance = blocks.find(
      (b) =>
        b &&
        typeof b === 'object' &&
        b.type === 'identity_resolution_guidance'
    ) as
      | {
          title?: string;
          subtitle?: string;
          exampleText?: string;
        }
      | undefined;

    const proofBlock = blocks.find(
      (b) => b && typeof b === 'object' && b.type === 'resolution_proof'
    ) as
      | {
          title?: string;
          subtitle?: string;
          label?: string;
          placeholder?: string;
        }
      | undefined;

    return NextResponse.json(
      {
        success: true,
        guidance: guidance ?? null,
        proof: proofBlock ?? null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Resolution API] Failed to load resolution copy:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load resolution copy' },
      { status: 500 }
    );
  }
}

