import { supabase } from "@/integrations/supabase/client";

/**
 * 데이터 보안 유틸리티
 * 아이돌 데이터의 안전한 접근을 관리합니다.
 */

export interface SecureDataAccess {
  hasFullAccess: boolean;
  isAuthenticated: boolean;
  accessLevel: 'public' | 'limited' | 'full';
}

/**
 * 현재 사용자의 데이터 접근 권한을 확인합니다.
 */
export const checkDataAccessLevel = async (): Promise<SecureDataAccess> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const isAuthenticated = !!session?.session?.user;
    
    return {
      hasFullAccess: isAuthenticated,
      isAuthenticated,
      accessLevel: isAuthenticated ? 'full' : 'limited'
    };
  } catch (error) {
    console.error('Error checking access level:', error);
    return {
      hasFullAccess: false,
      isAuthenticated: false,
      accessLevel: 'public'
    };
  }
};

/**
 * 보안 정책에 따라 아이돌 데이터를 안전하게 가져옵니다.
 */
export const fetchSecureIdolData = async () => {
  try {
    const accessLevel = await checkDataAccessLevel();
    
    let query;
    if (accessLevel.hasFullAccess) {
      // 인증된 사용자: 전체 데이터 접근
      query = supabase
        .from('idols')
        .select('*')
        .order('id');
    } else {
      // 미인증 사용자: 제한된 공개 데이터만 접근
      query = supabase
        .from('idols_public')
        .select('*')
        .order('id');
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return {
      data: data || [],
      accessLevel: accessLevel.accessLevel,
      isSecure: true
    };
  } catch (error) {
    console.error('Secure data fetch failed:', error);
    return {
      data: [],
      accessLevel: 'public' as const,
      isSecure: false,
      error: error
    };
  }
};

/**
 * 민감한 데이터 필드를 마스킹합니다.
 */
export const maskSensitiveData = (data: any, isAuthenticated: boolean) => {
  if (isAuthenticated) {
    return data;
  }
  
  return {
    ...data,
    personality: '로그인하여 상세 정보를 확인하세요',
    persona_prompt: null,
    description: '인증된 사용자만 볼 수 있습니다',
    Concept: '기본 컨셉'
  };
};

/**
 * Rate limiting 체크
 */
export const checkRateLimit = (() => {
  const requestTimes: number[] = [];
  const RATE_LIMIT = 50; // 1분간 최대 50회
  const TIME_WINDOW = 60 * 1000; // 1분

  return () => {
    const now = Date.now();
    
    // 시간 윈도우 밖의 요청 제거
    while (requestTimes.length > 0 && requestTimes[0] < now - TIME_WINDOW) {
      requestTimes.shift();
    }
    
    // Rate limit 체크
    if (requestTimes.length >= RATE_LIMIT) {
      return false;
    }
    
    requestTimes.push(now);
    return true;
  };
})();

/**
 * 보안 로그 기록
 */
export const logSecurityEvent = (event: string, details?: any) => {
  console.log(`[SECURITY] ${event}`, details);
  
  // 실제 환경에서는 보안 로그 서비스로 전송
  // 예: Sentry, LogRocket 등
};