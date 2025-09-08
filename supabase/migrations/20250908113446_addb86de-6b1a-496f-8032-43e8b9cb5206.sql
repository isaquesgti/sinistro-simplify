-- Fix security: remove overly permissive public read on profiles
-- Ensure RLS stays enabled and minimal impact to existing flows

-- Keep RLS enabled (idempotent)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop the policy that exposes all profiles to anonymous visitors
DROP POLICY IF EXISTS "Profiles: allow email check for reset" ON public.profiles;

-- Optional hardening: ensure only owners and admins can read profiles via existing policies
-- (Other existing policies like "Profiles: self select" and "Profiles: admin select" remain in place)

-- Note for reset flows: use supabase.auth.resetPasswordForEmail on the client, or
-- call the existing SECURITY DEFINER function public.user_exists_for_reset(user_email text)
-- instead of selecting from profiles.
