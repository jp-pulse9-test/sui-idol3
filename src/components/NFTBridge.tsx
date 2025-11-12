import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { SUPPORTED_CHAINS, SupportedChain } from '../types/crosschain';
import { evmProofService } from '../services/evmProofService';
import { nftBridgeService } from '../services/nftBridgeService';
import { Copy, Zap, ArrowRightLeft, Link2, AlertTriangle } from 'lucide-react';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';

interface NFTBridgeProps {
  isOpen: boolean;
  onClose: () => void;
  nftData: {
    objectId: string;
    id: string;
    idolName: string;
    imageUrl: string;
    rarity: string;
    concept: string;
    serialNo: number;
  };
}

export const NFTBridge: React.FC<NFTBridgeProps> = ({
  isOpen,
  onClose,
  nftData
}) => {
  const [selectedChain, setSelectedChain] = useState<SupportedChain | null>(null);
  const [connectedAddress, setConnectedAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isBridging, setIsBridging] = useState(false);
  const [gasFee, setGasFee] = useState<{ fee: string; currency: string } | null>(null);
  const { mutateAsync: signAndExecuteTransactionAsync } = useSignAndExecuteTransaction();

  useEffect(() => {
    if (selectedChain) {
      estimateGasFee(selectedChain);
      // Reset connected address when chain changes
      setConnectedAddress('');
    }
  }, [selectedChain]);

  const estimateGasFee = async (chain: SupportedChain) => {
    // Simulate gas fee estimation
    const baseFees: Record<string, { min: number; max: number }> = {
      ethereum: { min: 0.008, max: 0.03 },
      polygon: { min: 0.002, max: 0.008 },
      bsc: { min: 0.003, max: 0.01 },
      base: { min: 0.002, max: 0.006 },
      arbitrum: { min: 0.001, max: 0.005 },
      optimism: { min: 0.001, max: 0.005 },
    };

    const feeRange = baseFees[chain.id] || { min: 0.002, max: 0.01 };
    const estimatedFee = (Math.random() * (feeRange.max - feeRange.min) + feeRange.min).toFixed(6);

    setGasFee({
      fee: estimatedFee,
      currency: chain.symbol
    });
  };

  const connectWallet = async () => {
    if (!selectedChain) {
      toast.error('먼저 체인을 선택해주세요.');
      return;
    }

    console.log('🔍 Selected chain:', selectedChain.id, selectedChain.name);
    setIsConnecting(true);

    try {
      // EVM chains - use MetaMask
      if (['ethereum', 'polygon', 'bsc', 'base', 'arbitrum', 'optimism'].includes(selectedChain.id)) {
        console.log('✅ Detected EVM chain, connecting to MetaMask...');

        if (typeof window.ethereum === 'undefined') {
          toast.error('MetaMask를 설치해주세요.');
          window.open('https://metamask.io/download/', '_blank');
          return;
        }

        const address = await evmProofService.getAddress();
        if (address) {
          setConnectedAddress(address);
          toast.success('MetaMask 지갑이 연결되었습니다!');
        } else {
          toast.error('MetaMask 연결에 실패했습니다.');
        }
      }
      // Solana - use Phantom wallet
      else if (selectedChain.id === 'solana') {
        console.log('✅ Detected Solana chain, connecting to Phantom...');

        if (typeof window.solana !== 'undefined' && window.solana.isPhantom) {
          const response = await window.solana.connect();
          const address = response.publicKey.toString();
          setConnectedAddress(address);
          toast.success('Phantom 지갑이 연결되었습니다!');
        } else {
          toast.error('Phantom 지갑을 설치해주세요.');
          window.open('https://phantom.app/', '_blank');
        }
      } else {
        console.warn('⚠️ Unknown chain:', selectedChain.id);
        toast.error('지원하지 않는 체인입니다.');
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      toast.error('지갑 연결에 실패했습니다.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleBridge = async () => {
    if (!selectedChain || !connectedAddress) {
      toast.error('체인과 지갑을 모두 연결해주세요.');
      return;
    }

    setIsBridging(true);

    try {
      const bridgeData = {
        nftObjectId: nftData.objectId,
        photocardId: nftData.id,
        idolName: nftData.idolName,
        imageUrl: nftData.imageUrl,
        rarity: nftData.rarity,
        concept: nftData.concept,
        serialNo: nftData.serialNo,
        targetChain: selectedChain
      };

      const result = await nftBridgeService.bridgeToChain(
        bridgeData,
        connectedAddress,
        signAndExecuteTransactionAsync
      );

      if (result.success) {
        toast.success('🎉 NFT 브릿지가 완료되었습니다!');
        onClose();
      } else {
        toast.error(`브릿지 실패: ${result.error}`);
      }
    } catch (error) {
      console.error('Bridge failed:', error);
      toast.error('NFT 브릿지에 실패했습니다.');
    } finally {
      setIsBridging(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('클립보드에 복사되었습니다!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            NFT 브릿지
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* NFT 정보 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">브릿지할 NFT</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-3">
                <img
                  src={nftData.imageUrl}
                  alt={nftData.idolName}
                  className="w-16 h-20 object-cover rounded border"
                />
                <div>
                  <p className="font-medium">{nftData.idolName}</p>
                  <p className="text-sm text-muted-foreground">{nftData.concept}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {nftData.rarity}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      #{nftData.serialNo.toString().padStart(4, '0')}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 경고 메시지 */}
          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardContent className="pt-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm space-y-1">
                  <p className="font-medium text-yellow-500">주의사항</p>
                  <p className="text-muted-foreground">
                    NFT를 브릿지하면 Sui 체인의 원본 NFT는 락(lock)되고, 대상 체인에 새로운 NFT가 발행됩니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 대상 체인 선택 */}
          <div className="space-y-2">
            <Label htmlFor="chain-select">대상 블록체인</Label>
            <Select onValueChange={(value) => {
              const chain = SUPPORTED_CHAINS.find(c => c.id === value);
              setSelectedChain(chain || null);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="체인을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CHAINS.map((chain) => (
                  <SelectItem key={chain.id} value={chain.id}>
                    <div className="flex items-center gap-2">
                      <span>{chain.icon}</span>
                      <span>{chain.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {chain.symbol}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 가스비 정보 */}
          {gasFee && selectedChain && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  예상 가스비
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span>예상 비용:</span>
                  <Badge variant="outline">
                    {gasFee.fee} {gasFee.currency}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 지갑 연결 */}
          <div className="space-y-2">
            <Label>
              수신 지갑
              {selectedChain && (
                <span className="text-xs text-muted-foreground ml-2">
                  ({['ethereum', 'polygon', 'bsc', 'base', 'arbitrum', 'optimism'].includes(selectedChain.id) ? 'MetaMask' :
                     selectedChain.id === 'solana' ? 'Phantom' : '지갑'} 필요)
                </span>
              )}
            </Label>
            {connectedAddress ? (
              <div className="flex gap-2">
                <Input
                  value={connectedAddress}
                  readOnly
                  className="font-mono text-sm bg-muted"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(connectedAddress)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={connectWallet}
                disabled={!selectedChain || isConnecting}
                className="w-full"
                variant="outline"
              >
                {isConnecting ? '연결 중...' :
                 !selectedChain ? '먼저 체인을 선택하세요' :
                 ['ethereum', 'polygon', 'bsc', 'base', 'arbitrum', 'optimism'].includes(selectedChain.id) ? '🦊 MetaMask 연결' :
                 selectedChain.id === 'solana' ? '👻 Phantom 연결' : '지갑 연결'}
              </Button>
            )}
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              취소
            </Button>
            <Button
              onClick={handleBridge}
              disabled={!selectedChain || !connectedAddress || isBridging}
              className="flex-1"
            >
              {isBridging ? '브릿지 중...' : 'NFT 브릿지'}
            </Button>
          </div>

          {/* 정보 텍스트 */}
          <p className="text-xs text-muted-foreground text-center">
            NFT 브릿지는 수분이 소요될 수 있습니다.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
