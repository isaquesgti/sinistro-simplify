-- Create enum for user roles (if not exists)
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('admin', 'insurer', 'client');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum for insurer status (if not exists)  
DO $$ BEGIN
    CREATE TYPE public.insurer_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update profiles table structure
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update profiles.role to use enum
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE public.user_role USING role::public.user_role,
ALTER COLUMN role SET DEFAULT 'client';

-- Update insurers table structure
ALTER TABLE public.insurers 
ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS status public.insurer_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Make CNPJ unique if not already
DO $$ BEGIN
    ALTER TABLE public.insurers ADD CONSTRAINT insurers_cnpj_unique UNIQUE (cnpj);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create clients table if not exists
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  insurer_id UUID NOT NULL REFERENCES public.insurers(id) ON DELETE CASCADE,
  cpf TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.get_user_role(UUID);
DROP FUNCTION IF EXISTS public.get_user_insurer_id(UUID);
DROP FUNCTION IF EXISTS public.get_client_insurer_id(UUID);

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS public.user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- Create function to get user's insurer_id
CREATE OR REPLACE FUNCTION public.get_user_insurer_id(user_id UUID)
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT i.id FROM public.insurers i 
  WHERE i.profile_id = user_id;
$$;

-- Create function to get client's insurer_id
CREATE OR REPLACE FUNCTION public.get_client_insurer_id(user_id UUID)
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT c.insurer_id FROM public.clients c 
  WHERE c.profile_id = user_id;
$$;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Insurers can view their clients profiles" ON public.profiles;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Insurers can view their clients profiles" 
ON public.profiles 
FOR SELECT 
USING (
  public.get_user_role(auth.uid()) = 'insurer' AND 
  id IN (
    SELECT c.profile_id FROM public.clients c 
    WHERE c.insurer_id = public.get_user_insurer_id(auth.uid())
  )
);

-- Drop existing policies for insurers
DROP POLICY IF EXISTS "Admins can manage all insurers" ON public.insurers;
DROP POLICY IF EXISTS "Insurers can view their own data" ON public.insurers;
DROP POLICY IF EXISTS "Insurers can update their own data" ON public.insurers;

-- RLS Policies for insurers
CREATE POLICY "Admins can manage all insurers" 
ON public.insurers 
FOR ALL 
USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Insurers can view their own data" 
ON public.insurers 
FOR SELECT 
USING (profile_id = auth.uid());

CREATE POLICY "Insurers can update their own data" 
ON public.insurers 
FOR UPDATE 
USING (profile_id = auth.uid() AND status = 'approved');

-- RLS Policies for clients
CREATE POLICY "Admins can view all clients" 
ON public.clients 
FOR SELECT 
USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Insurers can manage their clients" 
ON public.clients 
FOR ALL 
USING (insurer_id = public.get_user_insurer_id(auth.uid()));

CREATE POLICY "Clients can view their own data" 
ON public.clients 
FOR SELECT 
USING (profile_id = auth.uid());

CREATE POLICY "Clients can update their own data" 
ON public.clients 
FOR UPDATE 
USING (profile_id = auth.uid());

-- Update trigger function for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'client')
  );
  RETURN NEW;
END;
$$;

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Drop existing triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_insurers_updated_at ON public.insurers;
DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;

-- Create triggers for updating timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_insurers_updated_at
  BEFORE UPDATE ON public.insurers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();