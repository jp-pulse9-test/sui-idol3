import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, Zap, ArrowLeft } from "lucide-react";
import { IdolPreset } from "@/types/idol";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type GamePhase = 'loading' | 'gender-select' | 'tournament' | 'preview' | 'minting' | 'complete';

const PickSimplified = () => {
  const navigate = useNavigate();
  const [gamePhase, setGamePhase] = useState<GamePhase>('loading');
  const [selectedGender, setSelectedGender] = useState<'all' | 'Male' | 'Female'>('all');
  const [allIdols, setAllIdols] = useState<IdolPreset[]>([]);
  const [tournamentIdols, setTournamentIdols] = useState<IdolPreset[]>([]);
  const [currentRound, setCurrentRound] = useState<IdolPreset[]>([]);
  const [currentPair, setCurrentPair] = useState<[IdolPreset, IdolPreset] | null>(null);
  const [finalWinner, setFinalWinner] = useState<IdolPreset | null>(null);
  const [heartEffect, setHeartEffect] = useState<'left' | 'right' | null>(null);
  const [isMinting, setIsMinting] = useState(false);

  // Fetch idols from database
  useEffect(() => {
    const fetchIdols = async () => {
      try {
        const { data, error } = await supabase.rpc('get_public_idol_data');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setAllIdols(data);
          setGamePhase('gender-select');
        } else {
          toast({
            title: "데이터 없음",
            description: "아이돌 데이터를 불러올 수 없습니다.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error fetching idols:', error);
        toast({
          title: "오류 발생",
          description: "아이돌 데이터를 불러오는 중 오류가 발생했습니다.",
          variant: "destructive"
        });
      }
    };
    
    fetchIdols();
  }, []);

  // Start tournament with selected gender
  const startTournament = (gender: 'all' | 'Male' | 'Female') => {
    setSelectedGender(gender);
    
    let filtered = allIdols;
    if (gender !== 'all') {
      filtered = allIdols.filter(idol => idol.gender === gender);
    }
    
    if (filtered.length < 2) {
      toast({
        title: "아이돌 부족",
        description: "토너먼트를 시작하기에 아이돌이 부족합니다.",
        variant: "destructive"
      });
      return;
    }
    
    // Shuffle and select 16 idols (or less if not enough)
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(16, filtered.length));
    
    setTournamentIdols(selected);
    setCurrentRound(selected);
    setCurrentPair([selected[0], selected[1]]);
    setGamePhase('tournament');
  };

  // Handle idol choice in tournament
  const handleChoice = (selectedIdol: IdolPreset, side: 'left' | 'right') => {
    setHeartEffect(side);
    setTimeout(() => setHeartEffect(null), 1000);

    if (!currentPair) return;

    const currentIndex = currentRound.indexOf(currentPair[0]);
    const nextRound = [...currentRound];
    
    // Move winner to next round
    nextRound.splice(currentIndex, 2, selectedIdol);
    
    // Check if current round is complete
    if (currentIndex + 2 >= currentRound.length) {
      const pairsRemaining = Math.floor(nextRound.length / 2);
      
      if (pairsRemaining === 1) {
        // Tournament complete
        setFinalWinner(selectedIdol);
        setGamePhase('preview');
        return;
      } else {
        // Start next round
        const filteredNextRound = nextRound.slice(0, pairsRemaining);
        setCurrentRound(filteredNextRound);
        setCurrentPair([filteredNextRound[0], filteredNextRound[1]]);
      }
    } else {
      // Next match
      const nextPairIndex = currentIndex + 2;
      if (nextPairIndex + 1 < currentRound.length) {
        setCurrentPair([currentRound[nextPairIndex], currentRound[nextPairIndex + 1]]);
      }
      setCurrentRound(nextRound);
    }
  };

  // Confirm pick and mint NFT
  const handleConfirmPick = async () => {
    if (!finalWinner) return;
    
    setIsMinting(true);
    setGamePhase('minting');
    
    try {
      // Save to localStorage
      localStorage.setItem('selectedIdol', JSON.stringify(finalWinner));
      localStorage.setItem('tournamentWinner', JSON.stringify(finalWinner));
      
      toast({
        title: "선택 완료!",
        description: `${finalWinner.name}을(를) 선택했습니다.`,
      });
      
      setGamePhase('complete');
      
      setTimeout(() => {
        navigate('/vault');
      }, 2000);
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "저장 실패",
        description: "선택 저장 중 오류가 발생했습니다.",
        variant: "destructive"
      });
      setGamePhase('preview');
    } finally {
      setIsMinting(false);
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
    const initialCount = tournamentIdols.length;
    const remaining = currentRound.length;
    return ((initialCount - remaining) / (initialCount - 1)) * 100;
  };

  // Loading phase
  if (gamePhase === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <Card className="p-8 glass-dark border-white/10">
          <p className="text-muted-foreground">아이돌 데이터를 불러오는 중...</p>
        </Card>
      </div>
    );
  }

  // Gender select phase
  if (gamePhase === 'gender-select') {
    return (
      <div className="min-h-screen bg-gradient-background p-4">
        <div className="max-w-4xl mx-auto space-y-8 pt-12">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            홈으로
          </Button>
          
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold gradient-text">
              Pick Your Ideal AIDOL
            </h1>
            <p className="text-muted-foreground text-lg">
              얼굴로 고르는 16강 토너먼트
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card
              className="p-8 glass-dark border-white/10 card-hover cursor-pointer text-center"
              onClick={() => startTournament('all')}
            >
              <div className="space-y-4">
                <div className="text-6xl">🌟</div>
                <h3 className="text-2xl font-bold gradient-text">전체</h3>
                <p className="text-muted-foreground">모든 아이돌 중에서 선택</p>
                <Badge variant="outline">{allIdols.length}명</Badge>
              </div>
            </Card>

            <Card
              className="p-8 glass-dark border-white/10 card-hover cursor-pointer text-center"
              onClick={() => startTournament('Male')}
            >
              <div className="space-y-4">
                <div className="text-6xl">👨</div>
                <h3 className="text-2xl font-bold gradient-text">남성</h3>
                <p className="text-muted-foreground">남성 아이돌만</p>
                <Badge variant="outline">
                  {allIdols.filter(i => i.gender === 'Male').length}명
                </Badge>
              </div>
            </Card>

            <Card
              className="p-8 glass-dark border-white/10 card-hover cursor-pointer text-center"
              onClick={() => startTournament('Female')}
            >
              <div className="space-y-4">
                <div className="text-6xl">👩</div>
                <h3 className="text-2xl font-bold gradient-text">여성</h3>
                <p className="text-muted-foreground">여성 아이돌만</p>
                <Badge variant="outline">
                  {allIdols.filter(i => i.gender === 'Female').length}명
                </Badge>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Tournament phase
  if (gamePhase === 'tournament' && currentPair) {
    return (
      <div className="min-h-screen bg-gradient-background p-4">
        <div className="max-w-6xl mx-auto space-y-8 pt-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold gradient-text">
              💕 하트 배틀
            </h1>
            
            <div className="flex items-center justify-center gap-6">
              <Badge variant="outline" className="px-4 py-2">
                {getTournamentRoundName()}
              </Badge>
              <Progress value={getCurrentProgress()} className="w-48" />
            </div>
            
            <p className="text-muted-foreground">
              더 마음이 가는 아이돌을 선택해주세요
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto relative">
            {/* Left Idol */}
            <Card 
              className={`relative p-6 glass-dark border-white/10 card-hover cursor-pointer transition-all duration-500 ${
                heartEffect === 'left' ? 'scale-105 border-pink-500/50 shadow-pink-500/25 shadow-xl' : ''
              }`}
              onClick={() => handleChoice(currentPair[0], 'left')}
            >
              {heartEffect === 'left' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
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
                
                <div className="text-center">
                  <h3 className="text-2xl font-bold gradient-text">{currentPair[0].name}</h3>
                </div>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full border-pink-500/50 text-pink-400 hover:bg-pink-500/20"
                >
                  💕 선택하기
                </Button>
              </div>
            </Card>

            {/* VS Divider */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
              <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Right Idol */}
            <Card 
              className={`relative p-6 glass-dark border-white/10 card-hover cursor-pointer transition-all duration-500 ${
                heartEffect === 'right' ? 'scale-105 border-pink-500/50 shadow-pink-500/25 shadow-xl' : ''
              }`}
              onClick={() => handleChoice(currentPair[1], 'right')}
            >
              {heartEffect === 'right' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
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
                
                <div className="text-center">
                  <h3 className="text-2xl font-bold gradient-text">{currentPair[1].name}</h3>
                </div>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full border-pink-500/50 text-pink-400 hover:bg-pink-500/20"
                >
                  💕 선택하기
                </Button>
              </div>
            </Card>
          </div>

          <Card className="p-4 glass-dark border-white/10 max-w-2xl mx-auto">
            <div className="text-center space-y-2">
              <h3 className="font-bold text-sm text-muted-foreground">토너먼트 진행 상황</h3>
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
  }

  // Preview & Minting phase
  if ((gamePhase === 'preview' || gamePhase === 'minting' || gamePhase === 'complete') && finalWinner) {
    return (
      <div className="min-h-screen bg-gradient-background p-4 flex items-center justify-center">
        <Card className="max-w-2xl w-full p-8 glass-dark border-white/10">
          <div className="space-y-6 text-center">
            <div className="text-6xl">🎉</div>
            <h1 className="text-4xl font-bold gradient-text">
              Your Ideal AIDOL!
            </h1>
            
            <div className="aspect-square max-w-md mx-auto rounded-xl overflow-hidden bg-gradient-primary/20">
              <img 
                src={finalWinner.profile_image}
                alt={finalWinner.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-bold gradient-text">{finalWinner.name}</h2>
              {finalWinner.personality && (
                <Badge variant="outline" className="text-lg px-4 py-1">
                  {finalWinner.personality}
                </Badge>
              )}
            </div>
            
            {gamePhase === 'preview' && (
              <div className="flex gap-4 justify-center pt-4">
                <Button
                  onClick={() => setGamePhase('gender-select')}
                  variant="outline"
                  size="lg"
                >
                  다시 선택
                </Button>
                <Button
                  onClick={handleConfirmPick}
                  size="lg"
                  className="btn-modern"
                  disabled={isMinting}
                >
                  확정하기
                </Button>
              </div>
            )}
            
            {gamePhase === 'minting' && (
              <div className="space-y-4">
                <div className="animate-spin mx-auto w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                <p className="text-muted-foreground">저장 중...</p>
              </div>
            )}
            
            {gamePhase === 'complete' && (
              <div className="space-y-4">
                <div className="text-5xl">✅</div>
                <p className="text-xl text-primary">완료!</p>
                <p className="text-muted-foreground">보관함으로 이동합니다...</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return null;
};

export default PickSimplified;
