import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useCrossChainTransfer, SupportedChain, TransferInfo } from '@/services/crossChainService';
import { useSuiBalance } from '@/services/suiBalanceServiceNew';
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
  Info
} from 'lucide-react';

interface CrossChainTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPhotoCard?: any;
}

const CrossChainTransferModal: React.FC<CrossChainTransferModalProps> = ({
  isOpen,
  onClose,
  selectedPhotoCard,
}) => {
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

  const supportedChains = getSupportedChains();
  const currentSuiBalance = suiBalance ? Number(suiBalance) / 1e9 : 0;

  useEffect(() => {
    if (isOpen && walletAddress) {
      fetchBalance(walletAddress);
    }
  }, [isOpen, walletAddress, fetchBalance]);

  useEffect(() => {
    if (transferInfo.amount && transferInfo.sourceChain && transferInfo.targetChain) {
      estimateGasCost();
    }
  }, [transferInfo.amount, transferInfo.sourceChain, transferInfo.targetChain]);

  const estimateGasCost = async () => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <ArrowRightLeft className="w-6 h-6" />
            크로스 체인 전송
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 연결 상태 */}
          <Card className="glass-dark border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="font-medium">지갑 연결 상태</span>
                </div>
                <Badge variant={isConnected ? 'default' : 'destructive'}>
                  {isConnected ? '연결됨' : '연결 필요'}
                </Badge>
              </div>
              {isConnected && walletAddress && (
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 6)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyAddress(walletAddress)}
                    className="h-auto p-1"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SUI 잔액 */}
          <Card className="glass-dark border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Coins className="w-5 h-5" />
                SUI 잔액
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">
                {formatBalance(currentSuiBalance)} SUI
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                사용 가능한 잔액
              </p>
            </CardContent>
          </Card>

          {/* 전송 설정 */}
          <Card className="glass-dark border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ArrowRightLeft className="w-5 h-5" />
                전송 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {/* 가스 비용 추정 */}
          {gasEstimate && (
            <Card className="glass-dark border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="w-5 h-5" />
                  예상 비용
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">소스 체인 가스:</span>
                  <span className="text-sm font-medium">{gasEstimate.sourceGas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">타겟 체인 가스:</span>
                  <span className="text-sm font-medium">{gasEstimate.targetGas}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-medium">총 예상 비용:</span>
                  <span className="font-bold text-yellow-500">{gasEstimate.totalCost}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 주의사항 */}
          <Card className="glass-dark border-yellow-500/20 border">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-yellow-500">중요한 주의사항</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• 크로스 체인 전송은 되돌릴 수 없습니다</li>
                    <li>• 수신자 주소를 정확히 확인해주세요</li>
                    <li>• 전송 완료까지 2-10분 정도 소요될 수 있습니다</li>
                    <li>• 네트워크 상황에 따라 시간이 더 걸릴 수 있습니다</li>
                  </ul>
                </div>
              </div>
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

          {/* 액션 버튼 */}
          <div className="flex gap-3">
            <Button
              onClick={handleTransfer}
              disabled={!isConnected || isTransferring || !transferInfo.amount || !transferInfo.recipient}
              className="flex-1 btn-modern text-lg py-6"
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
            <Button
              onClick={onClose}
              variant="outline"
              className="btn-secondary"
            >
              취소
            </Button>
          </div>

          {!isConnected && (
            <p className="text-center text-sm text-destructive">
              지갑을 연결해야 크로스 체인 전송을 사용할 수 있습니다.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CrossChainTransferModal;
