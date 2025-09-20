-- Fix RLS policies to allow public access to the get_public_idols function
-- Update the function to be accessible to anonymous users as well
GRANT EXECUTE ON FUNCTION public.get_public_idols() TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_idols() TO authenticated;

-- Ensure the function works by setting proper search path
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
  -- Use the authenticated role to bypass RLS for this specific function
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