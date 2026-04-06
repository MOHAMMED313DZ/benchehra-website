-- Add image_url to activities table
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS image_url text;
