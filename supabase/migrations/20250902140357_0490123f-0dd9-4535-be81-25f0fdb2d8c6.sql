-- First, let's create the proper structure
-- 1) Create enums
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('admin','insurer','client');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.insurer_status AS ENUM ('pending','approved','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Drop the current primary key constraint and recreate properly
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;

-- Make insurer_id nullable and remove from primary key
ALTER TABLE public.profiles ALTER COLUMN insurer_id DROP NOT NULL;

-- Create new single-column primary key
ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);

-- 3) Add missing columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Convert role to enum and set default
ALTER TABLE public.profiles
  ALTER COLUMN role TYPE public.user_role USING role::public.user_role,
  ALTER COLUMN role SET DEFAULT 'client';

-- 4) Create clients table to manage insurer-client relationships
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  insurer_id UUID NOT NULL REFERENCES public.insurers(id) ON DELETE CASCADE,
  cpf TEXT,
  phone TEXT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(profile_id, insurer_id)
);

-- 5) Update insurers table
ALTER TABLE public.insurers
  ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS status public.insurer_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Make CNPJ unique
DO $$ BEGIN
  ALTER TABLE public.insurers ADD CONSTRAINT insurers_cnpj_unique UNIQUE (cnpj);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 6) Utility functions
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS public.user_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.profiles WHERE id = _user_id;
$$;

CREATE OR REPLACE FUNCTION public.get_user_insurer_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT i.id FROM public.insurers i WHERE i.profile_id = _user_id;
$$;

CREATE OR REPLACE FUNCTION public.get_client_insurer_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT c.insurer_id FROM public.clients c WHERE c.profile_id = _user_id;
$$;

-- 7) Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- 8) Create RLS policies
-- Drop existing policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Profiles: self select" ON public.profiles;
  DROP POLICY IF EXISTS "Profiles: self update" ON public.profiles;
  DROP POLICY IF EXISTS "Profiles: admin select all" ON public.profiles;
  DROP POLICY IF EXISTS "Profiles: admin update all" ON public.profiles;
  DROP POLICY IF EXISTS "Profiles: insurer can see own clients" ON public.profiles;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

-- Profiles policies
CREATE POLICY "Profiles: self select" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Profiles: self update" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Profiles: admin all" ON public.profiles FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Profiles: insurer can see clients" ON public.profiles FOR SELECT USING (
  public.get_user_role(auth.uid()) = 'insurer' AND
  id IN (SELECT c.profile_id FROM public.clients c WHERE c.insurer_id = public.get_user_insurer_id(auth.uid()))
);

-- Insurers policies
CREATE POLICY "Insurers: admin all" ON public.insurers FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Insurers: owner select" ON public.insurers FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Insurers: owner update if approved" ON public.insurers FOR UPDATE USING (
  profile_id = auth.uid() AND status = 'approved'
);

-- Clients policies
CREATE POLICY "Clients: admin all" ON public.clients FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Clients: insurer manage own" ON public.clients FOR ALL USING (
  insurer_id = public.get_user_insurer_id(auth.uid())
);
CREATE POLICY "Clients: self select" ON public.clients FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Clients: self update" ON public.clients FOR UPDATE USING (profile_id = auth.uid());