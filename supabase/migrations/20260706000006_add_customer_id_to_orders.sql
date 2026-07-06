-- ============================================================
-- 20260706000006_add_customer_id_to_orders.sql
-- Links orders table with authenticated storefront customer profiles.
-- ============================================================

-- 1. Add customer_id referencing auth.users
ALTER TABLE public.orders
ADD COLUMN customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Upgrade SELECT policy for orders
DROP POLICY IF EXISTS "orders_select" ON public.orders;

CREATE POLICY "orders_select" ON public.orders FOR SELECT
  USING (
    is_superadmin()
    -- Tenant Admin
    OR (auth.role() = 'authenticated' AND tenant_id = current_tenant_id())
    -- Storefront Customer
    OR (auth.role() = 'authenticated' AND customer_id = auth.uid())
    -- Anon Tracker Lookup
    OR (auth.role() = 'anon')
  );
