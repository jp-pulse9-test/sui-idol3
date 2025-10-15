-- Fix RLS policies for idols table to allow public read access

-- Drop restrictive policies
DROP POLICY IF EXISTS "Only authenticated users can view full idol data" ON public.idols;
DROP POLICY IF EXISTS "Only authenticated users can manage idols" ON public.idols;

-- Create public read access policy
CREATE POLICY "Allow public read access to idols"
ON public.idols
FOR SELECT
TO public
USING (true);

-- Allow authenticated users to manage idols
CREATE POLICY "Authenticated users can manage idols"
ON public.idols
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Grant necessary permissions
GRANT SELECT ON public.idols TO anon;
GRANT SELECT ON public.idols TO authenticated;