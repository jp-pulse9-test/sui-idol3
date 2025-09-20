import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useZkLoginOfficial } from '@/services/zkLoginServiceOfficial';
import { 
  LogIn, 
  LogOut, 
  User, 
  Copy, 
  Check, 
  Loader2,
  AlertCircle,
  Shield
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ZkLoginButtonOfficialProps {
  className?: string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'premium';
  showUserInfo?: boolean;
}

export const ZkLoginButtonOfficial: React.FC<ZkLoginButtonOfficialProps> = ({
  className = '',
  size = 'default',
  variant = 'default',
  showUserInfo = true
}) => {
  const { user, isLoading, error, login, logout, getAddress } = useZkLoginOfficial();
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    const address = getAddress();
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        toast.success('주소가 복사되었습니다!');
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('복사 실패:', error);
        toast.error('주소 복사에 실패했습니다.');
      }
    }
  };

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('공식 zkLogin 시작 실패:', error);
      toast.error('로그인을 시작할 수 없습니다. Google OAuth 설정을 확인해주세요.');
    }
  };

  const handleLogout = () => {
    logout();
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <Button
        variant={variant}
        size={size}
        className={`${className} flex items-center gap-2`}
        disabled
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        로그인 중...
      </Button>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          variant="destructive"
          size={size}
          onClick={handleLogin}
          className="flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4" />
          다시 시도
        </Button>
        <span className="text-sm text-destructive">{error}</span>
      </div>
    );
  }

  // 로그인된 상태
  if (user) {
    if (showUserInfo) {
      return (
        <div className={`flex items-center gap-2 ${className}`}>
          <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm p-3 rounded-lg border border-border">
            <Badge variant="secondary" className="px-3 py-1 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              공식 zkLogin
            </Badge>
            
            <div className="flex items-center gap-2">
              {user.picture && (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground font-mono">
                {user.address.substring(0, 6)}...{user.address.substring(user.address.length - 6)}
              </span>
              <Button
                onClick={handleCopyAddress}
                variant="ghost"
                size="sm"
                className="h-auto p-1 hover:bg-muted/50"
                title="주소 복사"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>

            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="h-auto p-1 hover:bg-destructive/10 hover:text-destructive"
              title="로그아웃"
            >
              <LogOut className="w-3 h-3" />
            </Button>
          </div>
        </div>
      );
    } else {
      return (
        <Button
          onClick={handleLogout}
          variant={variant}
          size={size}
          className={`${className} flex items-center gap-2`}
        >
          <LogOut className="w-4 h-4" />
          로그아웃
        </Button>
      );
    }
  }

  // 로그인되지 않은 상태
  return (
    <Button
      onClick={handleLogin}
      variant={variant}
      size={size}
      className={`${className} flex items-center gap-2`}
    >
      <LogIn className="w-4 h-4" />
      공식 Google로 로그인
    </Button>
  );
};

// 간단한 버전 (사용자 정보 없이)
export const SimpleZkLoginButtonOfficial: React.FC<Omit<ZkLoginButtonOfficialProps, 'showUserInfo'>> = (props) => {
  return <ZkLoginButtonOfficial {...props} showUserInfo={false} />;
};

// 사용자 정보만 표시하는 컴포넌트
export const ZkLoginUserInfoOfficial: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { user, getAddress } = useZkLoginOfficial();
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  const handleCopyAddress = async () => {
    const address = getAddress();
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        toast.success('주소가 복사되었습니다!');
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('복사 실패:', error);
        toast.error('주소 복사에 실패했습니다.');
      }
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {user.picture && (
        <img
          src={user.picture}
          alt={user.name}
          className="w-8 h-8 rounded-full border-2 border-primary/20"
        />
      )}
      <div className="flex flex-col">
        <span className="text-sm font-medium">{user.name}</span>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground font-mono">
            {user.address.substring(0, 8)}...{user.address.substring(user.address.length - 8)}
          </span>
          <Button
            onClick={handleCopyAddress}
            variant="ghost"
            size="sm"
            className="h-auto p-1 hover:bg-muted/50"
            title="주소 복사"
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
