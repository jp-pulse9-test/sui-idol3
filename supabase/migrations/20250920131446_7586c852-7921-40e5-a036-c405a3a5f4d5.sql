-- API 키 보안 강화: 암호화와 접근 제어 개선

-- 1. API 키 사용 로그 테이블 생성 (모니터링용)
CREATE TABLE IF NOT EXISTS public.api_key_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_wallet TEXT NOT NULL,
  api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  usage_type TEXT NOT NULL, -- 'read', 'create', 'update', 'delete'
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT true
);

-- RLS 활성화
ALTER TABLE public.api_key_usage_logs ENABLE ROW LEVEL SECURITY;

-- 2. API 키 사용 로그 정책 (본인만 볼 수 있음)
CREATE POLICY "Users can view their own API usage logs"
ON public.api_key_usage_logs
FOR SELECT
USING (user_wallet = get_current_user_wallet());

-- 관리자는 모든 로그 볼 수 있음 (보안 모니터링용)
CREATE POLICY "Admins can view all API usage logs"
ON public.api_key_usage_logs
FOR SELECT
USING (
  get_current_user_wallet() IN (
    'admin_wallet_1',
    'admin_wallet_2'
  )
);

-- 3. API 키 액세스 제한 강화 - 읽기 전용 정책 업데이트
DROP POLICY IF EXISTS "Users can view their own API keys" ON public.api_keys;

-- 더 제한적인 읽기 정책 (세션 기반 인증 추가 고려)
CREATE POLICY "Users can view their own API keys with enhanced security"
ON public.api_keys
FOR SELECT
USING (
  user_wallet = get_current_user_wallet() AND
  -- 추가 보안: 최근 활성 사용자만 접근 가능
  updated_at > NOW() - INTERVAL '30 days'
);

-- 4. API 키 생성/수정 시 로깅 트리거 함수
CREATE OR REPLACE FUNCTION public.log_api_key_access()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. API 키 테이블에 로깅 트리거 추가
DROP TRIGGER IF EXISTS api_key_access_log_trigger ON public.api_keys;
CREATE TRIGGER api_key_access_log_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.api_keys
  FOR EACH ROW EXECUTE FUNCTION public.log_api_key_access();

-- 6. API 키 암호화를 위한 컬럼 추가 (향후 마이그레이션용)
ALTER TABLE public.api_keys 
ADD COLUMN IF NOT EXISTS encrypted_key TEXT,
ADD COLUMN IF NOT EXISTS encryption_version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP WITH TIME ZONE;