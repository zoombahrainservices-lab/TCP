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
    console.error('Error fetching parts:', error);
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
    console.error('Error fetching chapter by slug:', error);
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
    console.error('Error fetching chapter by ID:', error);
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
    console.error('Error fetching chapter by number:', error);
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
    console.error('Error fetching chapters:', error);
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
    console.error('Error fetching chapter steps:', error);
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
    console.error('Error fetching step by slug:', error);
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
    console.error('Error fetching step by ID:', error);
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
    console.error('Error fetching step pages:', error);
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
    console.error('Error fetching page by slug:', error);
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
    console.error('Error fetching page by ID:', error);
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

// ============================================
// Optimized Bundle Queries (Performance)
// ============================================

/**
 * Get chapter + steps in a single RPC call (much faster than separate queries)
 */
export async function getChapterBundleRPC(chapterSlug: string): Promise<{
  chapter: Chapter | null;
  steps: Step[];
  error: any;
}> {
  const supabase = await createClient();
  
  const { data, error } = await supabase.rpc('get_chapter_bundle', {
    chapter_slug: chapterSlug
  });

  if (error || !data?.[0]) {
    return { chapter: null, steps: [], error };
  }

  return {
    chapter: data[0].chapter_data as Chapter,
    steps: data[0].steps_data as Step[],
    error: null
  };
}
