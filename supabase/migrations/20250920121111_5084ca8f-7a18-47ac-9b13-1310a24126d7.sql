-- Fix security vulnerability: Restrict idol data access to authenticated users only
-- Update the RLS policy to require authentication instead of allowing public access

DROP POLICY IF EXISTS "Anyone can view idols202" ON public.idols;

CREATE POLICY "Authenticated users can view idols" 
ON public.idols 
FOR SELECT 
USING (auth.uid() IS NOT NULL);