import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePhotoCardMinting, PhotoCardMintingData } from '@/services/photocardMintingReal';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'sonner';
import { Loader2, Wallet, Sparkles, Image, Star } from 'lucide-react';

interface PhotoCardMintingProps {
  mintingData: PhotoCardMintingData;
  onMintingComplete?: (mintedCard: any) => void;
  className?: string;
}

export const PhotoCardMinting: React.FC<PhotoCardMintingProps> = ({
  mintingData,
  onMintingComplete,
  className = '',
}) => {
  const { mintPhotoCard, isConnected, walletAddress, isPending } = usePhotoCardMinting();
  const { isConnected: walletConnected } = useWallet();
  const [isMinting, setIsMinting] = useState(false);

  const handleMintPhotoCard = async () => {
    if (!isConnected || !walletConnected) {
      toast.error('지갑을 먼저 연결해주세요!');
      return;
    }

    setIsMinting(true);

    try {
      const result = await mintPhotoCard(mintingData);
      
      if (result) {
        toast.success(`🎉 ${mintingData.idolName} ${mintingData.rarity} 포토카드 NFT가 성공적으로 민팅되었습니다!`);
        onMintingComplete?.(result);
      }
    } catch (error) {
      console.error('포토카드 민팅 실패:', error);
      toast.error('포토카드 민팅에 실패했습니다.');
    } finally {
      setIsMinting(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'N': return 'bg-gray-500';
      case 'R': return 'bg-blue-500';
      case 'SR': return 'bg-purple-500';
      case 'SSR': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getRarityText = (rarity: string) => {
    switch (rarity) {
      case 'N': return 'Normal';
      case 'R': return 'Rare';
      case 'SR': return 'Super Rare';
      case 'SSR': return 'Super Super Rare';
      default: return 'Normal';
    }
  };

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Image className="w-5 h-5 text-blue-500" />
          포토카드 NFT 민팅
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 포토카드 정보 */}
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-lg overflow-hidden bg-gradient-primary/20">
            <img
              src={mintingData.imageUrl}
              alt={mintingData.idolName}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-xl font-bold">{mintingData.idolName}</h3>
            <p className="text-muted-foreground text-sm">{mintingData.concept}</p>
            <Badge className={`${getRarityColor(mintingData.rarity)} text-white mt-2`}>
              <Star className="w-3 h-3 mr-1" />
              {getRarityText(mintingData.rarity)}
            </Badge>
          </div>
        </div>

        {/* 포토카드 상세 정보 */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-card/50 rounded-lg">
            <div className="font-bold text-primary">시즌</div>
            <div>{mintingData.season}</div>
          </div>
          <div className="p-3 bg-card/50 rounded-lg">
            <div className="font-bold text-accent">시리얼</div>
            <div>#{mintingData.serialNo}</div>
          </div>
          <div className="p-3 bg-card/50 rounded-lg">
            <div className="font-bold text-primary">총 발행량</div>
            <div>{mintingData.totalSupply.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-card/50 rounded-lg">
            <div className="font-bold text-accent">희귀도</div>
            <div>{mintingData.rarity}</div>
          </div>
        </div>

        {/* 지갑 연결 상태 */}
        <div className="flex items-center justify-center gap-2">
          {isConnected && walletConnected ? (
            <Badge variant="default" className="flex items-center gap-1">
              <Wallet className="w-3 h-3" />
              지갑 연결됨
            </Badge>
          ) : (
            <Badge variant="outline" className="flex items-center gap-1">
              <Wallet className="w-3 h-3" />
              지갑 연결 필요
            </Badge>
          )}
        </div>

        {/* 지갑 주소 */}
        {walletAddress && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 6)}
            </p>
          </div>
        )}

        {/* 민팅 버튼 */}
        <Button
          onClick={handleMintPhotoCard}
          disabled={!isConnected || !walletConnected || isMinting || isPending}
          className="w-full"
          size="lg"
        >
          {isMinting || isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              포토카드 민팅 중...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              포토카드 NFT 민팅
            </>
          )}
        </Button>

        {/* 설명 */}
        <div className="text-center text-sm text-muted-foreground">
          <p>선택한 아이돌의 포토카드 NFT를 민팅합니다.</p>
          <p className="mt-1">이 NFT는 블록체인에 영구적으로 저장됩니다.</p>
        </div>
      </CardContent>
    </Card>
  );
};
