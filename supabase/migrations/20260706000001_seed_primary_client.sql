-- ============================================================
-- 20260706000001_seed_primary_client.sql
-- Seed script for KBDF Luxury Store (Primary Tenant client)
-- Uses fixed UUIDs to avoid any build placeholder issues.
-- ============================================================

-- 1. Insert KBDF Tenant
INSERT INTO tenants (
  id,
  name,
  slug,
  primary_color,
  accent_color,
  currency_symbol,
  timezone,
  store_settings,
  is_active
) VALUES (
  'a8f5b82d-411a-4d7a-8fbb-5a41a45741b0',
  'KBDF Luxury Store',
  'kbdf',
  '#2f4065',
  '#fb7a90',
  '₱',
  'Asia/Manila',
  '{
    "address": "123 Luxury Avenue, Metro Manila, Philippines",
    "phone": "+63 2 8123 4567",
    "email": "clientcare@kbdf.com",
    "hours": {
      "monday_friday": "10:00 AM - 9:00 PM",
      "saturday": "10:00 AM - 10:00 PM",
      "sunday": "11:00 AM - 8:00 PM"
    }
  }'::jsonb,
  true
) ON CONFLICT (slug) DO NOTHING;

-- 2. Insert Default Roles for KBDF
INSERT INTO roles (id, tenant_id, name, description, permissions, is_system_role)
VALUES (
  'b7c1a93e-2b5d-4a1b-8fbb-7c6d482591b0',
  'a8f5b82d-411a-4d7a-8fbb-5a41a45741b0',
  'Admin',
  'Full access to all modules',
  '{
    "overview":        { "read": true },
    "analytics":       { "read": true },
    "items":           { "create": true, "read": true, "edit": true, "delete": true },
    "categories":      { "create": true, "read": true, "edit": true, "delete": true },
    "users":           { "create": true, "read": true, "edit": true, "delete": true },
    "roles":           { "create": true, "read": true, "edit": true, "delete": true },
    "leads":           { "read": true, "edit": true, "delete": true },
    "expenses":        { "create": true, "read": true, "edit": true, "delete": true },
    "payment_methods": { "create": true, "read": true, "edit": true, "delete": true },
    "settings":        { "read": true, "edit": true }
  }'::jsonb,
  true
) ON CONFLICT (tenant_id, name) DO NOTHING;

INSERT INTO roles (id, tenant_id, name, description, permissions, is_system_role)
VALUES (
  'c9d2f04a-3c6e-4b2c-9a1b-8d7e593610c1',
  'a8f5b82d-411a-4d7a-8fbb-5a41a45741b0',
  'Staff',
  'Read-only access to assigned modules',
  '{
    "overview":        { "read": true },
    "analytics":       { "read": false },
    "items":           { "create": false, "read": true, "edit": false, "delete": false },
    "categories":      { "create": false, "read": true, "edit": false, "delete": false },
    "users":           { "create": false, "read": false, "edit": false, "delete": false },
    "roles":           { "create": false, "read": false, "edit": false, "delete": false },
    "leads":           { "read": true, "edit": false, "delete": false },
    "expenses":        { "create": false, "read": true, "edit": false, "delete": false },
    "payment_methods": { "create": false, "read": true, "edit": false, "delete": false },
    "settings":        { "read": false, "edit": false }
  }'::jsonb,
  true
) ON CONFLICT (tenant_id, name) DO NOTHING;

-- 3. Insert default expense categories for KBDF
INSERT INTO expense_categories (tenant_id, name, color, is_predefined) VALUES
  ('a8f5b82d-411a-4d7a-8fbb-5a41a45741b0', 'Inventory',  '#3b82f6', true),
  ('a8f5b82d-411a-4d7a-8fbb-5a41a45741b0', 'Marketing',  '#8b5cf6', true),
  ('a8f5b82d-411a-4d7a-8fbb-5a41a45741b0', 'Shipping',   '#f59e0b', true),
  ('a8f5b82d-411a-4d7a-8fbb-5a41a45741b0', 'Utilities',  '#10b981', true),
  ('a8f5b82d-411a-4d7a-8fbb-5a41a45741b0', 'Rent',       '#ef4444', true),
  ('a8f5b82d-411a-4d7a-8fbb-5a41a45741b0', 'Payroll',    '#ec4899', true),
  ('a8f5b82d-411a-4d7a-8fbb-5a41a45741b0', 'Supplies',   '#14b8a6', true),
  ('a8f5b82d-411a-4d7a-8fbb-5a41a45741b0', 'Other',      '#6b7280', true)
ON CONFLICT (tenant_id, name) DO NOTHING;

-- 4. Insert storefront product categories for KBDF
INSERT INTO categories (tenant_id, name, slug, description, sort_order, is_active) VALUES
  ('a8f5b82d-411a-4d7a-8fbb-5a41a45741b0', 'Handbags',    'handbags',    'The ultimate collection',  1, true),
  ('a8f5b82d-411a-4d7a-8fbb-5a41a45741b0', 'Footwear',    'footwear',    'Step in style',            2, true),
  ('a8f5b82d-411a-4d7a-8fbb-5a41a45741b0', 'Wallets',     'wallets',     'Everyday essentials',      3, true),
  ('a8f5b82d-411a-4d7a-8fbb-5a41a45741b0', 'Watches',     'watches',     'Timeless pieces',          4, true),
  ('a8f5b82d-411a-4d7a-8fbb-5a41a45741b0', 'Accessories', 'accessories', 'Finishing touches',        5, true),
  ('a8f5b82d-411a-4d7a-8fbb-5a41a45741b0', 'Preloved',    'preloved',    'Vintage archives',         6, true)
ON CONFLICT (tenant_id, slug) DO NOTHING;
