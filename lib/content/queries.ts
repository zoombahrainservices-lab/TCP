import { createClient } from '@/lib/supabase/server';
import type { Chapter, Step, Page, ChapterWithSteps, StepWithPages } from './types';

// ============================================
// Chapter Queries
// ============================================

export async function getAllParts() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('parts')
    .select('*')
    .order('order_index');

  if (error) {
    throw error;
  }

  return data;
}

export async function getChapterBySlug(slug: string): Promise<Chapter | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getChapterById(id: string): Promise<Chapter | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getChapterByNumber(chapterNumber: number): Promise<Chapter | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('chapter_number', chapterNumber)
    .eq('is_published', true)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getAllChapters() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('is_published', true)
    .order('order_index');

  if (error) {
    throw error;
  }

  return data;
}

// ============================================
// Step Queries
// ============================================

export async function getChapterSteps(chapterId: string): Promise<Step[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('chapter_steps')
    .select('*')
    .eq('chapter_id', chapterId)
    .order('order_index');

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getStepBySlug(chapterId: string, stepSlug: string): Promise<Step | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('chapter_steps')
    .select('*')
    .eq('chapter_id', chapterId)
    .eq('slug', stepSlug)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getStepById(stepId: string): Promise<Step | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('chapter_steps')
    .select('*')
    .eq('id', stepId)
    .single();

  if (error) {
    return null;
  }

  return data;
}

// ============================================
// Page Queries
// ============================================

export async function getStepPages(stepId: string): Promise<Page[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('step_pages')
    .select('*')
    .eq('step_id', stepId)
    .order('order_index');

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getPageBySlug(stepId: string, pageSlug: string): Promise<Page | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('step_pages')
    .select('*')
    .eq('step_id', stepId)
    .eq('slug', pageSlug)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getPageById(pageId: string): Promise<Page | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('step_pages')
    .select('*')
    .eq('id', pageId)
    .single();

  if (error) {
    return null;
  }

  return data;
}

// ============================================
// Combined Queries (with joins)
// ============================================

export async function getChapterWithSteps(chapterSlug: string): Promise<ChapterWithSteps | null> {
  const chapter = await getChapterBySlug(chapterSlug);
  if (!chapter) return null;

  const steps = await getChapterSteps(chapter.id);
  
  const stepsWithPages = await Promise.all(
    steps.map(async (step) => {
      const pages = await getStepPages(step.id);
      return { ...step, pages };
    })
  );

  return {
    ...chapter,
    steps: stepsWithPages,
  };
}

export async function getStepWithPages(chapterId: string, stepSlug: string): Promise<StepWithPages | null> {
  const step = await getStepBySlug(chapterId, stepSlug);
  if (!step) return null;

  const pages = await getStepPages(step.id);

  return {
    ...step,
    pages,
  };
}

// ============================================
// Navigation Helpers
// ============================================

export async function getNextStep(chapterId: string, currentStepOrderIndex: number): Promise<Step | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('chapter_steps')
    .select('*')
    .eq('chapter_id', chapterId)
    .gt('order_index', currentStepOrderIndex)
    .order('order_index')
    .limit(1)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getNextStepWithContent(chapterId: string, currentStepOrderIndex: number): Promise<Step | null> {
  const supabase = await createClient();
  
  // Get all steps after the current one, ordered
  const { data: steps, error } = await supabase
    .from('chapter_steps')
    .select('*')
    .eq('chapter_id', chapterId)
    .gt('order_index', currentStepOrderIndex)
    .order('order_index');

  if (error || !steps || steps.length === 0) {
    return null;
  }

  // Check each step to see if it has pages
  for (const step of steps) {
    const pages = await getStepPages(step.id);
    if (pages && pages.length > 0) {
      return step;
    }
  }

  return null;
}

export async function getPreviousStep(chapterId: string, currentStepOrderIndex: number): Promise<Step | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('chapter_steps')
    .select('*')
    .eq('chapter_id', chapterId)
    .lt('order_index', currentStepOrderIndex)
    .order('order_index', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getNextChapter(currentChapterOrderIndex: number): Promise<Chapter | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('is_published', true)
    .gt('order_index', currentChapterOrderIndex)
    .order('order_index')
    .limit(1)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getPreviousChapter(currentChapterOrderIndex: number): Promise<Chapter | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('is_published', true)
    .lt('order_index', currentChapterOrderIndex)
    .order('order_index', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return null;
  }

  return data;
}
