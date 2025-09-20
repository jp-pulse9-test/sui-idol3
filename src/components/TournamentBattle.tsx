import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, Zap } from "lucide-react";

interface IdolPreset {
  id: number;
  name: string;
  personality: string;
  description: string;
  profile_image: string;
  persona_prompt: string;
}

interface TournamentBattleProps {
  idols: IdolPreset[];
  onComplete: (winner: IdolPreset) => void;
  onBack: () => void;
}

const TournamentBattle = ({ idols, onComplete, onBack }: TournamentBattleProps) => {
  const [bracket, setBracket] = useState<IdolPreset[]>([]);
  const [currentPair, setCurrentPair] = useState<[IdolPreset, IdolPreset] | null>(null);
  const [currentRound, setCurrentRound] = useState<IdolPreset[]>([]);
  const [roundNumber, setRoundNumber] = useState(1);
  const [heartEffect, setHeartEffect] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    // 아이돌 데이터가 충분하지 않은 경우 처리
    if (!idols || idols.length < 2) {
      console.log('Not enough idols for tournament:', idols?.length || 0);
      return;
    }

    // 16명 랜덤 선택하여 토너먼트 시작 (부족하면 사용 가능한 만큼만)
    const shuffled = [...idols].sort(() => Math.random() - 0.5);
    const availableCount = Math.min(16, idols.length);
    const selected = shuffled.slice(0, availableCount);
    
    // 유효한 아이돌만 필터링
    const validIdols = selected.filter(idol => idol && idol.profile_image && idol.name);
    
    if (validIdols.length < 2) {
      console.log('Not enough valid idols for tournament:', validIdols.length);
      return;
    }
    
    setBracket(validIdols);
    setCurrentRound(validIdols);
    setCurrentPair([validIdols[0], validIdols[1]]);
  }, [idols]);

  const handleChoice = (selectedIdol: IdolPreset, side: 'left' | 'right') => {
    // 하트 이펙트
    setHeartEffect(side);
    setTimeout(() => setHeartEffect(null), 1000);

    if (!currentPair) return;

    const currentIndex = currentRound.indexOf(currentPair[0]);
    const nextRound = [...currentRound];
    
    // 승자를 다음 라운드로
    nextRound.splice(currentIndex, 2, selectedIdol);
    
    // 현재 라운드 완료 체크
    if (currentIndex + 2 >= currentRound.length) {
      // 라운드 완료
      const pairsRemaining = Math.floor(nextRound.length / 2);
      
      if (pairsRemaining === 1) {
        // 토너먼트 완료
        onComplete(selectedIdol);
        return;
      } else {
        // 다음 라운드 시작
        const filteredNextRound = nextRound.filter(idol => idol && idol.profile_image).slice(0, pairsRemaining);
        setCurrentRound(filteredNextRound);
        setCurrentPair([filteredNextRound[0], filteredNextRound[1]]);
        setRoundNumber(prev => prev + 1);
      }
    } else {
      // 다음 매치
      const nextPairIndex = currentIndex + 2;
      if (nextPairIndex + 1 < currentRound.length && 
          currentRound[nextPairIndex] && 
          currentRound[nextPairIndex + 1]) {
        setCurrentPair([currentRound[nextPairIndex], currentRound[nextPairIndex + 1]]);
      }
      setCurrentRound(nextRound);
    }
  };

  const getTournamentRoundName = () => {
    const remaining = currentRound.length;
    switch (remaining) {
      case 16: return "16강";
      case 8: return "8강";
      case 4: return "준결승";
      case 2: return "결승";
      default: return `${remaining}강`;
    }
  };

  const getCurrentProgress = () => {
    const totalMatches = 15; // 16강 토너먼트의 총 매치 수
    const completedMatches = 16 - currentRound.length + Math.floor((16 - currentRound.length) / 2);
    return (completedMatches / totalMatches) * 100;
  };

  if (!currentPair || !currentPair[0] || !currentPair[1]) {
    return <div className="min-h-screen bg-gradient-background flex items-center justify-center">
      <Card className="p-8 glass-dark border-white/10 text-center">
        <div className="space-y-4">
          <h2 className="text-xl font-bold gradient-text">토너먼트를 시작할 수 없습니다</h2>
          <p className="text-muted-foreground">충분한 아이돌 데이터가 없습니다.</p>
          <Button onClick={onBack} variant="outline">
            돌아가기
          </Button>
        </div>
      </Card>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-6xl mx-auto space-y-8 pt-8">
        {/* 헤더 */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-4">
            <Button onClick={onBack} variant="ghost" size="sm">
              ← 성향테스트로
            </Button>
            <h1 className="text-4xl font-bold gradient-text">
              💕 심쿵 배틀
            </h1>
            <div className="w-20" /> {/* 균형을 위한 빈 공간 */}
          </div>
          
          <div className="flex items-center justify-center gap-6">
            <Badge variant="outline" className="px-4 py-2">
              {getTournamentRoundName()}
            </Badge>
            <Progress value={getCurrentProgress()} className="w-48" />
            <Badge variant="secondary" className="px-4 py-2">
              {Math.floor((16 - currentRound.length) / 2) + 1} / 8 라운드
            </Badge>
          </div>
          
          <p className="text-muted-foreground">
            더 심쿵하는 아이돌을 선택해주세요
          </p>
        </div>

        {/* 배틀 카드 */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* 왼쪽 아이돌 */}
          <Card 
            className={`relative p-6 glass-dark border-white/10 card-hover cursor-pointer transition-all duration-500 ${
              heartEffect === 'left' ? 'scale-105 border-pink-500/50 shadow-pink-500/25 shadow-xl' : ''
            }`}
            onClick={() => handleChoice(currentPair[0], 'left')}
          >
            {heartEffect === 'left' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Heart className="w-16 h-16 text-pink-500 animate-bounce fill-current" />
              </div>
            )}
            
            <div className="space-y-4">
              <div className="aspect-square rounded-xl overflow-hidden bg-gradient-primary/20">
                <img 
                  src={currentPair[0].profile_image}
                  alt={currentPair[0].name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold gradient-text">{currentPair[0].name}</h3>
                <Badge variant="outline" className="mb-2">
                  {currentPair[0].personality}
                </Badge>
                <p className="text-muted-foreground text-sm">
                  {currentPair[0].description}
                </p>
              </div>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full border-pink-500/50 text-pink-400 hover:bg-pink-500/20"
              >
                💕 선택
              </Button>
            </div>
          </Card>

          {/* VS 구분선 */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 md:block hidden">
            <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* 오른쪽 아이돌 */}
          <Card 
            className={`relative p-6 glass-dark border-white/10 card-hover cursor-pointer transition-all duration-500 ${
              heartEffect === 'right' ? 'scale-105 border-pink-500/50 shadow-pink-500/25 shadow-xl' : ''
            }`}
            onClick={() => handleChoice(currentPair[1], 'right')}
          >
            {heartEffect === 'right' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Heart className="w-16 h-16 text-pink-500 animate-bounce fill-current" />
              </div>
            )}
            
            <div className="space-y-4">
              <div className="aspect-square rounded-xl overflow-hidden bg-gradient-primary/20">
                <img 
                  src={currentPair[1].profile_image}
                  alt={currentPair[1].name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold gradient-text">{currentPair[1].name}</h3>
                <Badge variant="outline" className="mb-2">
                  {currentPair[1].personality}
                </Badge>
                <p className="text-muted-foreground text-sm">
                  {currentPair[1].description}
                </p>
              </div>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full border-pink-500/50 text-pink-400 hover:bg-pink-500/20"
              >
                💕 선택
              </Button>
            </div>
          </Card>
        </div>

        {/* 토너먼트 브래킷 미니맵 */}
        <Card className="p-4 glass-dark border-white/10 max-w-2xl mx-auto">
          <div className="text-center space-y-2">
            <h3 className="font-bold text-sm text-muted-foreground">토너먼트 진행상황</h3>
            <div className="flex items-center justify-center gap-2 text-xs">
              <span className={currentRound.length >= 16 ? 'text-primary' : 'text-muted-foreground'}>16강</span>
              <span>→</span>
              <span className={currentRound.length <= 8 && currentRound.length > 4 ? 'text-primary' : 'text-muted-foreground'}>8강</span>
              <span>→</span>
              <span className={currentRound.length <= 4 && currentRound.length > 2 ? 'text-primary' : 'text-muted-foreground'}>준결승</span>
              <span>→</span>
              <span className={currentRound.length <= 2 ? 'text-primary' : 'text-muted-foreground'}>결승</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TournamentBattle;