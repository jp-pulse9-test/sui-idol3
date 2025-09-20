import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { usePhotoCardMinting, PhotoCardMintingData } from '@/services/photocardMintingImproved';
import { useSuiBalance } from '@/services/suiBalanceServiceNew';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { RealMintingStatus } from '@/components/RealMintingStatus';
import { MintingResultDisplay } from '@/components/MintingResultDisplay';
import { 
  Loader2, 
  Coins, 
  Image, 
  Hash, 
  Calendar,
  Star,
  Sparkles,
  Crown,
  Heart
} from 'lucide-react';
import { toast } from 'sonner';

interface PhotoCardMintingCardProps {
  selectedIdol?: {
    id: number;
    name: string;
    personality: string;
    imageUrl: string;
    personaPrompt: string;
  };
  onMintingComplete?: (result: any) => void;
  className?: string;
}

export const PhotoCardMintingCard: React.FC<PhotoCardMintingCardProps> = ({
  selectedIdol,
  onMintingComplete,
  className = '',
}) => {
  const { mintPhotoCard, isPending, isConnected } = usePhotoCardMinting();
  const { balance: suiBalance, isLoading: isBalanceLoading } = useSuiBalance();
  const currentAccount = useCurrentAccount();

  const [mintingData, setMintingData] = useState<Partial<PhotoCardMintingData>>({
    idolId: selectedIdol?.id || 1,
    idolName: selectedIdol?.name || '',
    rarity: 'R',
    concept: '',
    season: 'Spring 2024',
    serialNo: Math.floor(Math.random() * 10000) + 1,
    totalSupply: 5000,
    imageUrl: selectedIdol?.imageUrl || '',
    personaPrompt: selectedIdol?.personaPrompt || '',
  });

  const [isMinting, setIsMinting] = useState(false);
  const [mintingResult, setMintingResult] = useState<any>(null);

  const rarityOptions = [
    { value: 'N', label: 'Normal (N)', color: 'bg-gray-500', cost: 0.1 },
    { value: 'R', label: 'Rare (R)', color: 'bg-blue-500', cost: 0.2 },
    { value: 'SR', label: 'Super Rare (SR)', color: 'bg-purple-500', cost: 0.5 },
    { value: 'SSR', label: 'Super Super Rare (SSR)', color: 'bg-yellow-500', cost: 1.0 },
  ];

  const selectedRarity = rarityOptions.find(r => r.value === mintingData.rarity);
  const mintingCost = selectedRarity?.cost || 0.2;
  const currentSuiBalance = suiBalance ? Number(suiBalance) / 1e9 : 0;
  const hasSufficientBalance = currentSuiBalance >= mintingCost;

  const handleMinting = async () => {
    if (!isConnected) {
      toast.error('지갑을 먼저 연결해주세요!');
      return;
    }

    if (!hasSufficientBalance) {
      toast.error(`SUI 잔액이 부족합니다. (보유: ${currentSuiBalance.toFixed(2)} SUI, 필요: ${mintingCost} SUI)`);
      return;
    }

    if (!mintingData.idolName || !mintingData.concept || !mintingData.imageUrl) {
      toast.error('필수 정보를 모두 입력해주세요.');
      return;
    }

    setIsMinting(true);
    setMintingResult(null);
    try {
      const result = await mintPhotoCard(mintingData as PhotoCardMintingData);
      setMintingResult(result);
      if (result.success) {
        onMintingComplete?.(result);
        toast.success('포토카드 민팅이 완료되었습니다!');
      }
    } catch (error) {
      console.error('포토카드 민팅 실패:', error);
      setMintingResult({ success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' });
      // toast.error는 서비스에서 이미 처리
    } finally {
      setIsMinting(false);
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'N': return <Hash className="w-4 h-4" />;
      case 'R': return <Star className="w-4 h-4" />;
      case 'SR': return <Sparkles className="w-4 h-4" />;
      case 'SSR': return <Crown className="w-4 h-4" />;
      default: return <Hash className="w-4 h-4" />;
    }
  };

  return (
    <Card className={`w-full max-w-2xl mx-auto glass-dark border-white/10 ${className}`}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold gradient-text text-center">
          🎴 포토카드 민팅
        </CardTitle>
        <p className="text-muted-foreground text-center">
          당신만의 특별한 포토카드를 민팅하세요
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 실제 민팅 상태 */}
        <RealMintingStatus
          isMinting={isMinting || isPending}
          isConnected={isConnected}
          hasSufficientBalance={hasSufficientBalance}
          mintingCost={mintingCost}
          currentBalance={currentSuiBalance}
        />

        {/* 아이돌 정보 */}
        {selectedIdol && (
          <div className="p-4 bg-card/50 rounded-lg">
            <h3 className="font-semibold mb-2">선택된 아이돌</h3>
            <div className="flex items-center gap-3">
              <img 
                src={selectedIdol.imageUrl} 
                alt={selectedIdol.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-medium">{selectedIdol.name}</p>
                <p className="text-sm text-muted-foreground">{selectedIdol.personality}</p>
              </div>
            </div>
          </div>
        )}

        {/* 민팅 정보 입력 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 아이돌 ID */}
          <div className="space-y-2">
            <Label htmlFor="idolId">아이돌 ID</Label>
            <Input
              id="idolId"
              type="number"
              value={mintingData.idolId || ''}
              onChange={(e) => setMintingData(prev => ({ ...prev, idolId: parseInt(e.target.value) || 1 }))}
              placeholder="1"
            />
          </div>

          {/* 아이돌 이름 */}
          <div className="space-y-2">
            <Label htmlFor="idolName">아이돌 이름 *</Label>
            <Input
              id="idolName"
              value={mintingData.idolName || ''}
              onChange={(e) => setMintingData(prev => ({ ...prev, idolName: e.target.value }))}
              placeholder="아이돌 이름을 입력하세요"
            />
          </div>

          {/* 레어리티 */}
          <div className="space-y-2">
            <Label htmlFor="rarity">레어리티 *</Label>
            <Select 
              value={mintingData.rarity} 
              onValueChange={(value) => setMintingData(prev => ({ ...prev, rarity: value as any }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="레어리티를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {rarityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {getRarityIcon(option.value)}
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground">({option.cost} SUI)</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 컨셉 */}
          <div className="space-y-2">
            <Label htmlFor="concept">컨셉 *</Label>
            <Input
              id="concept"
              value={mintingData.concept || ''}
              onChange={(e) => setMintingData(prev => ({ ...prev, concept: e.target.value }))}
              placeholder="예: 스쿨룩, 파티룩, 캐주얼"
            />
          </div>

          {/* 시즌 */}
          <div className="space-y-2">
            <Label htmlFor="season">시즌</Label>
            <Input
              id="season"
              value={mintingData.season || ''}
              onChange={(e) => setMintingData(prev => ({ ...prev, season: e.target.value }))}
              placeholder="예: Spring 2024"
            />
          </div>

          {/* 시리얼 번호 */}
          <div className="space-y-2">
            <Label htmlFor="serialNo">시리얼 번호</Label>
            <Input
              id="serialNo"
              type="number"
              value={mintingData.serialNo || ''}
              onChange={(e) => setMintingData(prev => ({ ...prev, serialNo: parseInt(e.target.value) || 1 }))}
              placeholder="1"
            />
          </div>

          {/* 총 공급량 */}
          <div className="space-y-2">
            <Label htmlFor="totalSupply">총 공급량</Label>
            <Input
              id="totalSupply"
              type="number"
              value={mintingData.totalSupply || ''}
              onChange={(e) => setMintingData(prev => ({ ...prev, totalSupply: parseInt(e.target.value) || 5000 }))}
              placeholder="5000"
            />
          </div>

          {/* 이미지 URL */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="imageUrl">이미지 URL *</Label>
            <Input
              id="imageUrl"
              value={mintingData.imageUrl || ''}
              onChange={(e) => setMintingData(prev => ({ ...prev, imageUrl: e.target.value }))}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* 페르소나 프롬프트 */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="personaPrompt">페르소나 프롬프트</Label>
            <Textarea
              id="personaPrompt"
              value={mintingData.personaPrompt || ''}
              onChange={(e) => setMintingData(prev => ({ ...prev, personaPrompt: e.target.value }))}
              placeholder="아이돌의 성격과 특징을 설명하세요"
              rows={3}
            />
          </div>
        </div>

        {/* 민팅 비용 및 버튼 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg">
            <div className="flex items-center gap-2">
              {getRarityIcon(mintingData.rarity || 'R')}
              <span className="font-medium">
                {selectedRarity?.label} 포토카드 민팅
              </span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-yellow-500">
                {mintingCost} SUI
              </div>
              <div className="text-xs text-muted-foreground">
                잔액: {currentSuiBalance.toFixed(2)} SUI
              </div>
            </div>
          </div>

          <Button
            onClick={handleMinting}
            disabled={isMinting || isPending || !isConnected || !hasSufficientBalance}
            className="w-full btn-modern text-lg py-6"
          >
            {isMinting || isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                민팅 진행 중...
              </>
            ) : (
              <>
                <Heart className="w-5 h-5 mr-2" />
                {mintingCost} SUI로 포토카드 민팅하기
              </>
            )}
          </Button>

          {!isConnected && (
            <p className="text-center text-sm text-destructive">
              지갑을 연결해야 민팅할 수 있습니다.
            </p>
          )}
          {isConnected && !hasSufficientBalance && (
            <p className="text-center text-sm text-destructive">
              SUI 잔액이 부족합니다.
            </p>
          )}
        </div>

        {/* 민팅 결과 표시 */}
        {mintingResult && (
          <MintingResultDisplay
            result={mintingResult}
            type="photocard"
            onClose={() => setMintingResult(null)}
          />
        )}
      </CardContent>
    </Card>
  );
};
