-- Add colors jsonb column to items table
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS colors jsonb DEFAULT NULL;
