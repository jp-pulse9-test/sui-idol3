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
      // Simulate Sui wallet connection (in real implementation, use Sui wallet adapter)
      const mockWalletAddress = "0x" + Math.random().toString(16).substring(2, 42);
      
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', mockWalletAddress)
        .maybeSingle();

      let userId: string;

      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Create new user
        const { data: newUser, error } = await supabase
          .from('users')
          .insert([{ wallet_address: mockWalletAddress }])
          .select()
          .single();

        if (error) {
          return { error };
        }
        userId = newUser.id;
      }

      // Save wallet and set user
      secureStorage.setWalletAddress(mockWalletAddress);
      setUser({ id: userId, wallet_address: mockWalletAddress });
      
      return { error: null };
    } catch (error) {
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