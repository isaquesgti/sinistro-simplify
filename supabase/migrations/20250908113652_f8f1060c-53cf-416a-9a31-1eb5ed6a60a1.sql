-- Strengthen RLS for clients table to protect personal data (CPF, phone)
-- Enable RLS and replace admin-only policy with least-privilege policies

-- Ensure RLS is enabled
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Drop existing permissive/overly broad admin-only policy if present
DROP POLICY IF EXISTS "Clients: admin all" ON public.clients;

-- SELECT: client can read own row; insurer can read their clients; admins can read all
CREATE POLICY "Clients: self or insurer select"
ON public.clients
FOR SELECT
USING (
  (profile_id = auth.uid())
  OR (insurer_id = public.get_user_insurer_id(auth.uid()))
  OR public.has_role(auth.uid(), 'admin')
);

-- INSERT: client can create own row; insurer can create rows for their insurer; admins allowed
CREATE POLICY "Clients: self or insurer insert"
ON public.clients
FOR INSERT
WITH CHECK (
  (profile_id = auth.uid())
  OR (insurer_id = public.get_user_insurer_id(auth.uid()))
  OR public.has_role(auth.uid(), 'admin')
);

-- UPDATE: same ownership rules
CREATE POLICY "Clients: self or insurer update"
ON public.clients
FOR UPDATE
USING (
  (profile_id = auth.uid())
  OR (insurer_id = public.get_user_insurer_id(auth.uid()))
  OR public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  (profile_id = auth.uid())
  OR (insurer_id = public.get_user_insurer_id(auth.uid()))
  OR public.has_role(auth.uid(), 'admin')
);

-- DELETE: same ownership rules (admins + owning insurer + the client themself)
CREATE POLICY "Clients: self or insurer delete"
ON public.clients
FOR DELETE
USING (
  (profile_id = auth.uid())
  OR (insurer_id = public.get_user_insurer_id(auth.uid()))
  OR public.has_role(auth.uid(), 'admin')
);

-- Performance indexes for policy filters
CREATE INDEX IF NOT EXISTS idx_clients_profile_id ON public.clients(profile_id);
CREATE INDEX IF NOT EXISTS idx_clients_insurer_id ON public.clients(insurer_id);
