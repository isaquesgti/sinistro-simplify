-- Safe migration without touching existing primary keys

-- 1) Create enum for insurer status
DO $$ BEGIN
  CREATE TYPE public.insurer_status AS ENUM ('pending','approved','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Add approval workflow columns to insurers
ALTER TABLE public.insurers
  ADD COLUMN IF NOT EXISTS status public.insurer_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS approved_by uuid,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Ensure CNPJ is unique
DO $$ BEGIN
  ALTER TABLE public.insurers ADD CONSTRAINT insurers_cnpj_unique UNIQUE (cnpj);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3) Utility helper functions
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

-- 4) Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurers ENABLE ROW LEVEL SECURITY;

-- 5) RLS policies (idempotent)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Profiles: self select" ON public.profiles;
  DROP POLICY IF EXISTS "Profiles: self update" ON public.profiles;
  DROP POLICY IF EXISTS "Profiles: admin select all" ON public.profiles;
  DROP POLICY IF EXISTS "Profiles: admin update all" ON public.profiles;
  DROP POLICY IF EXISTS "Profiles: insurer can see clients" ON public.profiles;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

CREATE POLICY "Profiles: self select" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Profiles: self update" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Profiles: admin select all" ON public.profiles FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Profiles: admin update all" ON public.profiles FOR UPDATE USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Profiles: insurer can see clients" ON public.profiles FOR SELECT USING (
  public.get_user_role(auth.uid()) = 'insurer' AND insurer_id = public.get_user_insurer_id(auth.uid())
);

DO $$ BEGIN
  DROP POLICY IF EXISTS "Insurers: admin all" ON public.insurers;
  DROP POLICY IF EXISTS "Insurers: owner select" ON public.insurers;
  DROP POLICY IF EXISTS "Insurers: owner update if approved" ON public.insurers;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

CREATE POLICY "Insurers: admin all" ON public.insurers FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Insurers: owner select" ON public.insurers FOR SELECT USING (
  id = public.get_user_insurer_id(auth.uid()) OR public.get_user_role(auth.uid()) = 'admin'
);
CREATE POLICY "Insurers: owner update if approved" ON public.insurers FOR UPDATE USING (
  id = public.get_user_insurer_id(auth.uid()) AND status = 'approved'
);

-- 6) updated_at trigger function and triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS trg_insurers_set_updated_at ON public.insurers;
  CREATE TRIGGER trg_insurers_set_updated_at BEFORE UPDATE ON public.insurers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN undefined_table THEN NULL; END $$;