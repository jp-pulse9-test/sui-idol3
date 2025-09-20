import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSuiBalance } from '@/services/suiBalanceServiceNew';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { 
  Wallet, 
  RefreshCw, 
  Coins, 
  Loader2,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface SuiBalanceCardProps {
  className?: string;
  compact?: boolean;
  showRefreshButton?: boolean;
  showAllTokens?: boolean;
}

export const SuiBalanceCard: React.FC<SuiBalanceCardProps> = ({
  className = '',
  compact = false,
  showRefreshButton = true,
  showAllTokens = false,
}) => {
  const { balance, allBalances, isLoading, error, fetchBalance } = useSuiBalance();
  const { address } = useCurrentAccount();
  const [copied, setCopied] = useState(false);

  const handleRefresh = () => {
    if (address) {
      fetchBalance(address);
      toast.info('SUI 잔액을 새로고침했습니다.');
    }
  };

  const handleCopyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        toast.success('지갑 주소가 복사되었습니다!');
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('복사 실패:', err);
        toast.error('주소 복사에 실패했습니다.');
      }
    }
  };

  const formatBalance = (bal: bigint, decimals: number = 9) => {
    const balanceStr = bal.toString();
    if (balanceStr.length <= decimals) {
      return `0.${balanceStr.padStart(decimals, '0')}`;
    }
    const integerPart = balanceStr.slice(0, -decimals);
    const decimalPart = balanceStr.slice(-decimals).replace(/0+$/, '');
    return `${integerPart}${decimalPart ? `.${decimalPart}` : ''}`;
  };

  if (!address) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            SUI 지갑 잔액
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">지갑을 연결하여 잔액을 확인하세요.</p>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant="secondary" className="px-3 py-1 flex items-center gap-1">
          <Coins className="w-3 h-3" />
          SUI: {balance !== null ? formatBalance(balance, 9) : 'N/A'}
        </Badge>
        {showRefreshButton && (
          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="sm"
            className="h-auto p-1 hover:bg-muted/50"
            title="새로고침"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          SUI 지갑 잔액
        </CardTitle>
        <div className="flex items-center gap-2">
          {showRefreshButton && (
            <Button onClick={handleRefresh} variant="ghost" size="sm" title="새로고침">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          )}
          <Button onClick={handleCopyAddress} variant="ghost" size="sm" title="주소 복사">
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold flex items-center gap-2">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              로딩 중...
            </>
          ) : error ? (
            <>
              <AlertCircle className="w-4 h-4 text-red-500" />
              오류
            </>
          ) : balance !== null ? (
            <>
              {formatBalance(balance, 9)} SUI
            </>
          ) : (
            'N/A'
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          주소: {address.substring(0, 6)}...{address.substring(address.length - 6)}
        </p>

        {showAllTokens && allBalances && allBalances.length > 1 && (
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-semibold">다른 토큰 잔액:</h3>
            {allBalances
              .filter(bal => bal.coinType !== '0x2::sui::SUI')
              .slice(0, 5) // 최대 5개만 표시
              .map(bal => (
                <div key={bal.coinType} className="flex items-center justify-between text-sm">
                  <span className="truncate">{bal.coinType.split('::').pop() || 'UNKNOWN'}</span>
                  <span>{formatBalance(bal.totalBalance, 0)}</span>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
