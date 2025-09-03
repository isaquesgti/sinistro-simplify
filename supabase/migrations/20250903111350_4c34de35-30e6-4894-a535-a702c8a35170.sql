-- Fix remaining security issues (skip existing policies)

-- 1) Enable RLS on missing tables (idempotent)
ALTER TABLE public.claim_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sinistros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2) Create policies for tables that don't have them yet
-- Claims
DO $$ BEGIN
  CREATE POLICY "Claims: users see own" ON public.claims FOR SELECT USING (
    client_id = auth.uid() OR 
    insurer_id = public.get_user_insurer_id(auth.uid()) OR 
    public.get_user_role(auth.uid()) = 'admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Claims: users can create" ON public.claims FOR INSERT WITH CHECK (client_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Claims: admin can manage" ON public.claims FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Claim updates
DO $$ BEGIN
  CREATE POLICY "Claim updates: view related" ON public.claim_updates FOR SELECT USING (
    claim_id IN (
      SELECT id FROM public.claims 
      WHERE client_id = auth.uid() OR 
            insurer_id = public.get_user_insurer_id(auth.uid()) OR 
            public.get_user_role(auth.uid()) = 'admin'
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Documents
DO $$ BEGIN
  CREATE POLICY "Documents: view own" ON public.documents FOR SELECT USING (
    user_id = auth.uid() OR public.get_user_role(auth.uid()) = 'admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Documents: create own" ON public.documents FOR INSERT WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Messages  
DO $$ BEGIN
  CREATE POLICY "Messages: view related" ON public.messages FOR SELECT USING (
    sender_id = auth.uid() OR 
    claim_id IN (
      SELECT id FROM public.claims 
      WHERE client_id = auth.uid() OR 
            insurer_id = public.get_user_insurer_id(auth.uid()) OR 
            public.get_user_role(auth.uid()) = 'admin'
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Messages: create own" ON public.messages FOR INSERT WITH CHECK (sender_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Plans
DO $$ BEGIN
  CREATE POLICY "Plans: admin can manage" ON public.plans FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Plans: insurers can view" ON public.plans FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('admin', 'insurer')
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Sinistros
DO $$ BEGIN
  CREATE POLICY "Sinistros: admin can manage" ON public.sinistros FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Sinistros: insurer can view own" ON public.sinistros FOR SELECT USING (
    insurer_id = public.get_user_insurer_id(auth.uid()) OR public.get_user_role(auth.uid()) = 'admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Users
DO $$ BEGIN
  CREATE POLICY "Users: admin only" ON public.users FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;