-- First make sure profiles table has proper primary key constraint
ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);

-- Now create the other constraints and tables
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
ADD COLUMN IF NOT EXISTS profile_id UUID,
ADD COLUMN IF NOT EXISTS status public.insurer_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_by UUID,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add foreign key constraints
DO $$ BEGIN
    ALTER TABLE public.insurers ADD CONSTRAINT insurers_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.insurers ADD CONSTRAINT insurers_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.profiles(id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

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