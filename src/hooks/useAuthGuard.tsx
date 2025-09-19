import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useAuthGuard = (redirectTo: string = '/auth', requireAuth: boolean = true) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (requireAuth && !loading && !user) {
      toast.error('이 페이지에 접근하려면 Sui 지갑 연결이 필요합니다.');
      navigate(redirectTo);
    }
  }, [user, loading, navigate, redirectTo, requireAuth]);

  return { user, loading, isAuthenticated: !!user };
};