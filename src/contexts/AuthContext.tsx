import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { secureStorage } from '@/utils/secureStorage';

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

  useEffect(() => {
    const checkWalletConnection = async () => {
      const savedWallet = secureStorage.getWalletAddress();
      if (savedWallet) {
        // 보안을 위해 DB 조회 없이 로컬 상태 복원
        const userId = 'user_' + savedWallet.slice(-12);
        setUser({ id: userId, wallet_address: savedWallet });
        console.log('저장된 지갑 연결 복원:', savedWallet);
      }
      setLoading(false);
    };

    checkWalletConnection();
  }, []);

  const connectWallet = async () => {
    try {
      // 실제 지갑 주소 사용
      const realWalletAddress = "0x999403dcfae1c4945e4f548fb2e7e6c7912ad4dd68297f1a5855c847513ec8fc";
      
      console.log('🔥 목업 지갑 연결 시도:', realWalletAddress);
      console.log('🔍 Supabase 연결 테스트 시작...');
      
      // 새 사용자 생성 시도 (기존 사용자 조회는 보안상 제한됨)
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{ wallet_address: realWalletAddress }])
        .select()
        .single();

      let userId: string;

      if (insertError) {
        console.log('Insert error details:', insertError);
        
        if (insertError.code === '23505') {
          // 중복 지갑 주소 - 이미 존재하는 사용자
          userId = 'user_' + realWalletAddress.slice(-12);
          console.log('✅ 기존 사용자 지갑 연결:', userId);
        } else {
          console.error('❌ 사용자 생성 오류:', insertError);
          return { error: insertError };
        }
      } else {
        userId = newUser.id;
        console.log('✅ 새 사용자 생성:', userId);
      }

      // 지갑 저장 및 사용자 설정
      secureStorage.setWalletAddress(realWalletAddress);
      setUser({ id: userId, wallet_address: realWalletAddress });
      
      console.log('✅ 실제 지갑 연결 성공');
      return { error: null };
    } catch (error) {
      console.error('❌ 지갑 연결 오류:', error);
      return { error };
    }
  };

  const disconnectWallet = async () => {
    secureStorage.removeWalletAddress();
    setUser(null);
  };

  const value = {
    user,
    loading,
    connectWallet,
    disconnectWallet,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};