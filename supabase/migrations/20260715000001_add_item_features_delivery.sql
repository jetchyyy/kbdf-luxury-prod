-- Add features jsonb column and delivery_info text column to items table
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS features jsonb DEFAULT NULL;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS delivery_info text DEFAULT NULL;
