-- Fix critical security vulnerability in api_keys table
-- Replace the overly permissive RLS policies with secure ones

-- First, drop the existing insecure policies
DROP POLICY IF EXISTS "Users can manage their own API keys" ON public.api_keys;

-- Create a security definer function to get the current user's wallet address
-- This prevents RLS recursion issues
CREATE OR REPLACE FUNCTION public.get_current_user_wallet()
RETURNS TEXT AS $$
  SELECT wallet_address FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create secure RLS policies that restrict access to user's own data
CREATE POLICY "Users can view their own API keys" 
ON public.api_keys 
FOR SELECT 
USING (user_wallet = public.get_current_user_wallet());

CREATE POLICY "Users can insert their own API keys" 
ON public.api_keys 
FOR INSERT 
WITH CHECK (user_wallet = public.get_current_user_wallet());

CREATE POLICY "Users can update their own API keys" 
ON public.api_keys 
FOR UPDATE 
USING (user_wallet = public.get_current_user_wallet())
WITH CHECK (user_wallet = public.get_current_user_wallet());

CREATE POLICY "Users can delete their own API keys" 
ON public.api_keys 
FOR DELETE 
USING (user_wallet = public.get_current_user_wallet());

-- Add an index on user_wallet for better performance
CREATE INDEX IF NOT EXISTS idx_api_keys_user_wallet ON public.api_keys(user_wallet);