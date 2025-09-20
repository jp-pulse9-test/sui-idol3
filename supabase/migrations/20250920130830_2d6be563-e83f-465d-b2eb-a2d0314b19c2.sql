-- 사용자 테이블의 보안 강화: 지갑 주소 보호
-- 모든 공개 접근 정책 제거 및 본인만 접근 가능하도록 제한

-- 기존의 잠재적으로 위험한 정책들 제거
DROP POLICY IF EXISTS "Anyone can create users" ON public.users;
DROP POLICY IF EXISTS "Users are publicly readable" ON public.users;
DROP POLICY IF EXISTS "Public users access" ON public.users;

-- 사용자는 오직 본인의 프로필만 볼 수 있도록 제한
-- 기존 정책이 있다면 재생성하여 확실히 보안 적용
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

-- 새 사용자 생성은 인증된 사용자만 가능하고, 본인의 레코드만 생성 가능
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);

-- 업데이트 및 삭제는 보안상 차단 (지갑 주소는 변경되지 않아야 함)
-- 기존 정책 유지 (No updates allowed, No deletes allowed)

-- RLS가 확실히 활성화되어 있는지 확인
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;