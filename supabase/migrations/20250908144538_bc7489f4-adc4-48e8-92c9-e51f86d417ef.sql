-- Fix helper function used by RLS to map an insurer user to their insurer id
-- and add a supporting index for performance.

-- Ensure fast lookups
CREATE INDEX IF NOT EXISTS idx_insurers_profile_id ON public.insurers(profile_id);

-- Update function to fetch insurer id from insurers table (profiles.insurer_id does not exist)
CREATE OR REPLACE FUNCTION public.get_user_insurer_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT i.id
  FROM public.insurers i
  WHERE i.profile_id = _user_id
  LIMIT 1;
$$;