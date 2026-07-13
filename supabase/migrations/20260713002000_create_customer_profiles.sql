-- ============================================================
-- 20260713002000_create_customer_profiles.sql
-- Creates customer_profiles table to store customer shipping details.
-- ============================================================

CREATE TABLE public.customer_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  fb_link TEXT,
  province TEXT,
  city TEXT,
  barangay TEXT,
  street_address TEXT,
  landmark TEXT,
  custom_province TEXT,
  custom_city TEXT,
  custom_barangay TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- Enable RLS
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "customer_profiles_select" ON public.customer_profiles
  FOR SELECT USING (
    auth.uid() = id 
    OR EXISTS (
      SELECT 1 FROM public.admin_users au 
      WHERE au.auth_id = auth.uid() AND au.tenant_id = customer_profiles.tenant_id
    )
  );

CREATE POLICY "customer_profiles_insert" ON public.customer_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "customer_profiles_update" ON public.customer_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "customer_profiles_delete" ON public.customer_profiles
  FOR DELETE USING (auth.uid() = id);
