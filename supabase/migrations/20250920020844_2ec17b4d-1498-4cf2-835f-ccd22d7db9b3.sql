-- 포토카드 생성 시리얼 키 테이블
CREATE TABLE public.photocard_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  serial_key TEXT NOT NULL UNIQUE,
  total_credits INTEGER NOT NULL DEFAULT 0,
  remaining_credits INTEGER NOT NULL DEFAULT 0,
  is_unlimited BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by TEXT
);

-- 사용자별 활성화된 키 테이블
CREATE TABLE public.user_photocard_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_wallet TEXT NOT NULL,
  serial_key TEXT NOT NULL,
  activated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (serial_key) REFERENCES public.photocard_keys(serial_key)
);

-- 포토카드 생성 사용량 추적 테이블
CREATE TABLE public.photocard_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_wallet TEXT NOT NULL,
  serial_key TEXT NOT NULL,
  credits_used INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  generation_type TEXT,
  FOREIGN KEY (serial_key) REFERENCES public.photocard_keys(serial_key)
);

-- RLS 정책 설정
ALTER TABLE public.photocard_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_photocard_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photocard_usage ENABLE ROW LEVEL SECURITY;

-- photocard_keys 정책 (모든 인증된 사용자가 볼 수 있음)
CREATE POLICY "Anyone can view photocard keys" 
ON public.photocard_keys 
FOR SELECT 
USING (true);

-- user_photocard_keys 정책
CREATE POLICY "Users can view their own activated keys" 
ON public.user_photocard_keys 
FOR SELECT 
USING (user_wallet = get_current_user_wallet());

CREATE POLICY "Users can insert their own key activations" 
ON public.user_photocard_keys 
FOR INSERT 
WITH CHECK (user_wallet = get_current_user_wallet());

CREATE POLICY "Users can update their own key activations" 
ON public.user_photocard_keys 
FOR UPDATE 
USING (user_wallet = get_current_user_wallet());

-- photocard_usage 정책
CREATE POLICY "Users can view their own usage" 
ON public.photocard_usage 
FOR SELECT 
USING (user_wallet = get_current_user_wallet());

CREATE POLICY "Users can insert their own usage" 
ON public.photocard_usage 
FOR INSERT 
WITH CHECK (user_wallet = get_current_user_wallet());

-- 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 업데이트 트리거
CREATE TRIGGER update_photocard_keys_updated_at
  BEFORE UPDATE ON public.photocard_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 기본 시리얼 키 생성 (관리자용)
INSERT INTO public.photocard_keys (serial_key, total_credits, remaining_credits, is_unlimited, created_by)
VALUES 
  ('ADMIN-UNLIMITED-2025', 0, 0, true, 'system'),
  ('TEST-KEY-100', 100, 100, false, 'system'),
  ('PREMIUM-500', 500, 500, false, 'system');