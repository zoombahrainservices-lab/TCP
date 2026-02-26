-- Create storage bucket for chapter assets if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chapter-assets',
  'chapter-assets',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Enable public access
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
  auth.jwt()->>'role' = 'admin'
);

-- Admin update policy
CREATE POLICY IF NOT EXISTS "Admin Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'chapter-assets' AND
  auth.jwt()->>'role' = 'admin'
);

-- Admin delete policy  
CREATE POLICY IF NOT EXISTS "Admin Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'chapter-assets' AND
  auth.jwt()->>'role' = 'admin'
);
