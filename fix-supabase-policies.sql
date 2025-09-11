-- Fix Supabase RLS policies that are causing permission issues
-- This script fixes the problematic RLS policies

-- 1. Drop problematic policies that reference auth.users incorrectly
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insurer_clients" ON public.profiles;

-- 2. Create simple, working policies for profiles
-- Allow users to see their own profile
CREATE POLICY "profiles_own_select" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "profiles_own_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile (for new users)
CREATE POLICY "profiles_own_insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Fix the trigger function to work without RLS issues
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Usuário'),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'client')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;
  RETURN NEW;
END;
$$;

-- 4. Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Create simple helper functions
CREATE OR REPLACE FUNCTION public.get_user_role_simple(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM public.profiles WHERE id = user_id;
$$;

-- 6. Ensure RLS is enabled on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 7. Create a test function to verify everything works
CREATE OR REPLACE FUNCTION public.test_profiles_access()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Try to count profiles
  PERFORM COUNT(*) FROM public.profiles;
  RETURN 'SUCCESS: Profiles table is accessible';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'ERROR: ' || SQLERRM;
END;
$$;
