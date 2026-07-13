-- ============================================================
-- 20260713000000_add_customer_details_to_leeway_requests.sql
-- Adds customer_name and customer_email columns to leeway_requests.
-- ============================================================

ALTER TABLE public.leeway_requests 
ADD COLUMN customer_name TEXT,
ADD COLUMN customer_email TEXT;
