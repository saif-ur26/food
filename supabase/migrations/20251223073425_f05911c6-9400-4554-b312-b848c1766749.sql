-- Allow first authenticated user to become admin (bootstrap)
CREATE OR REPLACE FUNCTION public.user_roles_empty()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (SELECT 1 FROM public.user_roles)
$$;

DROP POLICY IF EXISTS "Bootstrap first admin" ON public.user_roles;
CREATE POLICY "Bootstrap first admin"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND role = 'admin'
  AND public.user_roles_empty()
);