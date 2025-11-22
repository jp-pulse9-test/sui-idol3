import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useAuthGuard = (redirectTo: string = '/auth', requireWallet: boolean = false) => {
  const { user, loading, isGuest } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (requireWallet && !loading && !user) {
      toast.error('이 페이지에 접근하려면 Sui 지갑 연결이 필요합니다.');
      navigate(redirectTo);
    }
  }, [user, loading, navigate, redirectTo, requireWallet]);

  // Provide basic user info even in guest mode for compatibility
  const guestUser = isGuest ? { id: 'guest', wallet_address: '' } : null;
  
  return { 
    user: user || guestUser, 
    loading, 
    isAuthenticated: !!user, 
    isGuest 
  };
};