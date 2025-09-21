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
        size={size}
        className={`${className} flex items-center gap-2`}
      >
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-2 bg-card backdrop-blur-sm p-3 rounded-lg border border-border bg-opacity-80">
        <Badge variant="secondary" className="px-3 py-1">
          🟢 Connected
        </Badge>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground font-mono">
            {walletAddress?.substring(0, 6)}...{walletAddress?.substring(38)}
          </span>
          <Button
            onClick={handleCopyAddress}
            variant="ghost"
            size="sm"
            className="h-auto p-1 hover:bg-muted hover:bg-opacity-50"
            title="Copy Address"
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 hover:bg-muted hover:bg-opacity-50"
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
    </div>
  );
};