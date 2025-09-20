-- Fix security vulnerability: Allow users to view their own profile data
-- Replace the restrictive policy that blocks all SELECT operations

DROP POLICY IF EXISTS "Restricted user lookup" ON public.users;

CREATE POLICY "Users can view their own profile" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);