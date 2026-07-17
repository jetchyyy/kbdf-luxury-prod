-- ============================================================
-- 20260717000000_allow_public_review_uploads.sql
-- Allow public insert to the media bucket reviews/ directory
-- so that guest/unauthenticated users can upload review photos.
-- ============================================================

CREATE POLICY "Reviews Public Upload" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'media'
    AND split_part(name, '/', 2) = 'reviews'
  );
