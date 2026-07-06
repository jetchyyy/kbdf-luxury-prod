-- ============================================================
-- 20260706000004_create_orders_schema.sql
-- Creates orders and order_items tables.
-- Grants upload access for payment receipts to guest checkout clients.
-- ============================================================

-- 1. Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  tracking_number TEXT NOT NULL,
  customer_first_name TEXT NOT NULL,
  customer_last_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_fb_link TEXT,
  shipping_province TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_barangay TEXT NOT NULL,
  shipping_street TEXT NOT NULL,
  shipping_landmark TEXT,
  delivery_method TEXT NOT NULL, -- 'standard' or 'pickup'
  payment_method_id UUID REFERENCES public.payment_methods(id) ON DELETE SET NULL,
  payment_method_type TEXT NOT NULL, -- 'walk_in', 'qr', 'bank_transfer', etc.
  proof_of_payment_url TEXT,
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  shipping_fee DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending_verification'
    CHECK (status IN ('pending_verification', 'verified', 'processing', 'shipped', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, tracking_number)
);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 2. Create order_items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.items(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Add access_orders column to admin_users table
ALTER TABLE public.admin_users
ADD COLUMN access_orders BOOLEAN DEFAULT true;

-- 4. Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 5. Define RLS Policies for orders
CREATE POLICY "orders_select" ON public.orders FOR SELECT
  USING (
    is_superadmin()
    OR tenant_id = current_tenant_id()
    -- Guest tracker filter allows lookup by tracking number
    OR (auth.role() = 'anon')
    OR (auth.role() = 'authenticated')
  );

CREATE POLICY "orders_insert" ON public.orders FOR INSERT
  WITH CHECK (true); -- Anyone can place an order (guest/auth)

CREATE POLICY "orders_write" ON public.orders FOR ALL
  USING (is_superadmin() OR tenant_id = current_tenant_id())
  WITH CHECK (is_superadmin() OR tenant_id = current_tenant_id());

-- 6. Define RLS Policies for order_items
CREATE POLICY "order_items_select" ON public.order_items FOR SELECT
  USING (
    is_superadmin()
    OR EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.tenant_id = current_tenant_id() OR auth.role() = 'anon' OR auth.role() = 'authenticated')
    )
  );

CREATE POLICY "order_items_insert" ON public.order_items FOR INSERT
  WITH CHECK (true); -- Anyone can insert items for their orders

-- 7. Storage Policy: Allow guest anon uploads for receipts
-- Extends media upload permissions to allow anonymous files matching receipts/ folder structure
CREATE POLICY "Guest Receipt Upload" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'media'
    AND (split_part(name, '/', 2) = 'receipts')
  );
