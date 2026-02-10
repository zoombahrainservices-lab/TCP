import { NextResponse } from 'next/server';
import { getChapterBySlug, getStepBySlug, getStepPages } from '@/lib/content/queries';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chapterSlug = searchParams.get('chapter');
  const stepSlug = searchParams.get('step');

  if (!chapterSlug || !stepSlug) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  try {
    const chapter = await getChapterBySlug(chapterSlug);
    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    const step = await getStepBySlug(chapter.id, stepSlug);
    if (!step) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 });
    }

    const pages = await getStepPages(step.id);

    return NextResponse.json({ pages });
  } catch (error) {
    console.error('[API] Error fetching step pages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
