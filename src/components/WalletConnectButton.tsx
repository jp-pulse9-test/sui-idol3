import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/hooks/useWallet';
import { Wallet, LogOut, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface WalletConnectButtonProps {
  className?: string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'premium';
}

export const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({
  className = '',
  size = 'default',
  variant = 'default'
}) => {
  const { isConnected, walletAddress, connectWallet, disconnectWallet } = useWallet();
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress);
        setCopied(true);
        toast.success('지갑 주소가 복사되었습니다!');
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('복사 실패:', error);
        toast.error('주소 복사에 실패했습니다.');
      }
    }
  };

  const handleConnect = async () => {
    const result = await connectWallet();
    if (!result.success) {
      console.error('지갑 연결 실패:', result.error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
    } catch (error) {
      console.error('지갑 연결 해제 오류:', error);
    }
  };

  if (!isConnected) {
    return (
      <Button
        onClick={handleConnect}
        variant={variant}
        size={size}
        className={`${className} flex items-center gap-2`}
      >
        <Wallet className="w-4 h-4" />
        지갑 연결
      </Button>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm p-3 rounded-lg border border-border group">
        <Badge variant="secondary" className="px-3 py-1">
          🟢 연결됨
        </Badge>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground font-mono">
            {walletAddress?.substring(0, 6)}...{walletAddress?.substring(38)}
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
        
        {/* 드롭다운 메뉴 */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1 hover:bg-muted/50 group"
            title="메뉴"
          >
            <LogOut className="w-3 h-3" />
          </Button>
          
          {/* 호버 시 드롭다운 */}
          <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-50">
            <div className="p-1">
              <button
                onClick={() => window.location.href = '/my'}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md flex items-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                My로 이동
              </button>
              <button
                onClick={handleCopyAddress}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                주소 복사
              </button>
              <div className="border-t border-border my-1"></div>
              <button
                onClick={handleDisconnect}
                className="w-full text-left px-3 py-2 text-sm hover:bg-destructive/10 text-destructive rounded-md flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                연결 해제
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
