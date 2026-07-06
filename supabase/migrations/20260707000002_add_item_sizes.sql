-- Add sizes text array to items table
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS sizes text[] DEFAULT '{}';

-- Add size option text to order_items table
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS size text;
