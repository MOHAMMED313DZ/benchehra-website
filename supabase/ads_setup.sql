-- ============================================
-- ADS MANAGEMENT SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS public.ads (
  ad_id SERIAL PRIMARY KEY,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  ad_type TEXT NOT NULL DEFAULT 'manual', -- 'manual' (image + link) or 'script' (AdSense)
  image_url TEXT, -- For manual ads
  link_url TEXT,  -- For manual ads
  script_code TEXT, -- For automatic/script ads
  placement TEXT NOT NULL DEFAULT 'homepage_banner',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- Allow public to select active ads
CREATE POLICY "Anyone can view active ads" ON public.ads
FOR SELECT USING (is_active = true);

-- Allow admins to do anything
CREATE POLICY "Admins can manage ads" ON public.ads
FOR ALL TO authenticated
USING (public.is_admin(auth.uid()));
