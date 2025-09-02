-- 1) Enums
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('admin','insurer','client');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.insurer_status AS ENUM ('pending','approved','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) profiles adjustments
-- Ensure timestamps
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Make insurer_id nullable (admin/clients may not belong to an insurer)
DO $$ BEGIN
  ALTER TABLE public.profiles ALTER COLUMN insurer_id DROP NOT NULL;
EXCEPTION WHEN undefined_column THEN NULL; END $$;

-- Convert role to enum and set default
DO $$ BEGIN
  ALTER TABLE public.profiles
    ALTER COLUMN role TYPE public.user_role USING role::public.user_role,
    ALTER COLUMN role SET DEFAULT 'client';
EXCEPTION WHEN undefined_column THEN NULL; END $$;

-- 3) insurers adjustments (approval workflow)
ALTER TABLE public.insurers
  ADD COLUMN IF NOT EXISTS status public.insurer_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS approved_by uuid,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- FK from profiles.insurer_id -> insurers.id
DO $$ BEGIN
  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_insurer_id_fkey FOREIGN KEY (insurer_id) REFERENCES public.insurers(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Unique CNPJ
DO $$ BEGIN
  ALTER TABLE public.insurers ADD CONSTRAINT insurers_cnpj_unique UNIQUE (cnpj);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4) Utility functions
-- get_user_insurer_id: fetch current user's insurer via profiles
CREATE OR REPLACE FUNCTION public.get_user_insurer_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT insurer_id FROM public.profiles WHERE id = _user_id;
$$;

-- get_user_role: role from profiles
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS public.user_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.profiles WHERE id = _user_id;
$$;

-- 5) RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurers ENABLE ROW LEVEL SECURITY;

-- Drop existing conflicting policies if present
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Insurers can view their clients profiles" ON public.profiles;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

-- Profiles policies
CREATE POLICY "Profiles: self select" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Profiles: self update" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Profiles: admin select all" ON public.profiles FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Profiles: admin update all" ON public.profiles FOR UPDATE USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Profiles: insurer can see own clients" ON public.profiles FOR SELECT USING (
  public.get_user_role(auth.uid()) = 'insurer' AND insurer_id = public.get_user_insurer_id(auth.uid())
);

-- Insurers policies
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

-- 6) Timestamp trigger function (idempotent)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Attach triggers
DO $$ BEGIN
  DROP TRIGGER IF EXISTS trg_profiles_set_updated_at ON public.profiles;
  CREATE TRIGGER trg_profiles_set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS trg_insurers_set_updated_at ON public.insurers;
  CREATE TRIGGER trg_insurers_set_updated_at BEFORE UPDATE ON public.insurers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- 7) Ensure profile row on new auth.user (minimal)
CREATE OR REPLACE FUNCTION public.ensure_profile_on_signup()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, role, insurer_id)
  VALUES (NEW.id, 'client', NULL)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.ensure_profile_on_signup();
EXCEPTION WHEN undefined_table THEN NULL; END $$;