-- ============================================
-- STORAGE BUCKET POLICIES FOR chapter-assets
-- ============================================
-- Run this in Supabase SQL Editor AFTER creating the bucket manually

-- Enable public read access
CREATE POLICY IF NOT EXISTS "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'chapter-assets');

-- Admin upload policy
CREATE POLICY IF NOT EXISTS "Admin Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chapter-assets' AND
  (auth.jwt()->>'role' = 'admin' OR 
   EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
);

-- Admin update policy
CREATE POLICY IF NOT EXISTS "Admin Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'chapter-assets' AND
  (auth.jwt()->>'role' = 'admin' OR 
   EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
);

-- Admin delete policy  
CREATE POLICY IF NOT EXISTS "Admin Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'chapter-assets' AND
  (auth.jwt()->>'role' = 'admin' OR 
   EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
);
