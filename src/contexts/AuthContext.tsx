import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { secureStorage } from '@/utils/secureStorage';
import { useWallet } from '@/hooks/useWallet';

interface AuthContextType {
  user: { id: string; wallet_address: string } | null;
  loading: boolean;
  connectWallet: () => Promise<{ error: any }>;
  disconnectWallet: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; wallet_address: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletError, setWalletError] = useState<string | null>(null);
  
  // 지갑 상태를 안전하게 가져오기
  const walletHook = useWallet();
  const { isConnected, walletAddress, connectWallet: dappKitConnect, disconnectWallet: dappKitDisconnect } = walletHook;

  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        console.log('AuthProvider 초기화 중...');
        const savedWallet = secureStorage.getWalletAddress();
        if (savedWallet) {
          // 보안을 위해 DB 조회 없이 로컬 상태 복원
          const userId = 'user_' + savedWallet.slice(-12);
          setUser({ id: userId, wallet_address: savedWallet });
          console.log('저장된 지갑 연결 복원:', savedWallet);
        }
      } catch (error) {
        console.error('지갑 연결 확인 중 오류:', error);
        setWalletError(error instanceof Error ? error.message : '알 수 없는 오류');
      } finally {
        setLoading(false);
      }
    };

    checkWalletConnection();
  }, []);

  // dapp-kit 지갑 연결 상태 동기화
  useEffect(() => {
    try {
      if (isConnected && walletAddress) {
        const userId = 'user_' + walletAddress.slice(-12);
        setUser({ id: userId, wallet_address: walletAddress });
        secureStorage.setWalletAddress(walletAddress);
        console.log('dapp-kit 지갑 연결됨:', walletAddress);
        setWalletError(null);
      } else if (isConnected === false) {  // 명시적으로 false인 경우만
        setUser(null);
        secureStorage.removeWalletAddress();
        console.log('dapp-kit 지갑 연결 해제됨');
      }
    } catch (error) {
      console.error('지갑 상태 동기화 오류:', error);
      setWalletError(error instanceof Error ? error.message : '지갑 상태 동기화 오류');
    }
  }, [isConnected, walletAddress]);

  const connectWallet = async () => {
    try {
      console.log('🔥 dapp-kit 지갑 연결 시도...');
      
      if (!dappKitConnect) {
        throw new Error('지갑 연결 기능을 사용할 수 없습니다');
      }
      
      const result = await dappKitConnect();
      
      if (result.success && walletAddress) {
        console.log('✅ dapp-kit 지갑 연결 성공:', walletAddress);
        
        // Supabase에 사용자 정보 저장 시도
        try {
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([{ wallet_address: walletAddress }])
            .select()
            .single();

          if (insertError) {
            console.log('Insert error details:', insertError);
            
            // 중복 지갑 주소 또는 RLS 정책 위반 - 이미 존재하는 사용자로 처리
            if (insertError.code === '23505' || insertError.code === '42501') {
              console.log('✅ 기존 사용자 지갑 연결');
            } else {
              console.error('❌ 사용자 생성 오류:', insertError);
            }
          } else {
            console.log('✅ 새 사용자 생성:', newUser.id);
          }
        } catch (dbError) {
          console.error('❌ DB 저장 오류:', dbError);
          // DB 오류는 무시하고 지갑 연결은 유지
        }
        
        return { error: null };
      } else {
        return { error: result.error || '지갑 연결 실패' };
      }
    } catch (error) {
      console.error('❌ 지갑 연결 오류:', error);
      return { error };
    }
  };

  const disconnectWallet = async () => {
    try {
      if (dappKitDisconnect) {
        await dappKitDisconnect();
      }
      secureStorage.removeWalletAddress();
      setUser(null);
      console.log('✅ 지갑 연결 해제 완료');
    } catch (error) {
      console.error('❌ 지갑 연결 해제 오류:', error);
    }
  };

  const value = {
    user,
    loading,
    connectWallet,
    disconnectWallet,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};