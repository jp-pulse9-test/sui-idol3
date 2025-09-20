import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { SUPPORTED_CHAINS, SupportedChain, CrossChainMintingData } from '../types/crosschain';
import { useCrossChain } from '../hooks/useCrossChain';
import { ExternalLink, Copy, Zap, ArrowRightLeft } from 'lucide-react';

interface CrossChainMintingProps {
  isOpen: boolean;
  onClose: () => void;
  photocardData: {
    id: string;
    idolName: string;
    imageUrl: string;
    rarity: string;
    concept: string;
  };
}

export const CrossChainMinting: React.FC<CrossChainMintingProps> = ({
  isOpen,
  onClose,
  photocardData
}) => {
  const [selectedChain, setSelectedChain] = useState<SupportedChain | null>(null);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [gasFee, setGasFee] = useState<{ fee: string; currency: string } | null>(null);
  const { mintToChain, estimateGasFee, isLoading } = useCrossChain();

  useEffect(() => {
    if (selectedChain) {
      estimateGasFee(selectedChain).then(setGasFee);
    }
  }, [selectedChain, estimateGasFee]);

  const handleMint = async () => {
    if (!selectedChain || !recipientAddress) {
      toast.error('체인과 주소를 모두 입력해주세요.');
      return;
    }

    if (!recipientAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast.error('올바른 지갑 주소를 입력해주세요.');
      return;
    }

    const mintingData: CrossChainMintingData = {
      photocardId: photocardData.id,
      idolName: photocardData.idolName,
      imageUrl: photocardData.imageUrl,
      rarity: photocardData.rarity,
      concept: photocardData.concept,
      targetChain: selectedChain,
      recipientAddress
    };

    const txHash = await mintToChain(mintingData);
    if (txHash) {
      onClose();
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
            <ArrowRightLeft className="h-5 w-5" />
            크로스체인 민팅
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 포토카드 정보 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">포토카드 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-3">
                <img 
                  src={photocardData.imageUrl} 
                  alt={photocardData.idolName}
                  className="w-12 h-16 object-cover rounded border"
                />
                <div>
                  <p className="font-medium">{photocardData.idolName}</p>
                  <p className="text-sm text-muted-foreground">{photocardData.concept}</p>
                  <Badge variant="secondary" className="text-xs">
                    {photocardData.rarity}
                  </Badge>
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

          {/* 수신 주소 */}
          <div className="space-y-2">
            <Label htmlFor="recipient">수신 지갑 주소</Label>
            <div className="flex gap-2">
              <Input
                id="recipient"
                placeholder="0x..."
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="font-mono text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(recipientAddress)}
                disabled={!recipientAddress}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              취소
            </Button>
            <Button 
              onClick={handleMint}
              disabled={!selectedChain || !recipientAddress || isLoading}
              className="flex-1"
            >
              {isLoading ? '민팅 중...' : '크로스체인 민팅'}
            </Button>
          </div>

          {/* 정보 텍스트 */}
          <p className="text-xs text-muted-foreground text-center">
            크로스체인 민팅은 수분이 소요될 수 있습니다.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};