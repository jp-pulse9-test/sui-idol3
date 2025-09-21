-- Create security-enabled functions instead of relying on public views

-- Drop the insecure public views
DROP VIEW IF EXISTS public.idols_basic_public;
DROP VIEW IF EXISTS public.idols_public;

-- Create a secure function for basic idol data (replacing idols_basic_public)
CREATE OR REPLACE FUNCTION public.get_basic_idol_data()
RETURNS TABLE(
  id bigint,
  name text,
  profile_image text,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Only allow authenticated users to access basic idol data
  SELECT 
    i.id,
    i.name,
    i.profile_image,
    i.created_at
  FROM public.idols i
  WHERE auth.uid() IS NOT NULL  -- Require authentication
  ORDER BY i.id;
$$;

-- Create a secure function for public idol data (replacing idols_public)  
CREATE OR REPLACE FUNCTION public.get_public_idol_data()
RETURNS TABLE(
  id bigint,
  name text,
  gender text,
  category text,
  concept text,
  profile_image text,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Only allow authenticated users to access public idol data
  SELECT 
    i.id,
    i.name,
    i."Gender" as gender,
    i."Category" as category,
    i."Concept" as concept,
    i.profile_image,
    i.created_at
  FROM public.idols i
  WHERE auth.uid() IS NOT NULL  -- Require authentication
  ORDER BY i.id;
$$;

-- Add security comments
COMMENT ON FUNCTION public.get_basic_idol_data() IS 'Secure function replacing idols_basic_public view. Requires authentication to prevent IP theft.';
COMMENT ON FUNCTION public.get_public_idol_data() IS 'Secure function replacing idols_public view. Requires authentication to prevent competitor access.';