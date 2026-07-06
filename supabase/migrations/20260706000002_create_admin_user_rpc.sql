-- ============================================================
-- 20260706000002_create_admin_user_rpc.sql
-- SECURE RPC to create a tenant admin/staff user and auth account
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_admin_user_safe(
  p_email TEXT,
  p_password TEXT,
  p_profile JSONB
) RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_encrypted_password TEXT;
BEGIN
  -- 1. Authorization check: Caller must be a platform superadmin OR an active admin of the target tenant.
  IF NOT (
    public.is_superadmin() OR 
    (
      SELECT tenant_id FROM public.admin_users 
      WHERE auth_id = auth.uid() AND is_active = true LIMIT 1
    ) = (p_profile->>'tenant_id')::UUID
  ) THEN
    RAISE EXCEPTION 'Unauthorized. You do not have permission to create accounts for this tenant.';
  END IF;

  -- 2. Check if email already exists in auth.users
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
    SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
  ELSE
    -- 3. Create user in auth.users (using pgcrypto via extensions schema)
    v_user_id := gen_random_uuid();
    v_encrypted_password := extensions.crypt(p_password, extensions.gen_salt('bf'));

    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token,
      phone,
      phone_change_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      p_email,
      v_encrypted_password,
      now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      '',
      NULL,
      ''
    );

    -- 4. Create identity in auth.identities
    INSERT INTO auth.identities (
      id,
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      v_user_id,
      v_user_id::text,
      v_user_id,
      json_build_object('sub', v_user_id::text, 'email', p_email)::jsonb,
      'email',
      now(),
      now(),
      now()
    );
  END IF;

  -- 5. Insert or Update public.admin_users profile
  INSERT INTO public.admin_users (
    auth_id,
    tenant_id,
    role_id,
    email,
    full_name,
    is_superadmin,
    is_active,
    access_overview,
    access_analytics,
    access_items,
    access_users,
    access_settings,
    access_leads,
    access_expenses,
    access_categories,
    access_roles,
    access_payment_methods
  ) VALUES (
    v_user_id,
    (p_profile->>'tenant_id')::UUID,
    (p_profile->>'role_id')::UUID,
    p_email,
    p_profile->>'full_name',
    COALESCE((p_profile->>'is_superadmin')::BOOLEAN, false),
    COALESCE((p_profile->>'is_active')::BOOLEAN, true),
    COALESCE((p_profile->>'access_overview')::BOOLEAN, false),
    COALESCE((p_profile->>'access_analytics')::BOOLEAN, false),
    COALESCE((p_profile->>'access_items')::BOOLEAN, false),
    COALESCE((p_profile->>'access_users')::BOOLEAN, false),
    COALESCE((p_profile->>'access_settings')::BOOLEAN, false),
    COALESCE((p_profile->>'access_leads')::BOOLEAN, false),
    COALESCE((p_profile->>'access_expenses')::BOOLEAN, false),
    COALESCE((p_profile->>'access_categories')::BOOLEAN, false),
    COALESCE((p_profile->>'access_roles')::BOOLEAN, false),
    COALESCE((p_profile->>'access_payment_methods')::BOOLEAN, false)
  )
  ON CONFLICT (auth_id) DO UPDATE SET
    tenant_id = EXCLUDED.tenant_id,
    role_id = EXCLUDED.role_id,
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    is_active = EXCLUDED.is_active,
    access_overview = EXCLUDED.access_overview,
    access_analytics = EXCLUDED.access_analytics,
    access_items = EXCLUDED.access_items,
    access_users = EXCLUDED.access_users,
    access_settings = EXCLUDED.access_settings,
    access_leads = EXCLUDED.access_leads,
    access_expenses = EXCLUDED.access_expenses,
    access_categories = EXCLUDED.access_categories,
    access_roles = EXCLUDED.access_roles,
    access_payment_methods = EXCLUDED.access_payment_methods;

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
