import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { SuiBalanceDisplay } from '@/components/SuiBalanceDisplay';
import { useSuiBalance } from '@/services/suiBalanceService';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { 
  Wallet, 
  Coins, 
  RefreshCw,
  Loader2,
  AlertCircle,
  Check,
  Copy,
  ExternalLink,
  TrendingUp,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

const SuiBalanceTest = () => {
  const { address } = useCurrentAccount();
  const { balance, isLoading, error, fetchBalance, fetchSuiBalance } = useSuiBalance();
  const [customAddress, setCustomAddress] = useState('');
  const [customBalance, setCustomBalance] = useState<any>(null);
  const [customLoading, setCustomLoading] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  const handleCustomAddressCheck = async () => {
    if (!customAddress.trim()) {
      toast.error('주소를 입력해주세요.');
      return;
    }

    setCustomLoading(true);
    setCustomError(null);

    try {
      const { suiBalanceService } = await import('@/services/suiBalanceService');
      const balanceData = await suiBalanceService.getAllBalances(customAddress);
      setCustomBalance(balanceData);
      toast.success('잔액을 성공적으로 가져왔습니다!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '잔액을 가져올 수 없습니다.';
      setCustomError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setCustomLoading(false);
    }
  };

  const handleCopyAddress = async (addressToCopy: string) => {
    try {
      await navigator.clipboard.writeText(addressToCopy);
      toast.success('주소가 복사되었습니다!');
    } catch (error) {
      console.error('복사 실패:', error);
      toast.error('주소 복사에 실패했습니다.');
    }
  };

  const openSuiExplorer = (address: string) => {
    window.open(`https://suiexplorer.com/address/${address}?network=testnet`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Wallet className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">SUI 잔액 API 테스트</h1>
            <Wallet className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-xl text-gray-300">
            SUI 지갑 잔액 조회 및 관리 기능 테스트
          </p>
          <div className="mt-4">
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Activity className="w-4 h-4 mr-2" />
              Sui Testnet 연동
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 현재 지갑 잔액 */}
          <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <Coins className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-semibold text-white">현재 지갑 잔액</h2>
            </div>

            {address ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="px-3 py-1">
                      <Check className="w-3 h-3 mr-1" />
                      연결됨
                    </Badge>
                    <Button
                      onClick={() => openSuiExplorer(address)}
                      variant="ghost"
                      size="sm"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={() => handleCopyAddress(address)}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <Label className="text-gray-300 text-sm">지갑 주소</Label>
                  <p className="text-white font-mono text-sm mt-1">
                    {address.substring(0, 10)}...{address.substring(address.length - 10)}
                  </p>
                </div>

                <SuiBalanceDisplay 
                  showRefreshButton={true}
                  showAllTokens={true}
                  className="bg-transparent border-none p-0"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-500/20 rounded-lg border border-gray-500/30">
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">지갑이 연결되지 않음</span>
                </div>

                <p className="text-gray-300 text-sm">
                  지갑을 연결하면 잔액 정보를 확인할 수 있습니다.
                </p>
              </div>
            )}
          </Card>

          {/* 커스텀 주소 잔액 조회 */}
          <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <RefreshCw className="w-6 h-6 text-green-400" />
              <h2 className="text-2xl font-semibold text-white">커스텀 주소 조회</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-white text-sm">SUI 주소 입력</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={customAddress}
                    onChange={(e) => setCustomAddress(e.target.value)}
                    placeholder="0x..."
                    className="bg-gray-800/50 border-gray-600 text-white"
                  />
                  <Button
                    onClick={handleCustomAddressCheck}
                    disabled={customLoading || !customAddress.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {customLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {customLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-green-400" />
                  <span className="ml-2 text-white">잔액 조회 중...</span>
                </div>
              )}

              {customError && (
                <div className="flex items-center gap-3 p-4 bg-destructive/20 rounded-lg border border-destructive/30">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  <span className="text-destructive">{customError}</span>
                </div>
              )}

              {customBalance && !customLoading && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="px-3 py-1">
                        <Check className="w-3 h-3 mr-1" />
                        조회 완료
                      </Badge>
                      <Button
                        onClick={() => openSuiExplorer(customAddress)}
                        variant="ghost"
                        size="sm"
                        className="text-green-400 hover:text-green-300"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      onClick={() => handleCopyAddress(customAddress)}
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="p-3 bg-gray-800/50 rounded-lg">
                    <Label className="text-gray-300 text-sm">조회된 주소</Label>
                    <p className="text-white font-mono text-sm mt-1">
                      {customAddress.substring(0, 10)}...{customAddress.substring(customAddress.length - 10)}
                    </p>
                  </div>

                  {/* SUI 잔액 */}
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-primary" />
                        <span className="font-medium">SUI</span>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{customBalance.sui.formatted}</p>
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
                      <span className="font-medium">{customBalance.totalValue} SUI</span>
                    </div>
                  </div>

                  {/* 다른 토큰들 */}
                  {customBalance.tokens.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">다른 토큰들</h4>
                      <div className="space-y-2">
                        {customBalance.tokens.map((token: any, index: number) => (
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
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* API 기능 설명 */}
        <Card className="mt-6 p-6 bg-white/10 backdrop-blur-sm border-white/20">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-semibold text-white">SUI 잔액 API 기능</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-3">구현된 기능</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  SUI 토큰 잔액 조회
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  모든 토큰 잔액 조회
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  코인 메타데이터 조회
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  특정 코인 타입 잔액 조회
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  코인 객체 조회
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  가스 비용 추정
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-white mb-3">API 엔드포인트</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  getSuiBalance(address)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  getAllBalances(address)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  getCoinMetadata(coinType)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  getCoinBalance(address, coinType)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  getCoinObjects(address, coinType)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  estimateGasCost(transaction)
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
            <p className="text-blue-100 text-sm">
              이 API는 Sui Testnet과 연동되어 실제 블록체인 데이터를 조회합니다.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SuiBalanceTest;
