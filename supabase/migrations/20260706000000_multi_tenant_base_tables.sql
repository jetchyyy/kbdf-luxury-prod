-- ============================================================
-- 20260706000000_multi_tenant_base_tables.sql
-- Base schema reconstruction for the Multi-Tenant E-commerce SaaS.
-- Creates all tables, triggers, functions, and RLS policies.
-- ============================================================

-- ============================================================
-- 1. TRIGGERS & UTILITY FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 2. TENANTS TABLE
-- ============================================================

CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,                     -- used in client context routing/isolation
  domain TEXT,                                   -- for custom domain binding
  logo_url TEXT,
  primary_color TEXT DEFAULT '#2f4065',
  accent_color TEXT DEFAULT '#fb7a90',
  currency_symbol TEXT DEFAULT '₱',
  timezone TEXT DEFAULT 'Asia/Manila',
  store_settings JSONB DEFAULT '{}'::jsonb,      -- address, phone, email, hours
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 3. ROLES TABLE
-- ============================================================

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb, -- dynamic module permission flags
  is_system_role BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, name)
);

CREATE TRIGGER roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 4. ADMIN USERS TABLE
-- ============================================================

CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE NOT NULL,                   -- references auth.users(id)
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  is_superadmin BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Individual module accessibility checkboxes
  access_overview BOOLEAN DEFAULT false,
  access_analytics BOOLEAN DEFAULT false,
  access_items BOOLEAN DEFAULT false,
  access_users BOOLEAN DEFAULT false,
  access_settings BOOLEAN DEFAULT false,
  access_leads BOOLEAN DEFAULT false,
  access_expenses BOOLEAN DEFAULT false,
  access_categories BOOLEAN DEFAULT false,
  access_roles BOOLEAN DEFAULT false,
  access_payment_methods BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 5. CATEGORIES TABLE
-- ============================================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 6. ITEMS TABLE
-- ============================================================

CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  original_price DECIMAL(12, 2),
  quantity INT NOT NULL DEFAULT 0,
  sku TEXT,
  brand TEXT,
  condition TEXT DEFAULT 'new'
    CHECK (condition IN ('new', 'preloved_excellent', 'preloved_good', 'preloved_fair')),
  stock_status TEXT DEFAULT 'in_stock'
    CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock')),
  image_urls TEXT[] DEFAULT '{}'::TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

CREATE TRIGGER items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 7. LEADS TABLE
-- ============================================================

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT,
  status TEXT DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'archived')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 8. EXPENSES & EXPENSE CATEGORIES TABLES
-- ============================================================

CREATE TABLE expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  is_predefined BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, name)
);

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  receipt_url TEXT,
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 9. PAYMENT METHODS TABLE
-- ============================================================

CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'qr'
    CHECK (type IN ('qr', 'bank_transfer', 'cod', 'custom')),
  account_name TEXT,
  account_number TEXT,
  qr_code_url TEXT,
  instructions TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 10. ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Security helper functions
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM admin_users
  WHERE auth_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT is_superadmin FROM admin_users WHERE auth_id = auth.uid() LIMIT 1),
    false
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- tenants
CREATE POLICY "tenants_select" ON tenants FOR SELECT
  USING (is_active = true OR is_superadmin() OR id = current_tenant_id());

CREATE POLICY "tenants_superadmin_all" ON tenants FOR ALL
  USING (is_superadmin())
  WITH CHECK (is_superadmin());

-- roles
CREATE POLICY "roles_all" ON roles FOR ALL
  USING (is_superadmin() OR tenant_id = current_tenant_id())
  WITH CHECK (is_superadmin() OR tenant_id = current_tenant_id());

-- admin_users
CREATE POLICY "admin_users_all" ON admin_users FOR ALL
  USING (is_superadmin() OR tenant_id = current_tenant_id())
  WITH CHECK (is_superadmin() OR tenant_id = current_tenant_id());

-- categories
CREATE POLICY "categories_select" ON categories FOR SELECT
  USING (is_active = true OR is_superadmin() OR tenant_id = current_tenant_id());

CREATE POLICY "categories_write" ON categories FOR ALL
  USING (is_superadmin() OR tenant_id = current_tenant_id())
  WITH CHECK (is_superadmin() OR tenant_id = current_tenant_id());

-- items
CREATE POLICY "items_select" ON items FOR SELECT
  USING (is_active = true OR is_superadmin() OR tenant_id = current_tenant_id());

CREATE POLICY "items_write" ON items FOR ALL
  USING (is_superadmin() OR tenant_id = current_tenant_id())
  WITH CHECK (is_superadmin() OR tenant_id = current_tenant_id());

-- leads
CREATE POLICY "leads_select" ON leads FOR SELECT
  USING (is_superadmin() OR tenant_id = current_tenant_id());

CREATE POLICY "leads_insert_anon" ON leads FOR INSERT
  WITH CHECK (true); -- Guest buyer storefront contact submissions

CREATE POLICY "leads_write" ON leads FOR ALL
  USING (is_superadmin() OR tenant_id = current_tenant_id())
  WITH CHECK (is_superadmin() OR tenant_id = current_tenant_id());

-- expense_categories
CREATE POLICY "expense_categories_select" ON expense_categories FOR SELECT
  USING (is_superadmin() OR tenant_id = current_tenant_id());

CREATE POLICY "expense_categories_insert" ON expense_categories FOR INSERT
  WITH CHECK (is_superadmin() OR tenant_id = current_tenant_id());

CREATE POLICY "expense_categories_update" ON expense_categories FOR UPDATE
  USING (is_superadmin() OR tenant_id = current_tenant_id());

CREATE POLICY "expense_categories_delete" ON expense_categories FOR DELETE
  USING (is_superadmin() OR (tenant_id = current_tenant_id() AND is_predefined = false));

-- expenses
CREATE POLICY "expenses_all" ON expenses FOR ALL
  USING (is_superadmin() OR tenant_id = current_tenant_id())
  WITH CHECK (is_superadmin() OR tenant_id = current_tenant_id());

-- payment_methods
CREATE POLICY "payment_methods_select" ON payment_methods FOR SELECT
  USING (is_active = true OR is_superadmin() OR tenant_id = current_tenant_id());

CREATE POLICY "payment_methods_write" ON payment_methods FOR ALL
  USING (is_superadmin() OR tenant_id = current_tenant_id())
  WITH CHECK (is_superadmin() OR tenant_id = current_tenant_id());

-- ============================================================
-- 11. AUTO-LINK AUTH USERS TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.admin_users
  SET auth_id = NEW.id
  WHERE email = NEW.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
