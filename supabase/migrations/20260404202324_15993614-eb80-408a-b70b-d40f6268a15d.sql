
-- Create admin_profiles table linked to Supabase Auth
CREATE TABLE public.admin_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles WHERE user_id = _user_id
  )
$$;

-- Admin profiles policies
CREATE POLICY "Admins can view admin profiles" ON public.admin_profiles
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage admin profiles" ON public.admin_profiles
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Activities RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view activities" ON public.activities FOR SELECT USING (true);
CREATE POLICY "Admins can manage activities" ON public.activities FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- News RLS
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view news" ON public.news FOR SELECT USING (true);
CREATE POLICY "Admins can manage news" ON public.news FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Announcements RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Admins can manage announcements" ON public.announcements FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Staff RLS
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view staff" ON public.staff FOR SELECT USING (true);
CREATE POLICY "Admins can manage staff" ON public.staff FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Photo Albums RLS
ALTER TABLE public.photo_albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view albums" ON public.photo_albums FOR SELECT USING (true);
CREATE POLICY "Admins can manage albums" ON public.photo_albums FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Photos RLS
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view photos" ON public.photos FOR SELECT USING (true);
CREATE POLICY "Admins can manage photos" ON public.photos FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Videos RLS
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view videos" ON public.videos FOR SELECT USING (true);
CREATE POLICY "Admins can manage videos" ON public.videos FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Registrations RLS (public can insert, admins can view/manage)
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit registration" ON public.registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view registrations" ON public.registrations FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage registrations" ON public.registrations FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete registrations" ON public.registrations FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- Reports RLS (public can insert, admins can view/manage)
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit report" ON public.reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view reports" ON public.reports FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage reports" ON public.reports FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete reports" ON public.reports FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- Testimonials RLS (public can insert and view approved, admins can manage all)
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit testimonial" ON public.testimonials FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view approved testimonials" ON public.testimonials FOR SELECT USING (status = 'approved' OR (auth.uid() IS NOT NULL AND public.is_admin(auth.uid())));
CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete testimonials" ON public.testimonials FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
