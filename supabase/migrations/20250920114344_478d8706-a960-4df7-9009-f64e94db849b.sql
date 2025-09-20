-- Fix security issue: Restrict daily_free_claims table access to only user's own claims
DROP POLICY "Users can view all daily claims" ON public.daily_free_claims;

CREATE POLICY "Users can view their own daily claims" 
ON public.daily_free_claims 
FOR SELECT 
USING (user_wallet = get_current_user_wallet());