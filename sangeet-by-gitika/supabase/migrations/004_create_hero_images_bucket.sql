-- Create hero-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-images', 'hero-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public to read hero images
CREATE POLICY "Public can read hero images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'hero-images');

-- Allow public to upload hero images (for admin)
CREATE POLICY "Public can upload hero images"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'hero-images');

-- Allow public to update hero images
CREATE POLICY "Public can update hero images"
  ON storage.objects
  FOR UPDATE
  TO public
  USING (bucket_id = 'hero-images');

-- Allow public to delete hero images
CREATE POLICY "Public can delete hero images"
  ON storage.objects
  FOR DELETE
  TO public
  USING (bucket_id = 'hero-images');
