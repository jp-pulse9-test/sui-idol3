-- Create table to track daily free box claims
CREATE TABLE public.daily_free_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_wallet TEXT NOT NULL,
  claim_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_wallet, claim_date)
);

-- Enable RLS
ALTER TABLE public.daily_free_claims ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all daily claims" 
ON public.daily_free_claims 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own claims" 
ON public.daily_free_claims 
FOR INSERT 
WITH CHECK (user_wallet = get_current_user_wallet());

-- Create index for performance
CREATE INDEX idx_daily_free_claims_date_created ON public.daily_free_claims(claim_date, created_at);

-- Create function to check daily free box availability
CREATE OR REPLACE FUNCTION public.get_daily_free_box_status(user_wallet_param TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  total_claims INTEGER;
  user_claimed BOOLEAN;
  result JSON;
BEGIN
  -- Get total claims for today
  SELECT COUNT(*) INTO total_claims
  FROM daily_free_claims
  WHERE claim_date = today_date;
  
  -- Check if user has already claimed today
  SELECT EXISTS(
    SELECT 1 FROM daily_free_claims
    WHERE user_wallet = user_wallet_param AND claim_date = today_date
  ) INTO user_claimed;
  
  -- Build result
  result := json_build_object(
    'totalClaimsToday', total_claims,
    'userHasClaimedToday', user_claimed,
    'canClaim', total_claims < 10 AND NOT user_claimed,
    'maxDailyClaims', 10,
    'remainingSlots', GREATEST(0, 10 - total_claims)
  );
  
  RETURN result;
END;
$$;

-- Create function to claim daily free box
CREATE OR REPLACE FUNCTION public.claim_daily_free_box(user_wallet_param TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  total_claims INTEGER;
  user_claimed BOOLEAN;
  result JSON;
BEGIN
  -- Get current status
  SELECT COUNT(*) INTO total_claims
  FROM daily_free_claims
  WHERE claim_date = today_date;
  
  SELECT EXISTS(
    SELECT 1 FROM daily_free_claims
    WHERE user_wallet = user_wallet_param AND claim_date = today_date
  ) INTO user_claimed;
  
  -- Check if claim is possible
  IF total_claims >= 10 THEN
    result := json_build_object(
      'success', false,
      'error', 'Daily limit reached',
      'totalClaimsToday', total_claims,
      'remainingSlots', 0
    );
    RETURN result;
  END IF;
  
  IF user_claimed THEN
    result := json_build_object(
      'success', false,
      'error', 'User already claimed today',
      'totalClaimsToday', total_claims,
      'remainingSlots', 10 - total_claims
    );
    RETURN result;
  END IF;
  
  -- Insert the claim
  INSERT INTO daily_free_claims (user_wallet, claim_date)
  VALUES (user_wallet_param, today_date);
  
  -- Return success
  result := json_build_object(
    'success', true,
    'totalClaimsToday', total_claims + 1,
    'remainingSlots', 9 - total_claims
  );
  
  RETURN result;
END;
$$;