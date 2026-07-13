-- ============================================================
-- 20260713001000_add_pickup_location_to_orders.sql
-- Adds pickup_location to public.orders table
-- ============================================================

ALTER TABLE public.orders 
ADD COLUMN pickup_location TEXT;
