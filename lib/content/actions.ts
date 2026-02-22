'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ============================================
// Page Progress Actions
// ============================================

export async function savePageProgress(pageId: string, userId: string) {
  const supabase = await createClient();

  // Mark page as completed in step_completions
  const { data: page } = await supabase
    .from('step_pages')
    .select('step_id, xp_award')
    .eq('id', pageId)
    .single();

  if (!page) {
    return { success: false, error: 'Page not found' };
  }

  // Insert or update step_completion with page_id
  const { error } = await supabase
    .from('step_completions')
    .upsert({
      user_id: userId,
      step_id: `page_${pageId}`, // Unique identifier for page completion
      page_id: pageId,
      status: 'completed',
      completed_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,step_id',
    });

  if (error) {
    console.error('Error saving page progress:', error);
    return { success: false, error: error.message };
  }

  // Award XP if applicable
  if (page.xp_award && page.xp_award > 0) {
    await awardPageXP(userId, pageId, page.xp_award);
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function getPageProgress(pageId: string, userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('step_completions')
    .select('*')
    .eq('user_id', userId)
    .eq('page_id', pageId)
    .single();

  if (error || !data) {
    return { completed: false };
  }

  return {
    completed: data.status === 'completed',
    completedAt: data.completed_at,
  };
}

// ============================================
// Step Progress Actions
// ============================================

export async function markStepComplete(stepId: string, userId: string) {
  const supabase = await createClient();

  // Check if all pages in the step are completed
  const { data: pages } = await supabase
    .from('step_pages')
    .select('id')
    .eq('step_id', stepId);

  if (!pages) return { success: false, error: 'Step not found' };

  // Check completion for all pages
  const pageIds = pages.map(p => p.id);
  const { data: completions } = await supabase
    .from('step_completions')
    .select('page_id')
    .eq('user_id', userId)
    .in('page_id', pageIds);

  const completedPageIds = completions?.map(c => c.page_id) || [];
  const allPagesCompleted = pageIds.every(id => completedPageIds.includes(id));

  if (!allPagesCompleted) {
    return { success: false, error: 'Not all pages completed' };
  }

  // Mark step as completed
  const { error } = await supabase
    .from('step_completions')
    .upsert({
      user_id: userId,
      step_id: `step_${stepId}`,
      status: 'completed',
      completed_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,step_id',
    });

  if (error) {
    console.error('Error marking step complete:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

// ============================================
// User Response Actions
// ============================================

export async function savePromptResponse(
  userId: string,
  chapterId: string,
  pageId: string | null,
  promptId: string,
  response: any
) {
  const supabase = await createClient();

  // Save to artifacts table (maintaining backward compatibility)
  const { error } = await supabase
    .from('artifacts')
    .upsert({
      user_id: userId,
      chapter_id: chapterId,
      type: 'prompt_response',
      data: {
        promptId,
        pageId,
        response,
        submittedAt: new Date().toISOString(),
      },
    }, {
      onConflict: 'user_id,chapter_id,type',
    });

  if (error) {
    console.error('Error saving prompt response:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getPromptResponses(userId: string, chapterId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('artifacts')
    .select('data')
    .eq('user_id', userId)
    .eq('chapter_id', chapterId)
    .eq('type', 'prompt_response');

  if (error || !data) {
    return {};
  }

  // Convert array of responses to a keyed object
  const responses: Record<string, any> = {};
  data.forEach(item => {
    if (item.data?.promptId) {
      responses[item.data.promptId] = item.data.response;
    }
  });

  return responses;
}

export async function saveScaleQuestionResponses(
  userId: string,
  chapterId: string,
  pageId: string,
  blockId: string,
  responses: Record<string, number>
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('artifacts')
    .upsert({
      user_id: userId,
      chapter_id: chapterId,
      type: 'scale_question_responses',
      data: {
        blockId,
        pageId,
        responses,
        submittedAt: new Date().toISOString(),
      },
    }, {
      onConflict: 'user_id,chapter_id,type',
    });

  if (error) {
    console.error('Error saving scale question responses:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================
// XP Award Helper
// ============================================

async function awardPageXP(userId: string, pageId: string, xpAmount: number) {
  const supabase = await createClient();

  // Use page_id as the event key for idempotency
  const eventKey = `page_completion_${pageId}`;

  // Check if XP already awarded
  const { data: existingLog } = await supabase
    .from('xp_logs')
    .select('id')
    .eq('xp_event_key', eventKey)
    .single();

  if (existingLog) {
    return { success: true, message: 'XP already awarded' };
  }

  // Award XP
  const { error: xpError } = await supabase
    .from('xp_logs')
    .insert({
      user_id: userId,
      reason: 'section_completion',
      amount: xpAmount,
      xp_event_key: eventKey,
      metadata: { pageId },
    });

  if (xpError) {
    console.error('Error awarding page XP:', xpError);
    return { success: false, error: xpError.message };
  }

  // Update user_gamification total_xp
  const { error: gamificationError } = await supabase.rpc('increment_user_xp', {
    p_user_id: userId,
    p_amount: xpAmount,
  });

  if (gamificationError) {
    console.error('Error updating user gamification:', gamificationError);
  }

  return { success: true };
}
