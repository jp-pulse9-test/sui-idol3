import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIdolCardMinting, IdolCardMintingData } from '@/services/idolCardMinting';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'sonner';
import { Loader2, Wallet, Sparkles, Crown } from 'lucide-react';

interface IdolCardMintingProps {
  idolData: {
    id: number;
    name: string;
    personality: string;
    image: string;
    persona_prompt: string;
  };
  onMintingComplete?: () => void;
  className?: string;
}

export const IdolCardMinting: React.FC<IdolCardMintingProps> = ({
  idolData,
  onMintingComplete,
  className = '',
}) => {
  const { mintIdolCard, isConnected, walletAddress } = useIdolCardMinting();
  const { isConnected: walletConnected } = useWallet();
  const [isMinting, setIsMinting] = useState(false);

  const handleMintIdolCard = async () => {
    if (!isConnected || !walletConnected) {
      toast.error('지갑을 먼저 연결해주세요!');
      return;
    }

    setIsMinting(true);

    try {
      const mintingData: IdolCardMintingData = {
        idolId: idolData.id,
        name: idolData.name,
        personality: idolData.personality,
        imageUrl: idolData.image,
        personaPrompt: idolData.persona_prompt,
      };

      const result = await mintIdolCard(mintingData);
      
      if (result.success) {
        toast.success(`🎉 ${idolData.name} IdolCard NFT가 성공적으로 민팅되었습니다!`);
        onMintingComplete?.();
      }
    } catch (error) {
      console.error('IdolCard 민팅 실패:', error);
      toast.error('IdolCard 민팅에 실패했습니다.');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          IdolCard NFT 민팅
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 아이돌 정보 */}
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-gradient-primary/20">
            <img
              src={idolData.image}
              alt={idolData.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-xl font-bold">{idolData.name}</h3>
            <p className="text-muted-foreground text-sm">{idolData.personality}</p>
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
          onClick={handleMintIdolCard}
          disabled={!isConnected || !walletConnected || isMinting}
          className="w-full"
          size="lg"
        >
          {isMinting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              IdolCard 민팅 중...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              IdolCard NFT 민팅
            </>
          )}
        </Button>

        {/* 설명 */}
        <div className="text-center text-sm text-muted-foreground">
          <p>선택한 아이돌의 IdolCard NFT를 민팅합니다.</p>
          <p className="mt-1">이 NFT는 블록체인에 영구적으로 저장됩니다.</p>
        </div>
      </CardContent>
    </Card>
  );
};
