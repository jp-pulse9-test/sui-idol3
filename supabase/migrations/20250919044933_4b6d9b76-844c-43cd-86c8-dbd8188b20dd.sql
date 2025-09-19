-- Remove overly permissive policies that expose all wallet addresses
DROP POLICY IF EXISTS "Users can view profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update profiles" ON public.users;
DROP POLICY IF EXISTS "Users can delete profiles" ON public.users;

-- Create more secure policies
-- Only allow reading wallet addresses for the purpose of user lookup during authentication
CREATE POLICY "Restricted user lookup" 
ON public.users 
FOR SELECT 
USING (false); -- Disable public read access entirely

-- Allow users to insert their own profile (needed for wallet connection)
-- Keep the insert policy as is since it's needed for wallet connection flow

-- Remove update and delete permissions for security
CREATE POLICY "No updates allowed" 
ON public.users 
FOR UPDATE 
USING (false);

CREATE POLICY "No deletes allowed" 
ON public.users 
FOR DELETE 
USING (false);