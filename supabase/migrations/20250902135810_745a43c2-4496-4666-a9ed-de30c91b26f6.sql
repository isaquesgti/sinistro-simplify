-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('admin', 'insurer', 'client');

-- Create enum for insurer status  
CREATE TYPE public.insurer_status AS ENUM ('pending', 'approved', 'rejected');

-- Create profiles table to extend auth.users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role public.user_role NOT NULL DEFAULT 'client',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create insurers table
CREATE TABLE public.insurers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  cnpj TEXT NOT NULL UNIQUE,
  phone TEXT,
  status public.insurer_status NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clients table
CREATE TABLE public.clients (
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
  JOIN public.profiles p ON i.profile_id = p.id 
  WHERE p.id = user_id;
$$;

-- Create function to get client's insurer_id
CREATE OR REPLACE FUNCTION public.get_client_insurer_id(user_id UUID)
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT c.insurer_id FROM public.clients c 
  JOIN public.profiles p ON c.profile_id = p.id 
  WHERE p.id = user_id;
$$;

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

-- Create trigger function for automatic profile creation
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

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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

-- Insert the admin user (you'll need to sign up first, then update this)
-- This will be done after the first admin signup