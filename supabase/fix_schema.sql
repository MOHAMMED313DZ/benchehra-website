-- Adding 'is_active' column to announcements and news tables
-- This ensures the admin dashboard can toggle visibility

ALTER TABLE public.announcements 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE public.news 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
