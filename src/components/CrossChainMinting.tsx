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
import { evmProofService } from '../services/evmProofService';
import { evmNftService } from '../services/evmNftService';
import { metadataService } from '../services/metadataService';
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
  const [connectedAddress, setConnectedAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [gasFee, setGasFee] = useState<{ fee: string; currency: string } | null>(null);
  const { mintToChain, estimateGasFee, isLoading } = useCrossChain();

  useEffect(() => {
    if (selectedChain) {
      estimateGasFee(selectedChain).then(setGasFee);
      // Reset connected address when chain changes
      setConnectedAddress('');
    }
  }, [selectedChain, estimateGasFee]);

  const connectWallet = async () => {
    if (!selectedChain) {
      toast.error('먼저 체인을 선택해주세요.');
      return;
    }

    console.log('🔍 Selected chain:', selectedChain.id, selectedChain.name);
    setIsConnecting(true);

    try {
      // EVM chains (Ethereum, Polygon, BSC, Base, Arbitrum, Optimism) - use MetaMask ONLY
      if (['ethereum', 'polygon', 'polygon-amoy', 'bsc', 'base', 'arbitrum', 'optimism'].includes(selectedChain.id)) {
        console.log('✅ Detected EVM chain, connecting to MetaMask...');

        // Find MetaMask specifically (not Phantom)
        let provider = null;

        // Check if window.ethereum exists
        if (typeof window.ethereum === 'undefined') {
          toast.error('MetaMask를 설치해주세요.');
          window.open('https://metamask.io/download/', '_blank');
          return;
        }

        // Multiple wallets installed
        if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
          console.log('🔍 Multiple providers detected:', window.ethereum.providers.length);

          // Find MetaMask (exclude Phantom)
          provider = window.ethereum.providers.find((p: any) => {
            console.log('Provider check:', { isMetaMask: p.isMetaMask, isPhantom: p.isPhantom });
            return p.isMetaMask && !p.isPhantom;
          });

          if (provider) {
            console.log('✅ Found MetaMask in providers array');
          } else {
            console.error('❌ MetaMask not found in providers array');
          }
        }
        // Single provider
        else {
          console.log('🔍 Single provider detected:', {
            isMetaMask: window.ethereum.isMetaMask,
            isPhantom: window.ethereum.isPhantom
          });

          if (window.ethereum.isMetaMask && !window.ethereum.isPhantom) {
            provider = window.ethereum;
            console.log('✅ Using MetaMask as single provider');
          } else {
            console.error('❌ Single provider is not MetaMask or is Phantom');
          }
        }

        // No MetaMask found
        if (!provider) {
          toast.error('MetaMask를 설치해주세요. (Phantom은 EVM 체인에 사용할 수 없습니다)');
          window.open('https://metamask.io/download/', '_blank');
          return;
        }

        try {
          console.log('📞 Requesting accounts from MetaMask...');
          console.log('Provider object:', provider);

          // Force focus to bring popup to front
          window.focus();

          // Request accounts from MetaMask with explicit request
          const accounts = await provider.request({
            method: 'eth_requestAccounts',
            params: []
          });

          console.log('📋 Accounts received:', accounts);

          if (accounts && accounts.length > 0) {
            setConnectedAddress(accounts[0]);
            toast.success('MetaMask 지갑이 연결되었습니다!');
          } else {
            toast.error('MetaMask 계정을 가져올 수 없습니다.');
          }
        } catch (error: any) {
          console.error('MetaMask connection error:', error);
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);

          if (error.code === 4001) {
            toast.error('사용자가 MetaMask 연결을 거부했습니다.');
          } else if (error.code === -32002) {
            toast.error('이미 MetaMask 연결 요청이 진행 중입니다. MetaMask 팝업을 확인해주세요.');
          } else {
            toast.error('MetaMask 연결에 실패했습니다: ' + error.message);
          }
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

  const handleMint = async () => {
    if (!selectedChain || !connectedAddress) {
      toast.error('체인과 지갑을 모두 연결해주세요.');
      return;
    }

    // EVM chains - direct minting
    if (['ethereum', 'polygon', 'polygon-amoy', 'bsc', 'base', 'arbitrum', 'optimism'].includes(selectedChain.id)) {
      try {
        toast.info('📤 메타데이터 업로드 중...');

        // 1. Generate and upload metadata
        const metadataUri = await metadataService.generateAndUploadMetadata(
          photocardData.idolName,
          photocardData.imageUrl,
          photocardData.rarity,
          photocardData.concept,
          photocardData.id
        );

        console.log('✅ Metadata uploaded:', metadataUri);

        // 2. Mint NFT directly
        toast.info('🎨 NFT 민팅 중...');
        const txHash = await evmNftService.mintPhotocard(
          selectedChain.chainId,
          photocardData.id,
          connectedAddress,
          metadataUri
        );

        if (txHash) {
          toast.success(`✅ NFT 민팅 성공!\nTX: ${txHash.slice(0, 10)}...`);
          onClose();
        } else {
          toast.error('민팅에 실패했습니다.');
        }
      } catch (error: any) {
        console.error('Minting failed:', error);
        toast.error(`민팅 실패: ${error.message || '알 수 없는 오류'}`);
      }
      return;
    }

    // Other chains - use crossChainService
    const mintingData: CrossChainMintingData = {
      photocardId: photocardData.id,
      idolName: photocardData.idolName,
      imageUrl: photocardData.imageUrl,
      rarity: photocardData.rarity,
      concept: photocardData.concept,
      targetChain: selectedChain,
      recipientAddress: connectedAddress
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

          {/* 지갑 연결 */}
          <div className="space-y-2">
            <Label>
              수신 지갑
              {selectedChain && (
                <span className="text-xs text-muted-foreground ml-2">
                  ({['ethereum', 'polygon', 'polygon-amoy', 'bsc', 'base', 'arbitrum', 'optimism'].includes(selectedChain.id) ? 'MetaMask' :
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
                 ['ethereum', 'polygon', 'polygon-amoy', 'bsc', 'base', 'arbitrum', 'optimism'].includes(selectedChain.id) ? '🦊 MetaMask 연결' :
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
              onClick={handleMint}
              disabled={!selectedChain || !connectedAddress || isLoading}
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