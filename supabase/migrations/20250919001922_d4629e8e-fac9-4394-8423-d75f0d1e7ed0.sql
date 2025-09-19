-- RLS 보안 경고 수정

-- idols 테이블에 RLS 활성화
ALTER TABLE idols ENABLE ROW LEVEL SECURITY;

-- 함수 검색 경로 수정
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;