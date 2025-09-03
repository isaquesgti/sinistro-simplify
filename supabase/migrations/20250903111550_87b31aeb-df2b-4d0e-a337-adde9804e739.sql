-- Fix function search_path warnings

-- Ensure search_path on update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Ensure search_path on has_role if it exists
DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
  RETURNS boolean
  LANGUAGE sql
  STABLE SECURITY DEFINER
  SET search_path = public
  AS $$
    SELECT EXISTS (
      SELECT 1 FROM public.profiles WHERE id = _user_id AND role::text = _role::text
    );
  $$;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

-- Ensure search_path on handle_new_user if it exists
DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $$
  BEGIN
    INSERT INTO public.profiles (id)
    VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
  END;
  $$;
EXCEPTION WHEN undefined_object THEN NULL; END $$;