-- Fix critical security vulnerability: User wallet addresses exposed to public access
-- Drop the overly permissive policy that allows all access
DROP POLICY IF EXISTS "Allow all access" ON public.users;

-- Create secure RLS policies that only allow users to access their own data
CREATE POLICY "Users can view their own profile" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.users 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" 
ON public.users 
FOR DELETE 
USING (auth.uid() = id);