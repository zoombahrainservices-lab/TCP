-- Create phases table for Zone → Chapter → Phase hierarchy
-- Migration: 102_create_phases_table.sql

CREATE TABLE IF NOT EXISTS phases (
  id BIGSERIAL PRIMARY KEY,
  chapter_id BIGINT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  phase_number INT NOT NULL CHECK (phase_number >= 1 AND phase_number <= 5),
  phase_type TEXT NOT NULL CHECK (phase_type IN ('power-scan', 'secret-intel', 'visual-guide', 'field-mission', 'level-up')),
  title TEXT,
  content TEXT, -- phase-specific content (markdown or JSON)
  metadata JSONB DEFAULT '{}', -- flexible storage for questions, tasks, images, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (chapter_id, phase_number)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_phases_chapter_id ON phases(chapter_id);
CREATE INDEX IF NOT EXISTS idx_phases_phase_type ON phases(phase_type);
CREATE INDEX IF NOT EXISTS idx_phases_chapter_phase ON phases(chapter_id, phase_number);

-- Enable RLS
ALTER TABLE phases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for phases (public read for authenticated users, admin write)
CREATE POLICY "Authenticated users can view phases"
  ON phases FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert phases"
  ON phases FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update phases"
  ON phases FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete phases"
  ON phases FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_phases_updated_at BEFORE UPDATE ON phases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE phases IS 'Phases are the 5 sequential learning steps within each chapter';
COMMENT ON COLUMN phases.chapter_id IS 'Reference to parent chapter';
COMMENT ON COLUMN phases.phase_number IS 'Sequential phase number (1-5)';
COMMENT ON COLUMN phases.phase_type IS 'Type of phase: power-scan, secret-intel, visual-guide, field-mission, level-up';
COMMENT ON COLUMN phases.title IS 'Display title for the phase';
COMMENT ON COLUMN phases.content IS 'Phase-specific content (markdown, HTML, or JSON)';
COMMENT ON COLUMN phases.metadata IS 'Flexible JSONB storage for questions, tasks, images, etc.';
