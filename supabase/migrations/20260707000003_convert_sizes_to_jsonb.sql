-- Drop the text array column sizes
ALTER TABLE public.items DROP COLUMN IF EXISTS sizes;

-- Recreate sizes as JSONB
ALTER TABLE public.items ADD COLUMN sizes jsonb DEFAULT '[]'::jsonb;
