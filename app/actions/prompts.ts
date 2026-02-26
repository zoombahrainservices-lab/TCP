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
