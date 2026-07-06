-- ============================================================
-- 20260706000003_setup_storage_bucket.sql
-- Sets up the media bucket for product, category and site branding images.
-- Enforces multi-tenant isolation based on tenant_id folders.
-- ============================================================

-- Create a public bucket "media"
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO UPDATE
SET public = true, file_size_limit = 5242880;

-- Policies for "media" bucket

-- 1. Public Read Access
CREATE POLICY "Public Access" ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

-- 2. Authenticated Admin Upload
CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'media'
    AND auth.role() = 'authenticated'
    AND (
      is_superadmin()
      OR (split_part(name, '/', 1) = current_tenant_id()::text)
    )
  );

-- 3. Authenticated Admin Update
CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'media'
    AND auth.role() = 'authenticated'
    AND (
      is_superadmin()
      OR (split_part(name, '/', 1) = current_tenant_id()::text)
    )
  )
  WITH CHECK (
    bucket_id = 'media'
    AND auth.role() = 'authenticated'
    AND (
      is_superadmin()
      OR (split_part(name, '/', 1) = current_tenant_id()::text)
    )
  );

-- 4. Authenticated Admin Delete
CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'media'
    AND auth.role() = 'authenticated'
    AND (
      is_superadmin()
      OR (split_part(name, '/', 1) = current_tenant_id()::text)
    )
  );
