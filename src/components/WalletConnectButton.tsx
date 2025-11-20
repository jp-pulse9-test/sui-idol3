import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useWallet } from '@/hooks/useWallet';
import { Wallet, LogOut, Copy, Check, User, ChevronDown, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

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
  const { isConnected, walletAddress, connectWallet, disconnectWallet, wallets } = useWallet();
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const navigate = useNavigate();

  const handleCopyAddress = async () => {
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress);
        setCopied(true);
        toast.success('Wallet address copied!');
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Copy failed:', error);
        toast.error('Failed to copy address.');
      }
    }
  };

  const handleConnect = async () => {
    if (!wallets || wallets.length === 0) {
      toast.error('지원되는 Sui 지갑을 찾을 수 없습니다.');
      setIsGuideOpen(true);
      return;
    }

    const result = await connectWallet();
    if (!result.success) {
      console.error('Wallet connection failed:', result.error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
    } catch (error) {
      console.error('Wallet disconnection error:', error);
    }
  };

  if (!isConnected) {
    return (
      <Button
        onClick={handleConnect}
        variant={variant}
        size="icon"
        className={`${className} transition-all duration-300 ${isHovered ? 'w-auto px-4 gap-2' : 'w-10'} overflow-hidden`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Wallet className="w-4 h-4 flex-shrink-0" />
        {isHovered && <span className="whitespace-nowrap">Connect</span>}
      </Button>
    );
  }

  return (
    <div className={`${className} flex items-center gap-2`}>
      <div className="flex items-center gap-2 bg-card backdrop-blur-sm px-3 py-2 rounded-lg border border-border">
        <Badge variant="secondary" className="px-2 py-0.5 text-xs">
          🟢
        </Badge>
        <span className="text-xs text-muted-foreground font-mono">
          {walletAddress?.substring(0, 6)}...{walletAddress?.substring(38)}
        </span>
        <Button
          onClick={handleCopyAddress}
          variant="ghost"
          size="icon"
          className="h-6 w-6 p-0"
          title="Copy Address"
        >
          {copied ? (
            <Check className="w-3 h-3 text-green-500" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0"
              title="Menu"
            >
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate('/my')}>
              <User className="w-4 h-4 mr-2" />
              Go to My
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyAddress}>
              <Copy className="w-4 h-4 mr-2" />
              Copy Address
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDisconnect} className="text-destructive focus:text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <Button
        onClick={handleDisconnect}
        variant="outline"
        size="sm"
        className="gap-2"
        title="Disconnect Wallet"
      >
        <LogOut className="w-4 h-4" />
        <span>연결 해제</span>
      </Button>

      <WalletGuideDialog open={isGuideOpen} onOpenChange={setIsGuideOpen} />
    </div>
  );
};

interface WalletGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WalletGuideDialog: React.FC<WalletGuideDialogProps> = ({ open, onOpenChange }) => {
  const walletLinks = [
    { name: 'Sui Wallet', url: 'https://chromewebstore.google.com/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil' },
    { name: 'Suiet Wallet', url: 'https://suiet.app/' },
    { name: 'Ethos Wallet', url: 'https://ethoswallet.xyz/' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-orbitron">Sui 지갑 연결 가이드</DialogTitle>
          <DialogDescription className="space-y-4 pt-4">
            <p className="text-sm">
              SIMKUNG은 Sui 네트워크 기반으로 동작합니다.
              다음 중 하나의 Sui 지갑을 설치하고, 이 페이지를 새로고침 후 다시 시도해주세요.
            </p>

            <div className="space-y-2">
              <p className="text-sm font-semibold">추천 지갑:</p>
              {walletLinks.map((wallet) => (
                <a
                  key={wallet.name}
                  href={wallet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  <span className="text-sm font-medium">{wallet.name}</span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </a>
              ))}
            </div>

            <div className="space-y-2 pt-2">
              <p className="text-sm font-semibold">설치 단계:</p>
              <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                <li>크롬/엣지 브라우저에서 Sui 지갑 설치</li>
                <li>지갑 확장 프로그램을 열고 계정 생성 또는 복구</li>
                <li>이 사이트 접근 권한 허용</li>
                <li>페이지 새로고침 후 우측 상단의 Wallet 버튼 다시 클릭</li>
              </ol>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                className="flex-1"
              >
                지갑 설치 완료했어요
              </Button>
              <Button
                onClick={() => window.open('https://sui.io/wallets', '_blank')}
                className="flex-1 gap-2"
              >
                지갑 다운로드
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};