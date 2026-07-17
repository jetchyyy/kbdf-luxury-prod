-- ============================================================
-- 20260717000001_add_color_to_order_items.sql
-- Add color column to order_items table to store the buyer's
-- color selection.
-- ============================================================

ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS color TEXT DEFAULT NULL;
