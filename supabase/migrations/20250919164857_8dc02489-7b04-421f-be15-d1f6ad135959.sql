-- Fix the remaining security issues detected by the linter

-- Issue 1: Fix RLS enabled tables without policies (idols202 table)
-- Add proper RLS policies for the idols202 table since it has data but no policies
CREATE POLICY "Anyone can view idols202" 
ON public.idols202 
FOR SELECT 
USING (true);

-- Only authenticated users can modify idols202 data
CREATE POLICY "Only authenticated users can insert idols202" 
ON public.idols202 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Only authenticated users can update idols202" 
ON public.idols202 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Only authenticated users can delete idols202" 
ON public.idols202 
FOR DELETE 
TO authenticated
USING (true);

-- Issue 2: Update the function to have proper search path
-- We can't drop the function because policies depend on it, so we'll update it
CREATE OR REPLACE FUNCTION public.get_current_user_wallet()
RETURNS TEXT AS $$
  SELECT wallet_address FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = 'public';