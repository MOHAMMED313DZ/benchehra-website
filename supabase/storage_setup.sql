-- ============================================
-- STORAGE SETUP (Supabase Storage)
-- ============================================

-- 1. Create a public bucket for media if it doesn't exist
-- Note: This is usually done in the Supabase Dashboard, but can be done via SQL as well.
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies for the 'media' bucket
-- These policies need to be enabled for the 'storage.objects' table

-- Policy: Allow admins to upload files
DROP POLICY IF EXISTS "Admins can upload media" ON storage.objects;
CREATE POLICY "Admins can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media' 
  AND (public.is_admin(auth.uid()))
);

-- Policy: Allow public to view (SELECT) files
DROP POLICY IF EXISTS "Anyone can view media" ON storage.objects;
CREATE POLICY "Anyone can view media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

-- Policy: Allow admins to delete files
DROP POLICY IF EXISTS "Admins can delete media" ON storage.objects;
CREATE POLICY "Admins can delete media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'media' 
  AND (public.is_admin(auth.uid()))
);

-- Policy: Allow admins to update files
DROP POLICY IF EXISTS "Admins can update media" ON storage.objects;
CREATE POLICY "Admins can update media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'media' 
  AND (public.is_admin(auth.uid()))
);
