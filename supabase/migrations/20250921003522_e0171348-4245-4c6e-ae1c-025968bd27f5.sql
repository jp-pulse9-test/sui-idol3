-- Fix linter: remove Security Definer View issues and preserve public safe access

-- 1) Ensure public views run with invoker's rights (so they don't bypass RLS)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind IN ('v','m') AND n.nspname = 'public' AND c.relname = 'idols_public'
  ) THEN
    ALTER VIEW public.idols_public SET (security_invoker = on);
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind IN ('v','m') AND n.nspname = 'public' AND c.relname = 'idols_basic_public'
  ) THEN
    ALTER VIEW public.idols_basic_public SET (security_invoker = on);
  END IF;
END$$;

-- 2) Provide a safe public RPC to fetch non-sensitive idol data without exposing private columns
--    We intentionally use SECURITY DEFINER on the FUNCTION (not a VIEW) to return only allowed fields
--    This avoids definer-views while keeping UX intact
CREATE OR REPLACE FUNCTION public.get_public_idols()
RETURNS TABLE(
  id bigint,
  name text,
  gender text,
  category text,
  concept text,
  profile_image text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    i.id,
    i.name,
    i."Gender" as gender,
    i."Category" as category,
    i."Concept" as concept,
    i.profile_image,
    i.created_at
  FROM public.idols i
  ORDER BY i.id;
$$;

-- 3) Ensure proper execute permissions for clients
GRANT EXECUTE ON FUNCTION public.get_public_idols() TO anon, authenticated;
