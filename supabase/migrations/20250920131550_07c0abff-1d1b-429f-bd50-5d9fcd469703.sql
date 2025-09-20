-- Function search path 보안 문제 해결
-- 모든 함수에 search_path를 명시적으로 설정하여 보안 강화

-- log_api_key_access 함수 보안 강화
CREATE OR REPLACE FUNCTION public.log_api_key_access()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- API 키 접근 로그 기록
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