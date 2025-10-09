import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useWallet } from '@/hooks/useWallet';
import { Wallet, LogOut, Copy, Check, User, ChevronDown } from 'lucide-react';
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
  const { isConnected, walletAddress, connectWallet, disconnectWallet } = useWallet();
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
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
    </div>
  );
};