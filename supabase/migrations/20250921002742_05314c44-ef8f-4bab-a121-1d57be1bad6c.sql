-- 나머지 SECURITY DEFINER 함수들 최적화

-- 1. get_current_user_wallet 함수: auth.uid() 접근이므로 SECURITY DEFINER 필요함 (유지)
-- 이 함수는 인증 시스템과 직접 연결되므로 SECURITY DEFINER가 필요

-- 2. user_has_activated_key 함수: get_current_user_wallet 사용하므로 SECURITY DEFINER 제거 가능
CREATE OR REPLACE FUNCTION public.user_has_activated_key(key_to_check text)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_photocard_keys upk
    JOIN public.users u ON u.wallet_address = upk.user_wallet
    WHERE upk.serial_key = key_to_check 
    AND u.id = auth.uid()
  );
$$;

-- 3. log_api_key_access 함수: 트리거 함수이므로 SECURITY DEFINER 제거
CREATE OR REPLACE FUNCTION public.log_api_key_access()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  -- API 키 접근 로그 기록 (SECURITY DEFINER 제거)
  INSERT INTO public.api_key_usage_logs (
    user_wallet,
    api_key_id,
    usage_type,
    success
  ) VALUES (
    COALESCE(NEW.user_wallet, OLD.user_wallet),
    COALESCE(NEW.id, OLD.id),
    CASE TG_OP
      WHEN 'INSERT' THEN 'create'
      WHEN 'UPDATE' THEN 'update'
      WHEN 'DELETE' THEN 'delete'
    END,
    true
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 4. Daily free box 함수들: 크로스 테이블 접근이 필요하므로 간소화하되 SECURITY DEFINER 유지
-- 하지만 더 안전하게 재작성

CREATE OR REPLACE FUNCTION public.get_daily_free_box_status(user_wallet_param text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  total_claims INTEGER := 0;
  user_claimed BOOLEAN := false;
  result JSON;
BEGIN
  -- 현재 사용자의 지갑 주소 확인 (보안 강화)
  IF user_wallet_param != (SELECT wallet_address FROM public.users WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized access';
  END IF;
  
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

CREATE OR REPLACE FUNCTION public.claim_daily_free_box(user_wallet_param text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  total_claims INTEGER := 0;
  user_claimed BOOLEAN := false;
  result JSON;
BEGIN
  -- 현재 사용자의 지갑 주소 확인 (보안 강화)
  IF user_wallet_param != (SELECT wallet_address FROM public.users WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized access';
  END IF;
  
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