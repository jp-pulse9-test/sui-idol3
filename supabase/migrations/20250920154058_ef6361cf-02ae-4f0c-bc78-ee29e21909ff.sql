-- Drop the existing view and recreate without SECURITY DEFINER
DROP VIEW IF EXISTS public.idols_basic;

-- Create a simple view for public idol access that only exposes basic information
-- This view will use the querying user's permissions (not SECURITY DEFINER)
CREATE VIEW public.idols_basic AS
SELECT 
  id,
  name,
  "Gender" as gender,
  "Category" as category,
  "Concept" as concept,
  profile_image,
  created_at
FROM public.idols;

-- Create RLS policy for the view to allow public read access to basic info only
ALTER VIEW public.idols_basic ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view basic idol info from view" 
ON public.idols_basic 
FOR SELECT 
USING (true);