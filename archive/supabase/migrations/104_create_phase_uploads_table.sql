-- Create phase_uploads table for Zone → Chapter → Phase hierarchy
-- Migration: 104_create_phase_uploads_table.sql
-- Replaces uploads from daily_records with phase-based uploads

CREATE TABLE IF NOT EXISTS phase_uploads (
  id BIGSERIAL PRIMARY KEY,
  progress_id BIGINT NOT NULL REFERENCES student_progress(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('audio', 'image', 'text')),
  url TEXT,
  text_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_phase_uploads_progress_id ON phase_uploads(progress_id);

-- Enable RLS
ALTER TABLE phase_uploads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for phase_uploads
CREATE POLICY "Students can view their own uploads"
  ON phase_uploads FOR SELECT
  USING (
    progress_id IN (
      SELECT id FROM student_progress WHERE student_id = auth.uid()
    )
  );

CREATE POLICY "Students can insert their own uploads"
  ON phase_uploads FOR INSERT
  WITH CHECK (
    progress_id IN (
      SELECT id FROM student_progress WHERE student_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view their children's uploads"
  ON phase_uploads FOR SELECT
  USING (
    progress_id IN (
      SELECT sp.id FROM student_progress sp
      JOIN parent_child_links pcl ON sp.student_id = pcl.child_id
      WHERE pcl.parent_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all uploads"
  ON phase_uploads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add comments for documentation
COMMENT ON TABLE phase_uploads IS 'Stores student uploads for phases (typically field-mission phase)';
COMMENT ON COLUMN phase_uploads.progress_id IS 'Reference to student_progress record';
COMMENT ON COLUMN phase_uploads.type IS 'Type of upload: audio, image, or text';
COMMENT ON COLUMN phase_uploads.url IS 'Storage URL for audio/image uploads';
COMMENT ON COLUMN phase_uploads.text_content IS 'Text content for text-type uploads';
