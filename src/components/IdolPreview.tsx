import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Crown, Heart, Star, Sparkles } from "lucide-react";

interface IdolPreset {
  id: number;
  name: string;
  personality: string;
  description: string;
  profile_image: string;
  persona_prompt: string;
}

interface IdolPreviewProps {
  selectedIdol: IdolPreset;
  onConfirm: () => void;
  onBack: () => void;
}

const IdolPreview = ({ selectedIdol, onConfirm, onBack }: IdolPreviewProps) => {
  const [mintingProgress, setMintingProgress] = useState(0);
  const [isMinting, setIsMinting] = useState(false);

  const handleMinting = async () => {
    setIsMinting(true);
    setMintingProgress(0);
    
    // 민팅 시뮬레이션
    const intervals = [20, 40, 60, 80, 100];
    for (const progress of intervals) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setMintingProgress(progress);
    }
    
    // 완료 후 확인
    setTimeout(() => {
      onConfirm();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-4xl mx-auto space-y-8 pt-8">
        {/* 헤더 */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold gradient-text">
            👑 최애 선택 완료!
          </h1>
          <p className="text-muted-foreground text-lg">
            축하합니다! 심쿵 배틀에서 선택된 당신의 최애를 확인해보세요
          </p>
        </div>

        {/* 승리 아이돌 카드 */}
        <div className="text-center">
          <Card className="p-8 glass-dark border-white/10 max-w-md mx-auto relative overflow-hidden">
            {/* 배경 이펙트 */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-pink-500/10 to-purple-500/10" />
            <div className="absolute top-4 right-4">
              <Crown className="w-8 h-8 text-yellow-400" />
            </div>
            
            <div className="relative space-y-6">
              {/* 아이돌 이미지 */}
              <div className="relative mx-auto w-48 h-48">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400/20 via-pink-500/20 to-purple-500/20 animate-pulse" />
                <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-gradient-primary shadow-xl">
                  <img 
                    src={selectedIdol.profile_image}
                    alt={selectedIdol.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* 스파클 이펙트 */}
                <div className="absolute -top-2 -right-2 animate-bounce">
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="absolute -bottom-2 -left-2 animate-bounce delay-300">
                  <Star className="w-5 h-5 text-pink-400" />
                </div>
              </div>

              {/* 아이돌 정보 */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold gradient-text">{selectedIdol.name}</h2>
                  <Badge variant="outline" className="px-4 py-2">
                    {selectedIdol.personality}
                  </Badge>
                </div>
                
                <p className="text-muted-foreground">
                  {selectedIdol.description}
                </p>

                {/* 예상 특성 */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-3 bg-card/50 rounded-lg">
                    <div className="text-pink-400 font-bold">매력도</div>
                    <div className="text-2xl">★★★★★</div>
                  </div>
                  <div className="text-center p-3 bg-card/50 rounded-lg">
                    <div className="text-purple-400 font-bold">호감도</div>
                    <div className="text-2xl">💕💕💕💕💕</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 민팅 프로세스 */}
        {!isMinting ? (
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold gradient-text">IdolCard NFT 생성</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                선택한 아이돌을 NFT로 만들어 영구히 소유하세요. <br />
                이 카드는 VAULT에서 스토리를 진행하고 RISE에서 성장시킬 수 있습니다.
              </p>
            </div>
            
            <div className="flex justify-center gap-4">
              <Button onClick={onBack} variant="outline" size="lg">
                ← 다시 선택
              </Button>
              <Button 
                onClick={handleMinting} 
                variant="default" 
                size="lg"
                className="btn-modern px-8"
              >
                🎨 IdolCard NFT 생성하기
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <Card className="p-8 glass-dark border-white/10 max-w-md mx-auto">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold gradient-text">NFT 생성 중...</h3>
                  <p className="text-muted-foreground">잠시만 기다려주세요</p>
                </div>
                
                <div className="space-y-4">
                  <Progress value={mintingProgress} className="w-full h-3" />
                  <div className="text-sm text-muted-foreground">
                    {mintingProgress === 0 && "블록체인 네트워크 연결 중..."}
                    {mintingProgress === 20 && "스마트 컨트랙트 호출 중..."}
                    {mintingProgress === 40 && "메타데이터 생성 중..."}
                    {mintingProgress === 60 && "NFT 민팅 중..."}
                    {mintingProgress === 80 && "소유권 등록 중..."}
                    {mintingProgress === 100 && "🎉 민팅 완료!"}
                  </div>
                </div>

                {mintingProgress === 100 && (
                  <div className="flex items-center justify-center gap-2 text-green-400">
                    <Heart className="w-5 h-5 fill-current" />
                    <span className="font-bold">민팅 성공!</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* 다음 단계 안내 */}
        <Card className="p-6 glass-dark border-white/10 max-w-2xl mx-auto">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold gradient-text">다음 단계</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-card/50 rounded-lg">
                <div className="font-bold text-accent">🗃️ VAULT</div>
                <div className="text-muted-foreground">스토리 플레이 & 포카 수집</div>
              </div>
              <div className="p-4 bg-card/50 rounded-lg">
                <div className="font-bold text-secondary">📈 RISE</div>
                <div className="text-muted-foreground">리더보드 & 갤러리 & 거래</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default IdolPreview;