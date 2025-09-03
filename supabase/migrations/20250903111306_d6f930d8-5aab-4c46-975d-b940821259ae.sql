-- Fix security issues from linter

-- 1) Enable RLS on missing tables
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sinistros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2) Fix function search paths
CREATE OR REPLACE FUNCTION public.get_user_insurer_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT insurer_id FROM public.profiles WHERE id = _user_id;
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.profiles WHERE id = _user_id;
$$;

-- 3) Create basic RLS policies for the existing tables
-- Blog posts (admin only can manage, everyone can read published)
CREATE POLICY "Blog: admin can manage" ON public.blog_posts FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Blog: public can read published" ON public.blog_posts FOR SELECT USING (published = true OR public.get_user_role(auth.uid()) = 'admin');

-- Claims (users can see their own claims, insurers can see claims in their network)
CREATE POLICY "Claims: users see own" ON public.claims FOR SELECT USING (
  client_id = auth.uid() OR 
  insurer_id = public.get_user_insurer_id(auth.uid()) OR 
  public.get_user_role(auth.uid()) = 'admin'
);
CREATE POLICY "Claims: users can create" ON public.claims FOR INSERT WITH CHECK (client_id = auth.uid());
CREATE POLICY "Claims: admin can manage" ON public.claims FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Claim updates
CREATE POLICY "Claim updates: view related" ON public.claim_updates FOR SELECT USING (
  claim_id IN (
    SELECT id FROM public.claims 
    WHERE client_id = auth.uid() OR 
          insurer_id = public.get_user_insurer_id(auth.uid()) OR 
          public.get_user_role(auth.uid()) = 'admin'
  )
);

-- Documents
CREATE POLICY "Documents: view own" ON public.documents FOR SELECT USING (
  user_id = auth.uid() OR public.get_user_role(auth.uid()) = 'admin'
);
CREATE POLICY "Documents: create own" ON public.documents FOR INSERT WITH CHECK (user_id = auth.uid());

-- Messages
CREATE POLICY "Messages: view related" ON public.messages FOR SELECT USING (
  sender_id = auth.uid() OR 
  claim_id IN (
    SELECT id FROM public.claims 
    WHERE client_id = auth.uid() OR 
          insurer_id = public.get_user_insurer_id(auth.uid()) OR 
          public.get_user_role(auth.uid()) = 'admin'
  )
);
CREATE POLICY "Messages: create own" ON public.messages FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Plans (admin can manage, insurers can view)
CREATE POLICY "Plans: admin can manage" ON public.plans FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Plans: insurers can view" ON public.plans FOR SELECT USING (
  public.get_user_role(auth.uid()) IN ('admin', 'insurer')
);

-- Sinistros (admin and related insurer can see)
CREATE POLICY "Sinistros: admin can manage" ON public.sinistros FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Sinistros: insurer can view own" ON public.sinistros FOR SELECT USING (
  insurer_id = public.get_user_insurer_id(auth.uid()) OR public.get_user_role(auth.uid()) = 'admin'
);

-- Users table (admin only)
CREATE POLICY "Users: admin only" ON public.users FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');