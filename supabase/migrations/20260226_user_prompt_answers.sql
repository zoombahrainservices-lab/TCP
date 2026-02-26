-- Create user_prompt_answers table for storing user responses to prompt blocks
-- This allows users to save their answers and see them in reports

CREATE TABLE IF NOT EXISTS user_prompt_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_key TEXT NOT NULL,
  chapter_id INTEGER NOT NULL,
  step_id UUID REFERENCES chapter_steps(id) ON DELETE CASCADE,
  page_id UUID REFERENCES step_pages(id) ON DELETE CASCADE,
  answer JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT user_prompt_answers_unique UNIQUE (user_id, prompt_key)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_prompt_answers_user_id ON user_prompt_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_prompt_answers_chapter_id ON user_prompt_answers(chapter_id);
CREATE INDEX IF NOT EXISTS idx_user_prompt_answers_prompt_key ON user_prompt_answers(prompt_key);

-- Trigger for updated_at
CREATE TRIGGER update_user_prompt_answers_updated_at
  BEFORE UPDATE ON user_prompt_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE user_prompt_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own prompt answers"
  ON user_prompt_answers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prompt answers"
  ON user_prompt_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prompt answers"
  ON user_prompt_answers FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Comments for documentation
COMMENT ON TABLE user_prompt_answers IS 'Stores user responses to prompt blocks';
COMMENT ON COLUMN user_prompt_answers.prompt_key IS 'Unique key: prompt block id (e.g., ch1_spark_s_pattern)';
COMMENT ON COLUMN user_prompt_answers.answer IS 'JSONB field storing the user''s answer (supports various input types)';
