-- Add is_new_arrival boolean column to items table
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS is_new_arrival boolean DEFAULT false;
