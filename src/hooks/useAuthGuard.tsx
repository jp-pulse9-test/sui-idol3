import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useAuthGuard = (redirectTo: string = '/auth') => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      toast.error('이 페이지에 접근하려면 로그인이 필요합니다.');
      navigate(redirectTo);
    }
  }, [user, loading, navigate, redirectTo]);

  return { user, loading, isAuthenticated: !!user };
};