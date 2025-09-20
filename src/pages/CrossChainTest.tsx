import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useCrossChainTransfer, SupportedChain, TransferInfo } from '@/services/crossChainService';
import { useSuiBalance } from '@/services/suiBalanceServiceNew';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { SuiBalanceCard } from '@/components/SuiBalanceCard';
import { 
  ArrowRightLeft, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Coins,
  ExternalLink,
  Copy,
  AlertTriangle,
  Info,
  Network
} from 'lucide-react';

const CrossChainTest: React.FC = () => {
  const {
    transferToken,
    transferSuiToken,
    estimateGas,
    getSupportedChains,
    getChainInfo,
    isConnected,
    walletAddress,
  } = useCrossChainTransfer();

  const { balance: suiBalance, fetchBalance } = useSuiBalance();
  const currentAccount = useCurrentAccount();

  const [transferInfo, setTransferInfo] = useState<TransferInfo>({
    sourceChain: 'SUI',
    targetChain: 'ETHEREUM',
    tokenAddress: '0x2::sui::SUI',
    amount: '',
    recipient: '',
  });

  const [isTransferring, setIsTransferring] = useState(false);
  const [gasEstimate, setGasEstimate] = useState<{
    sourceGas: string;
    targetGas: string;
    totalCost: string;
  } | null>(null);
  const [transferResult, setTransferResult] = useState<any>(null);
  const [testResults, setTestResults] = useState<any[]>([]);

  const supportedChains = getSupportedChains();
  const currentSuiBalance = suiBalance ? Number(suiBalance) / 1e9 : 0;

  const handleTransfer = async () => {
    if (!isConnected) {
      toast.error('지갑을 먼저 연결해주세요!');
      return;
    }

    if (!transferInfo.amount || !transferInfo.recipient) {
      toast.error('전송할 양과 수신자 주소를 입력해주세요.');
      return;
    }

    if (parseFloat(transferInfo.amount) > currentSuiBalance) {
      toast.error('SUI 잔액이 부족합니다.');
      return;
    }

    setIsTransferring(true);
    setTransferResult(null);

    try {
      const result = await transferSuiToken(
        transferInfo.amount,
        transferInfo.targetChain,
        transferInfo.recipient
      );

      setTransferResult(result);
      
      // 테스트 결과에 추가
      setTestResults(prev => [...prev, {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...result,
        transferInfo: { ...transferInfo }
      }]);
      
      if (result.success) {
        // 잔액 새로고침
        if (walletAddress) {
          await fetchBalance(walletAddress);
        }
      }
    } catch (error) {
      console.error('전송 실패:', error);
      setTransferResult({
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      });
    } finally {
      setIsTransferring(false);
    }
  };

  const estimateGasCost = async () => {
    if (!transferInfo.amount || !transferInfo.sourceChain || !transferInfo.targetChain) {
      return;
    }

    try {
      const estimate = await estimateGas(
        transferInfo.sourceChain,
        transferInfo.targetChain,
        transferInfo.amount
      );
      setGasEstimate(estimate);
    } catch (error) {
      console.error('가스 비용 추정 실패:', error);
    }
  };

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      toast.success('주소가 복사되었습니다!');
    } catch (err) {
      toast.error('주소 복사에 실패했습니다.');
    }
  };

  const getChainIcon = (chain: SupportedChain) => {
    const chainInfo = getChainInfo(chain);
    return (
      <div className="flex items-center gap-2">
        <img 
          src={chainInfo.iconUrl} 
          alt={chainInfo.name}
          className="w-5 h-5 rounded-full"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <span>{chainInfo.name}</span>
      </div>
    );
  };

  const formatBalance = (balance: number) => {
    return balance.toFixed(4);
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold gradient-text flex items-center justify-center gap-3">
          <Network className="w-8 h-8" /> 크로스 체인 전송 테스트
        </h1>
        <p className="text-xl text-muted-foreground">
          Wormhole NTT를 사용한 크로스 체인 전송 기능을 테스트합니다
        </p>
      </div>

      {/* 연결 상태 및 잔액 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SuiBalanceCard showAllTokens={true} showRefreshButton={true} />
        
        <Card className="glass-dark border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="w-5 h-5" /> 연결 상태
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">지갑 연결:</span>
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {isConnected ? '연결됨' : '연결 필요'}
              </Badge>
            </div>
            {isConnected && walletAddress && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">지갑 주소:</span>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 6)}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyAddress(walletAddress)}
                      className="h-auto p-1"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm">지원 체인:</span>
              <Badge variant="secondary">{supportedChains.length}개</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 전송 설정 */}
      <Card className="glass-dark border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5" /> 전송 설정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 소스 체인 */}
            <div className="space-y-2">
              <Label htmlFor="sourceChain">소스 체인</Label>
              <Select
                value={transferInfo.sourceChain}
                onValueChange={(value: SupportedChain) => 
                  setTransferInfo(prev => ({ ...prev, sourceChain: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {supportedChains.map((chain) => (
                    <SelectItem key={chain} value={chain}>
                      {getChainIcon(chain)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 타겟 체인 */}
            <div className="space-y-2">
              <Label htmlFor="targetChain">타겟 체인</Label>
              <Select
                value={transferInfo.targetChain}
                onValueChange={(value: SupportedChain) => 
                  setTransferInfo(prev => ({ ...prev, targetChain: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {supportedChains
                    .filter(chain => chain !== transferInfo.sourceChain)
                    .map((chain) => (
                      <SelectItem key={chain} value={chain}>
                        {getChainIcon(chain)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* 전송할 양 */}
            <div className="space-y-2">
              <Label htmlFor="amount">전송할 SUI 양</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  step="0.0001"
                  min="0"
                  max={currentSuiBalance}
                  value={transferInfo.amount}
                  onChange={(e) => setTransferInfo(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.0000"
                  className="pr-16"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  SUI
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>최대: {formatBalance(currentSuiBalance)} SUI</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTransferInfo(prev => ({ ...prev, amount: currentSuiBalance.toString() }))}
                  className="h-auto p-1 text-xs"
                >
                  최대 사용
                </Button>
              </div>
            </div>

            {/* 수신자 주소 */}
            <div className="space-y-2">
              <Label htmlFor="recipient">수신자 주소</Label>
              <Input
                id="recipient"
                value={transferInfo.recipient}
                onChange={(e) => setTransferInfo(prev => ({ ...prev, recipient: e.target.value }))}
                placeholder="0x..."
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {getChainInfo(transferInfo.targetChain).name} 네트워크 주소를 입력하세요
              </p>
            </div>
          </div>

          {/* 가스 비용 추정 버튼 */}
          <Button
            onClick={estimateGasCost}
            variant="outline"
            className="w-full"
            disabled={!transferInfo.amount || !transferInfo.sourceChain || !transferInfo.targetChain}
          >
            <Info className="w-4 h-4 mr-2" />
            가스 비용 추정
          </Button>

          {/* 가스 비용 표시 */}
          {gasEstimate && (
            <Card className="p-4 bg-card/50">
              <div className="space-y-2">
                <h4 className="font-medium">예상 비용:</h4>
                <div className="flex justify-between text-sm">
                  <span>소스 체인 가스:</span>
                  <span className="font-medium">{gasEstimate.sourceGas}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>타겟 체인 가스:</span>
                  <span className="font-medium">{gasEstimate.targetGas}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>총 예상 비용:</span>
                  <span className="text-yellow-500">{gasEstimate.totalCost}</span>
                </div>
              </div>
            </Card>
          )}

          {/* 전송 버튼 */}
          <Button
            onClick={handleTransfer}
            disabled={!isConnected || isTransferring || !transferInfo.amount || !transferInfo.recipient}
            className="w-full btn-modern text-lg py-6"
          >
            {isTransferring ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                전송 중...
              </>
            ) : (
              <>
                <ArrowRightLeft className="w-5 h-5 mr-2" />
                크로스 체인 전송 시작
              </>
            )}
          </Button>

          {!isConnected && (
            <p className="text-center text-sm text-destructive">
              지갑을 연결해야 크로스 체인 전송을 사용할 수 있습니다.
            </p>
          )}
        </CardContent>
      </Card>

      {/* 전송 결과 */}
      {transferResult && (
        <Card className={`glass-dark border-white/10 ${transferResult.success ? 'border-green-500/50' : 'border-red-500/50'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {transferResult.success ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${transferResult.success ? 'text-green-500' : 'text-red-500'}`}>
                  {transferResult.success ? '전송이 시작되었습니다!' : '전송 실패'}
                </p>
                {transferResult.success && (
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {transferResult.transactionHash && (
                      <div className="flex items-center gap-2">
                        <span>트랜잭션 해시:</span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {transferResult.transactionHash.substring(0, 10)}...
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyAddress(transferResult.transactionHash)}
                          className="h-auto p-1"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                    {transferResult.estimatedCompletionTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>예상 완료 시간: {transferResult.estimatedCompletionTime}</span>
                      </div>
                    )}
                  </div>
                )}
                {!transferResult.success && transferResult.error && (
                  <p className="text-sm text-red-400 mt-1">{transferResult.error}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 테스트 결과 히스토리 */}
      {testResults.length > 0 && (
        <Card className="glass-dark border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" /> 테스트 결과 히스토리
            </CardTitle>
            <Button onClick={clearTestResults} variant="outline" size="sm">
              초기화
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {result.transferInfo.amount} SUI → {getChainInfo(result.transferInfo.targetChain).name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(result.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={result.success ? 'default' : 'destructive'}>
                    {result.success ? '성공' : '실패'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 지원되는 체인 정보 */}
      <Card className="glass-dark border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-5 h-5" /> 지원되는 체인
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {supportedChains.map((chain) => {
              const chainInfo = getChainInfo(chain);
              return (
                <div key={chain} className="flex items-center gap-2 p-3 bg-card/50 rounded-lg">
                  <img 
                    src={chainInfo.iconUrl} 
                    alt={chainInfo.name}
                    className="w-5 h-5 rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium">{chainInfo.name}</p>
                    <p className="text-xs text-muted-foreground">{chainInfo.symbol}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 네비게이션 */}
      <div className="flex justify-center space-x-4 pt-8">
        <Button
          onClick={() => window.history.back()}
          variant="outline"
          size="lg"
          className="btn-secondary"
        >
          뒤로 가기
        </Button>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          size="lg"
          className="btn-secondary"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> 페이지 새로고침
        </Button>
      </div>
    </div>
  );
};

export default CrossChainTest;
