-- ============================================================
-- 20260706000005_add_tenant_update_policy.sql
-- Enables tenant administrators to update their own settings.
-- ============================================================

CREATE POLICY "tenants_admin_update" ON public.tenants FOR UPDATE
  USING (id = current_tenant_id())
  WITH CHECK (id = current_tenant_id());
