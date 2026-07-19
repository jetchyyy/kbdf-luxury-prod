-- ============================================================
-- 20260717000002_add_customer_update_policy_to_leeway_requests.sql
-- Enables authenticated customer users to update their own leeway request rows.
-- ============================================================

CREATE POLICY "leeway_requests_update" ON public.leeway_requests FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND customer_id = auth.uid()
  )
  WITH CHECK (
    auth.role() = 'authenticated'
    AND customer_id = auth.uid()
  );
