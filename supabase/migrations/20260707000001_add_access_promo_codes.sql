-- ============================================================
-- 20260707000001_add_access_promo_codes.sql
-- Safely adds access_promo_codes to admin_users and sets it to true
-- ============================================================

ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS access_promo_codes BOOLEAN DEFAULT true;

UPDATE public.admin_users
  SET access_promo_codes = true
  WHERE access_promo_codes IS NULL;
