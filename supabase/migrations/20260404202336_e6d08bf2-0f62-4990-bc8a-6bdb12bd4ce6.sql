
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only admins can access users" ON public.users FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
