import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Crown, Heart, Star, Sparkles, BarChart3, Radar } from "lucide-react";
import { toast } from "sonner";
import { IdolStatsDisplay, generateRandomStats } from "@/components/IdolStatsDisplay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { secureStorage } from "@/utils/secureStorage";

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
  isMinting?: boolean;
}

const IdolPreview = ({ selectedIdol, onConfirm, onBack, isMinting = false }: IdolPreviewProps) => {
  const [votingProgress, setVotingProgress] = useState(0);
  const [isVoting, setIsVoting] = useState(false);
  const [hasSufficientCoins, setHasSufficientCoins] = useState(false);
  const [currentSuiCoins, setCurrentSuiCoins] = useState(0);
  const [idolStats, setIdolStats] = useState(() => generateRandomStats(selectedIdol.personality));

  useEffect(() => {
    // 수이 코인 잔액 체크 (0.15 코인 = 700원)
    const userCoins = parseFloat(localStorage.getItem('suiCoins') || '0');
    setCurrentSuiCoins(userCoins);
    setHasSufficientCoins(userCoins >= 0.15);
    
    console.log('🔍 IdolPreview 코인 체크:', { userCoins, hasSufficientCoins: userCoins >= 0.15 });
  }, []);

  const handleVoting = async () => {
    // 실시간으로 코인 재확인
    const latestCoins = parseFloat(localStorage.getItem('suiCoins') || '0');
    setCurrentSuiCoins(latestCoins);
    
    if (latestCoins < 0.15) {
      toast.error(`수이 코인이 부족합니다. 0.15 코인(700원)이 필요합니다. 현재: ${latestCoins.toFixed(2)} SUI`);
      return;
    }

    setIsVoting(true);
    setVotingProgress(0);
    
    // 투표 진행 시뮬레이션
    const intervals = [20, 40, 60, 80, 100];
    for (const progress of intervals) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setVotingProgress(progress);
    }
    
    // 코인 차감
    const finalCoins = parseFloat(localStorage.getItem('suiCoins') || '0');
    localStorage.setItem('suiCoins', (finalCoins - 0.15).toFixed(2));
    
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
              </div>
            </div>
          </Card>
        </div>

        {/* 아이돌 상세 스탯 */}
        <Card className="p-6 glass-dark border-white/10">
          <Tabs defaultValue="radar" className="w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold gradient-text">📊 아이돌 능력치</h3>
              <TabsList className="bg-card/50">
                <TabsTrigger value="radar" className="flex items-center gap-2">
                  <Radar className="w-4 h-4" />
                  레이더
                </TabsTrigger>
                <TabsTrigger value="bar" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  막대그래프
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="radar">
              <IdolStatsDisplay stats={idolStats} viewMode="radar" />
            </TabsContent>
            
            <TabsContent value="bar">
              <IdolStatsDisplay stats={idolStats} viewMode="bar" />
            </TabsContent>
          </Tabs>

          <div className="mt-6 grid grid-cols-2 gap-4 text-sm bg-card/30 p-4 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">
                {Math.round(Object.values(idolStats).reduce((acc, stat) => acc + stat.current, 0) / 8)}
              </div>
              <div className="text-muted-foreground">현재 평균</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-accent">
                {Math.round(Object.values(idolStats).reduce((acc, stat) => acc + stat.potential, 0) / 8)}
              </div>
              <div className="text-muted-foreground">잠재력 평균</div>
            </div>
          </div>
        </Card>

        {/* 투표 프로세스 */}
        {!isVoting ? (
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold gradient-text">💝 최애 투표하기</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                선택한 아이돌에게 투표하여 영구히 소유하세요. <br />
                투표 비용: 0.15 SUI 코인 (700원) | 현재 보유: {currentSuiCoins.toFixed(2)} SUI
              </p>
              {currentSuiCoins < 0.15 && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-destructive text-sm">
                    ⚠️ 수이 코인이 부족합니다. 0.15 코인이 필요합니다. <br />
                    현재 보유: {currentSuiCoins.toFixed(2)} SUI
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-center gap-4">
              <Button onClick={onBack} variant="outline" size="lg">
                ← 다시 선택
              </Button>
              <Button 
                onClick={handleVoting} 
                variant="default" 
                size="lg"
                className="btn-modern px-8"
                disabled={currentSuiCoins < 0.15 || isMinting}
              >
                {isMinting ? "🔄 민팅 중..." : "💝 투표하기 (0.15 SUI)"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <Card className="p-8 glass-dark border-white/10 max-w-md mx-auto">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold gradient-text">투표 진행 중...</h3>
                  <p className="text-muted-foreground">잠시만 기다려주세요</p>
                </div>
                
                <div className="space-y-4">
                  <Progress value={votingProgress} className="w-full h-3" />
                  <div className="text-sm text-muted-foreground">
                    {votingProgress === 0 && "블록체인 네트워크 연결 중..."}
                    {votingProgress === 20 && "투표 트랜잭션 생성 중..."}
                    {votingProgress === 40 && "스마트 컨트랙트 호출 중..."}
                    {votingProgress === 60 && "투표 기록 중..."}
                    {votingProgress === 80 && "소유권 등록 중..."}
                    {votingProgress === 100 && "🎉 투표 완료!"}
                  </div>
                </div>

                {votingProgress === 100 && (
                  <div className="flex items-center justify-center gap-2 text-green-400">
                    <Heart className="w-5 h-5 fill-current" />
                    <span className="font-bold">투표 성공!</span>
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