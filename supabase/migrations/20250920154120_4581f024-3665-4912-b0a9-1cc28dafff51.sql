-- Drop the view since we can't apply RLS to views
DROP VIEW IF EXISTS public.idols_basic;

-- Create a function that returns basic idol information for public access
CREATE OR REPLACE FUNCTION public.get_public_idols()
RETURNS TABLE (
  id bigint,
  name text,
  gender text,
  category text,
  concept text,
  profile_image text,
  created_at timestamptz
) 
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
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

-- Grant access to the function
GRANT EXECUTE ON FUNCTION public.get_public_idols() TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_idols() TO authenticated;