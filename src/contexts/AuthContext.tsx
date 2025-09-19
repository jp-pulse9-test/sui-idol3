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
        try {
          // Check if user exists in database
          const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('wallet_address', savedWallet)
            .maybeSingle();

          if (existingUser) {
            setUser({ id: existingUser.id, wallet_address: existingUser.wallet_address });
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
      setLoading(false);
    };

    checkWalletConnection();
  }, []);

  const connectWallet = async () => {
    try {
      // 실제 지갑 주소 사용
      const realWalletAddress = "0x999403dcfae1c4945e4f548fb2e7e6c7912ad4dd68297f1a5855c847513ec8fc";
      
      console.log('실제 지갑 연결 시도:', realWalletAddress);
      
      // 사용자 생성 또는 조회
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', realWalletAddress)
        .maybeSingle();

      let userId: string;

      if (existingUser) {
        userId = existingUser.id;
        console.log('기존 사용자 발견:', userId);
      } else {
        // 새 사용자 생성
        const { data: newUser, error } = await supabase
          .from('users')
          .insert([{ wallet_address: realWalletAddress }])
          .select()
          .single();

        if (error) {
          console.error('사용자 생성 오류:', error);
          return { error };
        }
        userId = newUser.id;
        console.log('새 사용자 생성:', userId);
      }

      // 지갑 저장 및 사용자 설정
      secureStorage.setWalletAddress(realWalletAddress);
      setUser({ id: userId, wallet_address: realWalletAddress });
      
      console.log('실제 지갑 연결 성공');
      return { error: null };
    } catch (error) {
      console.error('지갑 연결 오류:', error);
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