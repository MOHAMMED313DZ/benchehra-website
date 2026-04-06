-- ============================================
-- FULL DATABASE SETUP FOR BENCHEHRA CONNECT
-- Run this in the Supabase SQL Editor
-- ============================================

-- 1. Activities table
CREATE TABLE IF NOT EXISTS public.activities (
  activity_id SERIAL PRIMARY KEY,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_ar TEXT NOT NULL,
  description_en TEXT NOT NULL,
  category_ar TEXT NOT NULL,
  category_en TEXT NOT NULL,
  coach_id INTEGER,
  schedule_info_ar TEXT,
  schedule_info_en TEXT,
  target_audience_ar TEXT,
  target_audience_en TEXT,
  is_active BOOLEAN DEFAULT true
);

-- 2. Staff table
CREATE TABLE IF NOT EXISTS public.staff (
  staff_id SERIAL PRIMARY KEY,
  full_name_ar TEXT NOT NULL,
  full_name_en TEXT NOT NULL,
  position_ar TEXT NOT NULL,
  position_en TEXT NOT NULL,
  bio_ar TEXT,
  bio_en TEXT,
  photo_url TEXT,
  category TEXT NOT NULL
);

-- Add FK for activities -> staff (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'activities_coach_id_fkey'
  ) THEN
    ALTER TABLE public.activities 
      ADD CONSTRAINT activities_coach_id_fkey 
      FOREIGN KEY (coach_id) REFERENCES public.staff(staff_id);
  END IF;
END $$;

-- 3. News table
CREATE TABLE IF NOT EXISTS public.news (
  news_id SERIAL PRIMARY KEY,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  content_ar TEXT NOT NULL,
  content_en TEXT NOT NULL,
  featured_image_url TEXT,
  publish_date TIMESTAMPTZ DEFAULT now(),
  author_id INTEGER
);

-- 4. Announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
  announcement_id SERIAL PRIMARY KEY,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  content_ar TEXT NOT NULL,
  content_en TEXT NOT NULL,
  publish_date TIMESTAMPTZ DEFAULT now(),
  author_id INTEGER
);

-- 5. Photo Albums table
CREATE TABLE IF NOT EXISTS public.photo_albums (
  album_id SERIAL PRIMARY KEY,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT
);

-- 6. Photos table
CREATE TABLE IF NOT EXISTS public.photos (
  photo_id SERIAL PRIMARY KEY,
  album_id INTEGER REFERENCES public.photo_albums(album_id),
  photo_url TEXT NOT NULL,
  caption_ar TEXT,
  caption_en TEXT
);

-- 7. Videos table
CREATE TABLE IF NOT EXISTS public.videos (
  video_id SERIAL PRIMARY KEY,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  video_url TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  upload_date TIMESTAMPTZ DEFAULT now()
);

-- 8. Registrations table
CREATE TABLE IF NOT EXISTS public.registrations (
  registration_id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT,
  activity_id INTEGER REFERENCES public.activities(activity_id),
  status TEXT DEFAULT 'pending',
  submission_date TIMESTAMPTZ DEFAULT now()
);

-- 9. Reports table
CREATE TABLE IF NOT EXISTS public.reports (
  report_id SERIAL PRIMARY KEY,
  issue_type TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  reporter_info TEXT,
  attachment_url TEXT,
  status TEXT DEFAULT 'pending',
  submission_date TIMESTAMPTZ DEFAULT now()
);

-- 10. Testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
  testimonial_id SERIAL PRIMARY KEY,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER,
  status TEXT DEFAULT 'pending',
  submission_date TIMESTAMPTZ DEFAULT now()
);

-- 11. Legacy Users table
CREATE TABLE IF NOT EXISTS public.users (
  user_id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add FK for news/announcements -> users (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'news_author_id_fkey'
  ) THEN
    ALTER TABLE public.news 
      ADD CONSTRAINT news_author_id_fkey 
      FOREIGN KEY (author_id) REFERENCES public.users(user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'announcements_author_id_fkey'
  ) THEN
    ALTER TABLE public.announcements 
      ADD CONSTRAINT announcements_author_id_fkey 
      FOREIGN KEY (author_id) REFERENCES public.users(user_id);
  END IF;
END $$;

-- 12. Admin Profiles table
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Profiles table (regular users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  phone_number TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. User Activities (enrollments)
CREATE TABLE IF NOT EXISTS public.user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  activity_id INTEGER NOT NULL REFERENCES public.activities(activity_id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, activity_id)
);

-- ============================================
-- FUNCTIONS
-- ============================================

-- is_admin function
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

-- Auto-create profile on signup trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  RETURN NEW;
END;
$$;

-- Create trigger (drop first to be idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts, then recreate
-- (Using DO blocks so it doesn't error if they don't exist)

-- ---- ACTIVITIES ----
DROP POLICY IF EXISTS "Anyone can view activities" ON public.activities;
DROP POLICY IF EXISTS "Admins can manage activities" ON public.activities;
CREATE POLICY "Anyone can view activities" ON public.activities FOR SELECT USING (true);
CREATE POLICY "Admins can manage activities" ON public.activities FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ---- STAFF ----
DROP POLICY IF EXISTS "Anyone can view staff" ON public.staff;
DROP POLICY IF EXISTS "Admins can manage staff" ON public.staff;
CREATE POLICY "Anyone can view staff" ON public.staff FOR SELECT USING (true);
CREATE POLICY "Admins can manage staff" ON public.staff FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ---- NEWS ----
DROP POLICY IF EXISTS "Anyone can view news" ON public.news;
DROP POLICY IF EXISTS "Admins can manage news" ON public.news;
CREATE POLICY "Anyone can view news" ON public.news FOR SELECT USING (true);
CREATE POLICY "Admins can manage news" ON public.news FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ---- ANNOUNCEMENTS ----
DROP POLICY IF EXISTS "Anyone can view announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;
CREATE POLICY "Anyone can view announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Admins can manage announcements" ON public.announcements FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ---- PHOTO ALBUMS ----
DROP POLICY IF EXISTS "Anyone can view albums" ON public.photo_albums;
DROP POLICY IF EXISTS "Admins can manage albums" ON public.photo_albums;
CREATE POLICY "Anyone can view albums" ON public.photo_albums FOR SELECT USING (true);
CREATE POLICY "Admins can manage albums" ON public.photo_albums FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ---- PHOTOS ----
DROP POLICY IF EXISTS "Anyone can view photos" ON public.photos;
DROP POLICY IF EXISTS "Admins can manage photos" ON public.photos;
CREATE POLICY "Anyone can view photos" ON public.photos FOR SELECT USING (true);
CREATE POLICY "Admins can manage photos" ON public.photos FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ---- VIDEOS ----
DROP POLICY IF EXISTS "Anyone can view videos" ON public.videos;
DROP POLICY IF EXISTS "Admins can manage videos" ON public.videos;
CREATE POLICY "Anyone can view videos" ON public.videos FOR SELECT USING (true);
CREATE POLICY "Admins can manage videos" ON public.videos FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ---- REGISTRATIONS ----
DROP POLICY IF EXISTS "Anyone can submit registration" ON public.registrations;
DROP POLICY IF EXISTS "Admins can view registrations" ON public.registrations;
DROP POLICY IF EXISTS "Admins can manage registrations" ON public.registrations;
DROP POLICY IF EXISTS "Admins can delete registrations" ON public.registrations;
CREATE POLICY "Anyone can submit registration" ON public.registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view registrations" ON public.registrations FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage registrations" ON public.registrations FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete registrations" ON public.registrations FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- ---- REPORTS ----
DROP POLICY IF EXISTS "Anyone can submit report" ON public.reports;
DROP POLICY IF EXISTS "Admins can view reports" ON public.reports;
DROP POLICY IF EXISTS "Admins can manage reports" ON public.reports;
DROP POLICY IF EXISTS "Admins can delete reports" ON public.reports;
CREATE POLICY "Anyone can submit report" ON public.reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view reports" ON public.reports FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage reports" ON public.reports FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete reports" ON public.reports FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- ---- TESTIMONIALS ----
DROP POLICY IF EXISTS "Anyone can submit testimonial" ON public.testimonials;
DROP POLICY IF EXISTS "Anyone can view approved testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can delete testimonials" ON public.testimonials;
CREATE POLICY "Anyone can submit testimonial" ON public.testimonials FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view approved testimonials" ON public.testimonials FOR SELECT USING (status = 'approved' OR (auth.uid() IS NOT NULL AND public.is_admin(auth.uid())));
CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete testimonials" ON public.testimonials FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- ---- USERS (legacy) ----
DROP POLICY IF EXISTS "Only admins can access users" ON public.users;
CREATE POLICY "Only admins can access users" ON public.users FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ---- ADMIN PROFILES ----
DROP POLICY IF EXISTS "Admins can view admin profiles" ON public.admin_profiles;
DROP POLICY IF EXISTS "Admins can manage admin profiles" ON public.admin_profiles;
DROP POLICY IF EXISTS "Users can check own admin status" ON public.admin_profiles;
CREATE POLICY "Users can check own admin status" ON public.admin_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view admin profiles" ON public.admin_profiles FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage admin profiles" ON public.admin_profiles FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- ---- PROFILES ----
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (is_admin(auth.uid()));

-- ---- USER ACTIVITIES ----
DROP POLICY IF EXISTS "Users can view own enrollments" ON public.user_activities;
DROP POLICY IF EXISTS "Users can enroll" ON public.user_activities;
DROP POLICY IF EXISTS "Users can unenroll" ON public.user_activities;
DROP POLICY IF EXISTS "Admins can view all enrollments" ON public.user_activities;
CREATE POLICY "Users can view own enrollments" ON public.user_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can enroll" ON public.user_activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unenroll" ON public.user_activities FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all enrollments" ON public.user_activities FOR SELECT TO authenticated USING (is_admin(auth.uid()));

-- ============================================
-- DONE! All tables, functions, and policies are set up.
-- ============================================
