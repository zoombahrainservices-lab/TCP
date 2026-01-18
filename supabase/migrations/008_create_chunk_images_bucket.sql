-- Create storage bucket for chunk images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chunk-images', 'chunk-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for chunk-images bucket
-- Admins can upload chunk images
CREATE POLICY "Admins can upload chunk images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'chunk-images' AND
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can view all chunk images
CREATE POLICY "Admins can view chunk images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'chunk-images' AND
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete chunk images
CREATE POLICY "Admins can delete chunk images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'chunk-images' AND
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Public read access for chunk images (so they can be displayed in the reading interface)
CREATE POLICY "Public can read chunk images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'chunk-images');
