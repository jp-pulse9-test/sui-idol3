-- Fix critical security vulnerability in photocard_keys table
-- Remove the overly permissive public read access and implement proper RLS

-- First, drop the existing unsafe policy
DROP POLICY IF EXISTS "Anyone can view photocard keys" ON public.photocard_keys;

-- Create a security definer function to check if user has activated a specific key
CREATE OR REPLACE FUNCTION public.user_has_activated_key(key_to_check text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_photocard_keys upk
    WHERE upk.serial_key = key_to_check 
    AND upk.user_wallet = public.get_current_user_wallet()
  );
$$;

-- Create a security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Check if the current user's wallet is in a predefined admin list
  -- This is a basic implementation - you may want to create an admin_users table
  SELECT public.get_current_user_wallet() IN (
    'admin_wallet_1', 
    'admin_wallet_2'
    -- Add actual admin wallet addresses here
  );
$$;

-- Create new secure RLS policies for photocard_keys

-- Policy 1: Users can only view keys they have activated
CREATE POLICY "Users can view their activated keys" 
ON public.photocard_keys 
FOR SELECT 
USING (
  public.user_has_activated_key(serial_key)
);

-- Policy 2: Admins can view all keys (optional - remove if not needed)
CREATE POLICY "Admins can view all keys" 
ON public.photocard_keys 
FOR SELECT 
USING (
  public.is_admin_user()
);

-- Policy 3: Only admins can insert new keys
CREATE POLICY "Only admins can insert keys" 
ON public.photocard_keys 
FOR INSERT 
WITH CHECK (
  public.is_admin_user()
);

-- Policy 4: Only admins can update keys
CREATE POLICY "Only admins can update keys" 
ON public.photocard_keys 
FOR UPDATE 
USING (
  public.is_admin_user()
);

-- Policy 5: Only admins can delete keys
CREATE POLICY "Only admins can delete keys" 
ON public.photocard_keys 
FOR DELETE 
USING (
  public.is_admin_user()
);

-- Add comment explaining the security model
COMMENT ON TABLE public.photocard_keys IS 'Premium access keys table with restricted access. Users can only view keys they have activated. Admin access required for management operations.';