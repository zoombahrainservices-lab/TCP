'use server';

import { createClient } from '@/lib/supabase/server';

export async function savePromptAnswer({
  promptKey,
  chapterId,
  stepId,
  pageId,
  answer,
}: {
  promptKey: string;
  chapterId: number;
  stepId?: string;
  pageId?: string;
  answer: any;
}) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Not authenticated' };
  }
  
  try {
    const { error: upsertError } = await supabase
      .from('user_prompt_answers')
      .upsert({
        user_id: user.id,
        prompt_key: promptKey,
        chapter_id: chapterId,
        step_id: stepId || null,
        page_id: pageId || null,
        answer,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,prompt_key',
        ignoreDuplicates: false,
      });
    
    if (upsertError) {
      console.error('Error saving prompt answer:', upsertError);
      return { error: 'Failed to save answer' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in savePromptAnswer:', error);
    return { error: 'An error occurred' };
  }
}

export async function getChapterPromptAnswers(chapterId: number) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { data: {}, error: 'Not authenticated' };
  }
  
  try {
    const { data, error } = await supabase
      .from('user_prompt_answers')
      .select('prompt_key, answer')
      .eq('user_id', user.id)
      .eq('chapter_id', chapterId);
    
    if (error) {
      return { data: {}, error: error.message };
    }
    
    const answers: Record<string, any> = {};
    data?.forEach(row => {
      answers[row.prompt_key] = row.answer;
    });
    
    return { data: answers, error: null };
  } catch (error) {
    return { data: {}, error: 'An error occurred' };
  }
}

export async function getAllUserPromptAnswers() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { data: [], error: 'Not authenticated' };
  }
  
  try {
    const { data, error } = await supabase
      .from('user_prompt_answers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      return { data: [], error: error.message };
    }
    
    return { data: data || [], error: null };
  } catch (error) {
    return { data: [], error: 'An error occurred' };
  }
}

export async function submitAssessment(
  chapterId: number,
  assessmentType: 'baseline' | 'followup',
  answers: Record<number, number>,
  totalScore: number
) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('submitAssessment: Not authenticated', authError);
    return { success: false, error: 'Not authenticated' };
  }
  
  try {
    // Include chapter_id in prompt_key to support multiple chapters per user
    const promptKey = `ch${chapterId}_self_check_${assessmentType}`;
    
    console.log('submitAssessment: Saving', { promptKey, chapterId, totalScore, userId: user.id });
    
    const { error: upsertError } = await supabase
      .from('user_prompt_answers')
      .upsert({
        user_id: user.id,
        prompt_key: promptKey,
        chapter_id: chapterId,
        step_id: null,
        page_id: null,
        answer: { answers, totalScore, completedAt: new Date().toISOString() },
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,prompt_key',
        ignoreDuplicates: false,
      });

    if (upsertError) {
      console.error('submitAssessment: Upsert error details:', {
        message: upsertError.message,
        code: upsertError.code,
        details: upsertError.details,
        hint: upsertError.hint,
        fullError: upsertError
      });
      return { success: false, error: upsertError.message || 'Failed to save assessment' };
    }

    console.log('submitAssessment: Success');
    return { success: true };
  } catch (error) {
    console.error('submitAssessment: Unexpected error', error);
    return { success: false, error: 'Failed to save assessment' };
  }
}

/**
 * Save Self Check draft progress (current page, partial answers).
 * Allows resuming mid-assessment without losing progress.
 */
export async function saveSelfCheckDraft(
  chapterId: number,
  assessmentType: 'baseline' | 'followup',
  currentPage: number,
  partialAnswers: Record<string | number, any>
) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }
  
  try {
    const draftKey = `ch${chapterId}_self_check_${assessmentType}_draft`;
    
    const { error: upsertError } = await supabase
      .from('user_prompt_answers')
      .upsert({
        user_id: user.id,
        prompt_key: draftKey,
        chapter_id: chapterId,
        step_id: null,
        page_id: null,
        answer: { 
          currentPage, 
          partialAnswers, 
          isDraft: true,
          savedAt: new Date().toISOString() 
        },
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,prompt_key',
        ignoreDuplicates: false,
      });

    if (upsertError) {
      console.error('saveSelfCheckDraft: Error', upsertError);
      return { success: false, error: upsertError.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('saveSelfCheckDraft: Unexpected error', error);
    return { success: false, error: 'Failed to save draft' };
  }
}

/**
 * Load Self Check draft if it exists.
 */
export async function getSelfCheckDraft(
  chapterId: number,
  assessmentType: 'baseline' | 'followup'
): Promise<{ currentPage: number; partialAnswers: Record<string | number, any> } | null> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return null;
  }
  
  try {
    const draftKey = `ch${chapterId}_self_check_${assessmentType}_draft`;
    
    const { data, error } = await supabase
      .from('user_prompt_answers')
      .select('answer')
      .eq('user_id', user.id)
      .eq('prompt_key', draftKey)
      .eq('chapter_id', chapterId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const answer = data.answer as any;
    if (!answer || !answer.isDraft) {
      return null;
    }

    return {
      currentPage: answer.currentPage ?? 0,
      partialAnswers: answer.partialAnswers ?? {},
    };
  } catch (error) {
    console.error('getSelfCheckDraft: Error', error);
    return null;
  }
}

/**
 * Clear Self Check draft after final submission.
 */
export async function clearSelfCheckDraft(
  chapterId: number,
  assessmentType: 'baseline' | 'followup'
) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }
  
  try {
    const draftKey = `ch${chapterId}_self_check_${assessmentType}_draft`;
    
    const { error: deleteError } = await supabase
      .from('user_prompt_answers')
      .delete()
      .eq('user_id', user.id)
      .eq('prompt_key', draftKey)
      .eq('chapter_id', chapterId);

    if (deleteError) {
      console.error('clearSelfCheckDraft: Error', deleteError);
      return { success: false, error: deleteError.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('clearSelfCheckDraft: Unexpected error', error);
    return { success: false, error: 'Failed to clear draft' };
  }
}

/**
 * Save Resolution proof draft (text content, type).
 * Allows resuming without losing work in progress.
 */
export async function saveResolutionDraft(
  chapterId: number,
  drafts: Array<{ type: string; title: string; notes: string }>
) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }
  
  try {
    const draftKey = `ch${chapterId}_resolution_draft`;
    
    const { error: upsertError } = await supabase
      .from('user_prompt_answers')
      .upsert({
        user_id: user.id,
        prompt_key: draftKey,
        chapter_id: chapterId,
        step_id: null,
        page_id: null,
        answer: { 
          drafts, 
          isDraft: true,
          savedAt: new Date().toISOString() 
        },
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,prompt_key',
        ignoreDuplicates: false,
      });

    if (upsertError) {
      console.error('saveResolutionDraft: Error', upsertError);
      return { success: false, error: upsertError.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('saveResolutionDraft: Unexpected error', error);
    return { success: false, error: 'Failed to save draft' };
  }
}

/**
 * Load Resolution draft if it exists.
 */
export async function getResolutionDraft(chapterId: number) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return null;
  }
  
  try {
    const draftKey = `ch${chapterId}_resolution_draft`;
    
    const { data, error } = await supabase
      .from('user_prompt_answers')
      .select('answer')
      .eq('user_id', user.id)
      .eq('prompt_key', draftKey)
      .eq('chapter_id', chapterId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const answer = data.answer as any;
    if (!answer || !answer.isDraft) {
      return null;
    }

    return answer.drafts || null;
  } catch (error) {
    console.error('getResolutionDraft: Error', error);
    return null;
  }
}
