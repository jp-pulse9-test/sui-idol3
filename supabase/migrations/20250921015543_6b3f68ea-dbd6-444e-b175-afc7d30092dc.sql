-- Fix the get_public_idol_data function to work without strict authentication
-- Make it accessible to anyone to view basic idol data

DROP FUNCTION IF EXISTS public.get_public_idol_data();

CREATE OR REPLACE FUNCTION public.get_public_idol_data()
RETURNS TABLE(id bigint, name text, gender text, category text, concept text, profile_image text, created_at timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  -- Allow public access to basic idol data without requiring authentication
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