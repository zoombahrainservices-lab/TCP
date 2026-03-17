export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getChapterByNumber, getChapterSteps, getStepPages } from '@/lib/content/queries';
import { createClient } from '@/lib/supabase/server';

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

    // Load global defaults from site_settings
    const supabase = await createClient();
    const { data: settingsData } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'self_check_defaults')
      .single();

    const globalDefaults = settingsData?.value || {
      intro: {
        title: 'Self-Check',
        subtitle: 'Take a quick snapshot of where you are in this chapter.',
        body1: 'This check is just for you. Answer based on how things feel right now, not how you wish they were.',
        body2: "It's not a test or a grade. It's a baseline for this chapter so you can see your progress as you move through the lessons.",
        highlightTitle: "You'll rate 5 statements from 1 to 7.",
        highlightBody: "Takes about a minute. Your score shows which zone you're in and what to focus on next.",
        styles: {
          titleColor: '#111827',
          titleSize: '5xl',
          subtitleColor: '#6b7280',
          bodyBgColor: '#ffffff',
          bodyTextColor: '#1f2937',
          highlightBgColor: '#fef3c7',
          highlightBorderColor: '#f59e0b',
          highlightTextColor: '#111827',
          buttonBgColor: '#f7b418',
          buttonHoverColor: '#e5a309',
          buttonTextColor: '#000000',
        },
      },
      result: {
        title: 'Self-Check Results',
        subtitle: 'This is your starting point for this chapter—not your ending point.',
        styles: {
          titleColor: '#111827',
          subtitleColor: '#6b7280',
          scoreBgColor: '#ffffff',
          scoreTextColor: '#111827',
          explanationBgColor: '#fef3c7',
          explanationTextColor: '#111827',
          buttonBgColor: '#ff6a38',
          buttonHoverColor: '#e55a28',
          buttonTextColor: '#ffffff',
        },
      },
    };

    // Find the self_check step for this chapter
    const steps = await getChapterSteps(chapter.id);
    const selfCheckStep = steps.find((s) => s.step_type === 'self_check');

    if (!selfCheckStep) {
      // Return global defaults if no self_check step
      return NextResponse.json(
        {
          success: true,
          intro: globalDefaults.intro,
          result: globalDefaults.result,
          usingDefaults: true,
        },
        { status: 200 }
      );
    }

    // Load all pages for the self_check step to find chapter-specific overrides
    const pages = await getStepPages(selfCheckStep.id);
    const allBlocks = pages.flatMap((p) => (p.content ?? []) as any[]);

    const introOverride = allBlocks.find(
      (b) => b && typeof b === 'object' && b.type === 'self_check_intro'
    ) as
      | {
          title?: string;
          subtitle?: string;
          body1?: string;
          body2?: string;
          highlightTitle?: string;
          highlightBody?: string;
          styles?: Record<string, any>;
        }
      | undefined;

    const resultOverride = allBlocks.find(
      (b) => b && typeof b === 'object' && b.type === 'self_check_result'
    ) as
      | {
          title?: string;
          subtitle?: string;
          styles?: Record<string, any>;
        }
      | undefined;

    // Merge chapter overrides with global defaults
    const finalIntro = {
      ...globalDefaults.intro,
      ...(introOverride || {}),
      styles: {
        ...(globalDefaults.intro?.styles || {}),
        ...(introOverride?.styles || {}),
      },
    };

    const finalResult = {
      ...globalDefaults.result,
      ...(resultOverride || {}),
      styles: {
        ...(globalDefaults.result?.styles || {}),
        ...(resultOverride?.styles || {}),
      },
    };

    return NextResponse.json(
      {
        success: true,
        intro: finalIntro,
        result: finalResult,
        hasOverride: !!(introOverride || resultOverride),
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

