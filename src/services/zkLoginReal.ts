// 실제 zkLogin 구현 (Google OAuth 설정 시 사용)
// 이 파일은 실제 @mysten/sui 패키지가 정상 작동할 때 사용됩니다

import React from 'react';
import { 
  SuiClient,
  getFullnodeUrl,
  Transaction,
  Ed25519Keypair
} from '@mysten/sui';
import { 
  generateNonce,
  generateRandomness,
  getZkLoginSignature,
  jwtToAddress
} from '@mysten/sui/zklogin';
import { toast } from 'sonner';

// zkLogin 설정
const REDIRECT_URL = window.location.origin;
const OPENID_PROVIDER = 'https://accounts.google.com';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id';
const SUI_NETWORK = 'testnet';

// Sui 클라이언트 초기화
const suiClient = new SuiClient({
  url: getFullnodeUrl(SUI_NETWORK),
});

export interface ZkLoginUser {
  address: string;
  email: string;
  name: string;
  picture?: string;
  provider: 'google' | 'facebook' | 'twitch';
  jwt: string;
  ephemeralKeyPair: Ed25519Keypair;
  maxEpoch: number;
  randomness: string;
  nonce: string;
}

export interface ZkLoginState {
  user: ZkLoginUser | null;
  isLoading: boolean;
  error: string | null;
}

class ZkLoginRealService {
  private state: ZkLoginState = {
    user: null,
    isLoading: false,
    error: null,
  };
  private listeners: Set<(state: ZkLoginState) => void> = new Set();

  constructor() {
    this.loadUser();
  }

  // 상태 업데이트 및 리스너 호출
  private updateState(newState: Partial<ZkLoginState>) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach(listener => listener(this.state));
  }

  // 사용자 정보 로드
  private loadUser() {
    try {
      const savedUser = localStorage.getItem('zklogin_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        // Ephemeral 키페어는 직렬화되지 않으므로 다시 생성
        user.ephemeralKeyPair = new Ed25519Keypair(); 
        this.state.user = user;
      }
    } catch (e) {
      console.error('Failed to load zkLogin user from localStorage', e);
      this.clearUser();
    }
  }

  // 사용자 정보 저장
  private saveUser(user: ZkLoginUser) {
    localStorage.setItem('zklogin_user', JSON.stringify({
      address: user.address,
      email: user.email,
      name: user.name,
      picture: user.picture,
      provider: user.provider,
      jwt: user.jwt,
      // ephemeralKeyPair는 저장하지 않음 (보안 및 복원 문제)
      maxEpoch: user.maxEpoch,
      randomness: user.randomness,
      nonce: user.nonce,
    }));
  }

  // 사용자 정보 삭제
  private clearUser() {
    localStorage.removeItem('zklogin_user');
  }

  // Google OAuth URL 생성
  getGoogleAuthUrl(): string {
    try {
      const nonce = generateNonce();
      const randomness = generateRandomness();
      
      // nonce와 randomness를 임시 저장
      sessionStorage.setItem('zklogin_nonce', nonce);
      sessionStorage.setItem('zklogin_randomness', randomness);

      const params = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URL,
        response_type: 'id_token',
        scope: 'openid email profile',
        nonce: nonce,
      });

      return `${OPENID_PROVIDER}?${params.toString()}`;
    } catch (error) {
      console.error('Google OAuth URL 생성 실패:', error);
      throw error;
    }
  }

  // OAuth 콜백 처리
  async handleOAuthCallback(): Promise<ZkLoginUser | null> {
    this.updateState({ isLoading: true, error: null });

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const idToken = urlParams.get('id_token');
      const error = urlParams.get('error');

      if (error) {
        throw new Error(`OAuth 오류: ${error}`);
      }

      if (!idToken) {
        throw new Error('ID 토큰을 받지 못했습니다.');
      }

      // 저장된 nonce와 randomness 가져오기
      const nonce = sessionStorage.getItem('zklogin_nonce');
      const randomness = sessionStorage.getItem('zklogin_randomness');

      if (!nonce || !randomness) {
        throw new Error('인증 세션이 만료되었습니다.');
      }

      // JWT에서 사용자 정보 추출
      const userInfo = this.parseJWT(idToken);
      
      // zkLogin 주소 생성
      const address = jwtToAddress(idToken, '0');

      // Ephemeral 키페어 생성
      const ephemeralKeyPair = new Ed25519Keypair();

      // zkLogin 사용자 정보 구성
      const user: ZkLoginUser = {
        address,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        provider: 'google',
        jwt: idToken,
        ephemeralKeyPair,
        maxEpoch: userInfo.exp || 0,
        randomness,
        nonce,
      };

      // 사용자 정보 저장
      this.saveUser(user);
      this.updateState({ user, isLoading: false });

      // URL에서 OAuth 파라미터 제거
      window.history.replaceState({}, document.title, window.location.pathname);

      toast.success('zkLogin으로 성공적으로 로그인되었습니다!');
      return user;

    } catch (error) {
      console.error('zkLogin 처리 실패:', error);
      this.updateState({ 
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        isLoading: false 
      });
      toast.error('zkLogin 로그인에 실패했습니다.');
      return null;
    }
  }

  // JWT 파싱
  private parseJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Failed to parse JWT', e);
      return {};
    }
  }

  // 로그아웃
  logout() {
    this.clearUser();
    sessionStorage.removeItem('zklogin_nonce');
    sessionStorage.removeItem('zklogin_randomness');
    this.updateState({ user: null, isLoading: false, error: null });
    toast.info('zkLogin에서 로그아웃되었습니다.');
  }

  // 트랜잭션 서명
  async signTransaction(transaction: Transaction): Promise<string> {
    if (!this.state.user) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      const { ephemeralKeyPair, jwt, maxEpoch, randomness, nonce } = this.state.user;

      const signature = await getZkLoginSignature({
        jwt,
        ephemeralKeyPair,
        maxEpoch,
        jwtRandomness: randomness,
        keyClaimName: 'sub',
        keyClaimValue: this.state.user.email,
      });

      // 트랜잭션에 서명 추가
      transaction.setSignature(signature);

      // 트랜잭션 실행
      const result = await suiClient.executeTransactionBlock({
        transactionBlock: transaction,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      return result.digest;
    } catch (error) {
      console.error('트랜잭션 서명 실패:', error);
      throw error;
    }
  }

  // 현재 사용자 정보 가져오기
  getCurrentUser(): ZkLoginUser | null {
    return this.state.user;
  }

  // React Hook
  useZkLogin() {
    const [currentState, setCurrentState] = React.useState(this.state);

    React.useEffect(() => {
      const listener = (newState: ZkLoginState) => setCurrentState(newState);
      this.listeners.add(listener);
      return () => {
        this.listeners.delete(listener);
      };
    }, []);

    return {
      user: currentState.user,
      isLoading: currentState.isLoading,
      error: currentState.error,
      login: () => {
        const authUrl = this.getGoogleAuthUrl();
        window.location.replace(authUrl);
      },
      logout: () => this.logout(),
      signTransaction: (tx: Transaction) => this.signTransaction(tx),
      isLoggedIn: () => !!currentState.user,
    };
  }
}

export const zkLoginRealService = new ZkLoginRealService();
