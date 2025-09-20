import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSuiBalance } from '@/services/suiBalanceService';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { 
  Wallet, 
  RefreshCw, 
  Coins, 
  TrendingUp,
  Loader2,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface SuiBalanceDisplayProps {
  className?: string;
  showRefreshButton?: boolean;
  showAllTokens?: boolean;
  compact?: boolean;
  showNetworkInfo?: boolean;
  showGasEstimate?: boolean;
}

export const SuiBalanceDisplay: React.FC<SuiBalanceDisplayProps> = ({
  className = '',
  showRefreshButton = true,
  showAllTokens = true,
  compact = false,
  showNetworkInfo = false,
  showGasEstimate = false,
}) => {
  const { balance, isLoading, error, fetchBalance, fetchSuiBalance, clearBalance } = useSuiBalance();
  const { address } = useCurrentAccount();
  const [copied, setCopied] = useState(false);

  // 지갑 주소가 변경될 때마다 잔액 새로고침
  useEffect(() => {
    if (address) {
      fetchBalance(address);
    } else {
      clearBalance();
    }
  }, [address]);

  const handleRefresh = () => {
    if (address) {
      fetchBalance(address);
    }
  };

  const handleCopyAddress = async () => {
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

  if (!address) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center gap-3 text-muted-foreground">
          <Wallet className="w-5 h-5" />
          <span>지갑을 연결해주세요</span>
        </div>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : balance ? (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Coins className="w-3 h-3" />
            {balance.sui.formatted} SUI
          </Badge>
        ) : (
          <Badge variant="outline" className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            잔액 없음
          </Badge>
        )}
        {showRefreshButton && (
          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="sm"
            className="h-auto p-1"
            disabled={isLoading}
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-semibold">지갑 잔액</h3>
          </div>
          {showRefreshButton && (
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
          )}
        </div>

        {/* 주소 */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">지갑 주소</span>
            <Button
              onClick={handleCopyAddress}
              variant="ghost"
              size="sm"
              className="h-auto p-1"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-sm font-mono mt-1">
            {address.substring(0, 10)}...{address.substring(address.length - 10)}
          </p>
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2">잔액을 불러오는 중...</span>
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <span className="text-destructive">{error}</span>
          </div>
        )}

        {/* 잔액 정보 */}
        {balance && !isLoading && (
          <div className="space-y-4">
            {/* SUI 잔액 */}
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-primary" />
                  <span className="font-medium">SUI</span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{balance.sui.formatted}</p>
                  <p className="text-sm text-muted-foreground">SUI</p>
                </div>
              </div>
            </div>

            {/* 총 가치 */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">총 가치</span>
                </div>
                <span className="font-medium">{balance.totalValue} SUI</span>
              </div>
            </div>

            {/* 다른 토큰들 */}
            {showAllTokens && balance.tokens.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">다른 토큰들</h4>
                <div className="space-y-2">
                  {balance.tokens.map((token, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                          <Coins className="w-3 h-3" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{token.symbol || 'UNKNOWN'}</p>
                          <p className="text-xs text-muted-foreground">
                            {token.name || 'Unknown Token'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{token.formatted}</p>
                        <p className="text-xs text-muted-foreground">
                          {token.coinType.substring(0, 10)}...
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 토큰이 없는 경우 */}
            {showAllTokens && balance.tokens.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <Coins className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">다른 토큰이 없습니다</p>
              </div>
            )}
          </div>
        )}

        {/* 잔액이 없는 경우 */}
        {!balance && !isLoading && !error && (
          <div className="text-center py-8 text-muted-foreground">
            <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>잔액 정보를 불러오지 못했습니다</p>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="mt-4"
            >
              다시 시도
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

// 간단한 버전 (컴팩트)
export const SuiBalanceCompact: React.FC<Omit<SuiBalanceDisplayProps, 'compact'>> = (props) => {
  return <SuiBalanceDisplay {...props} compact={true} />;
};

// SUI 잔액만 표시하는 버전
export const SuiBalanceOnly: React.FC<Omit<SuiBalanceDisplayProps, 'showAllTokens'>> = (props) => {
  return <SuiBalanceDisplay {...props} showAllTokens={false} />;
};
