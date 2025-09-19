-- 기존 정책들 제거
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.users;

-- 목업 지갑 연결을 위한 새로운 정책들 생성
-- 읽기: 모든 사용자가 자신의 정보를 볼 수 있음 (지갑 주소로 식별)
CREATE POLICY "Users can view profiles" 
ON public.users 
FOR SELECT 
USING (true);

-- 삽입: 누구나 새 사용자를 생성할 수 있음 (목업 모드)
CREATE POLICY "Anyone can create users" 
ON public.users 
FOR INSERT 
WITH CHECK (true);

-- 업데이트: 모든 사용자가 모든 프로필을 업데이트할 수 있음 (목업 모드)
CREATE POLICY "Users can update profiles" 
ON public.users 
FOR UPDATE 
USING (true);

-- 삭제: 모든 사용자가 모든 프로필을 삭제할 수 있음 (목업 모드)
CREATE POLICY "Users can delete profiles" 
ON public.users 
FOR DELETE 
USING (true);