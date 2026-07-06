-- ============================================================
-- 20260707000000_create_promo_codes.sql
-- Creates the promo_codes table and integrates it with orders.
-- ============================================================

-- 1. Create promo_codes table
CREATE TABLE public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(12, 2) NOT NULL DEFAULT 0,
  max_uses INT, -- Nullable (null = infinite)
  used_count INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, code)
);

CREATE TRIGGER promo_codes_updated_at
  BEFORE UPDATE ON public.promo_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 2. Alter orders table to reference promo codes
ALTER TABLE public.orders
  ADD COLUMN promo_code_id UUID REFERENCES public.promo_codes(id) ON DELETE SET NULL,
  ADD COLUMN discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0;

-- 2.1 Add access_promo_codes to admin_users to allow sidebar access mapping
ALTER TABLE public.admin_users
  ADD COLUMN access_promo_codes BOOLEAN DEFAULT true;

-- 3. Enable RLS on promo_codes
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for promo_codes
CREATE POLICY "promo_codes_select" ON public.promo_codes FOR SELECT
  USING (
    is_superadmin()
    OR tenant_id = current_tenant_id()
    OR is_active = true
  );

CREATE POLICY "promo_codes_write" ON public.promo_codes FOR ALL
  USING (is_superadmin() OR tenant_id = current_tenant_id())
  WITH CHECK (is_superadmin() OR tenant_id = current_tenant_id());

-- 5. Atomic function to increment promo code usage (SECURITY DEFINER)
-- Allows checkout flow (including guests) to safely and concurrently increment used_count
CREATE OR REPLACE FUNCTION public.increment_promo_code_usage(promo_code_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.promo_codes
  SET used_count = used_count + 1
  WHERE id = promo_code_id;
END;
$$;
