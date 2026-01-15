-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'parent', 'mentor', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create parent_child_links table
CREATE TABLE parent_child_links (
  id BIGSERIAL PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, child_id)
);

-- Create chapters table
CREATE TABLE chapters (
  id BIGSERIAL PRIMARY KEY,
  day_number INT NOT NULL UNIQUE CHECK (day_number >= 1 AND day_number <= 30),
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  task_description TEXT NOT NULL,
  before_questions JSONB NOT NULL DEFAULT '[]',
  after_questions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create daily_records table
CREATE TABLE daily_records (
  id BIGSERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id BIGINT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  before_answers JSONB DEFAULT '[]',
  after_answers JSONB DEFAULT '[]',
  reflection_text TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, day_number)
);

-- Create uploads table
CREATE TABLE uploads (
  id BIGSERIAL PRIMARY KEY,
  daily_record_id BIGINT NOT NULL REFERENCES daily_records(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('audio', 'image', 'text')),
  url TEXT,
  text_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_parent_child_links_parent ON parent_child_links(parent_id);
CREATE INDEX idx_parent_child_links_child ON parent_child_links(child_id);
CREATE INDEX idx_daily_records_student ON daily_records(student_id);
CREATE INDEX idx_daily_records_chapter ON daily_records(chapter_id);
CREATE INDEX idx_uploads_daily_record ON uploads(daily_record_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_child_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow users to view profiles of their children
CREATE POLICY "Parents can view their children's profiles"
  ON profiles FOR SELECT
  USING (
    id IN (
      SELECT child_id FROM parent_child_links WHERE parent_id = auth.uid()
    )
  );

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Parent-Child Links RLS Policies
CREATE POLICY "Parents can view their own links"
  ON parent_child_links FOR SELECT
  USING (parent_id = auth.uid());

CREATE POLICY "Admins can view all links"
  ON parent_child_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Chapters RLS Policies (public read for authenticated users)
CREATE POLICY "Authenticated users can view chapters"
  ON chapters FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert chapters"
  ON chapters FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update chapters"
  ON chapters FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete chapters"
  ON chapters FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Daily Records RLS Policies
CREATE POLICY "Students can view their own records"
  ON daily_records FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Students can insert their own records"
  ON daily_records FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their own records"
  ON daily_records FOR UPDATE
  USING (student_id = auth.uid());

CREATE POLICY "Parents can view their children's records"
  ON daily_records FOR SELECT
  USING (
    student_id IN (
      SELECT child_id FROM parent_child_links WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all records"
  ON daily_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Uploads RLS Policies
CREATE POLICY "Students can view their own uploads"
  ON uploads FOR SELECT
  USING (
    daily_record_id IN (
      SELECT id FROM daily_records WHERE student_id = auth.uid()
    )
  );

CREATE POLICY "Students can insert their own uploads"
  ON uploads FOR INSERT
  WITH CHECK (
    daily_record_id IN (
      SELECT id FROM daily_records WHERE student_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view their children's uploads"
  ON uploads FOR SELECT
  USING (
    daily_record_id IN (
      SELECT dr.id FROM daily_records dr
      JOIN parent_child_links pcl ON dr.student_id = pcl.child_id
      WHERE pcl.parent_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all uploads"
  ON uploads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create storage bucket for student uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('student-uploads', 'student-uploads', false);

-- Storage policies for student-uploads bucket
CREATE POLICY "Students can upload their own files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'student-uploads' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Students can view their own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'student-uploads' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Parents can view their children's files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'student-uploads' AND
    (storage.foldername(name))[1]::uuid IN (
      SELECT child_id::text FROM parent_child_links WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'student-uploads' AND
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON chapters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_records_updated_at BEFORE UPDATE ON daily_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
