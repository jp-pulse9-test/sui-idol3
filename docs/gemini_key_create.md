  구현 내용

  1. Supabase 클라이언트 설정 (src/lib/supabase.ts)

  - Supabase 연결 설정
  - API 키 인터페이스 정의

  2. 데이터베이스 마이그레이션 
  (supabase/migrations/001_create_api_keys_table.sql)

  - api_keys 테이블 생성
  - Row Level Security 설정
  - 자동 업데이트 트리거

  3. API 키 서비스 (src/services/apiKeyService.ts)

  - saveApiKey: API 키 저장/업데이트
  - getApiKey: API 키 조회
  - deleteApiKey: API 키 삭제
  - hasApiKey: API 키 존재 확인
  - updateApiKey: API 키 업데이트

  4. React 컴포넌트 (src/components/ApiKeyManager.tsx)

  - API 키 입력 UI
  - 저장/업데이트/삭제 기능
  - 비밀번호 표시/숨기기 토글

  5. 커스텀 Hook (src/hooks/useApiKey.ts)

  - API 키 상태 관리
  - 로딩/에러 처리
  - 재사용 가능한 로직

  사용 방법

  // 컴포넌트에서 사용
  import { ApiKeyManager } from '@/components/ApiKeyManager';

  <ApiKeyManager walletAddress={walletAddress} />

  // Hook으로 사용
  import { useApiKey } from '@/hooks/useApiKey';

  const { apiKey, saveApiKey, deleteApiKey } = useApiKey(walletAddress);      
