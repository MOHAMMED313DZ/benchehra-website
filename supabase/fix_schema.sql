-- Adding 'is_active' and 'image_url' columns to appropriate tables
-- This ensures the admin dashboard can toggle visibility and show images

ALTER TABLE public.announcements 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE public.news 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE public.activities 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS image_url TEXT;
