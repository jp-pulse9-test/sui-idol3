import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface IdolPreset {
  id: number;
  name: string;
  personality: string;
  description: string;
  profile_image: string;
  persona_prompt: string;
}

type GamePhase = 'loading' | 'worldcup' | 'result';

const Pick = () => {
  const [gamePhase, setGamePhase] = useState<GamePhase>('loading');
  const [idols, setIdols] = useState<IdolPreset[]>([]);
  const [currentPair, setCurrentPair] = useState<[IdolPreset, IdolPreset] | null>(null);
  const [bracket, setBracket] = useState<IdolPreset[]>([]);
  const [currentRound, setCurrentRound] = useState<IdolPreset[]>([]);
  const [roundNumber, setRoundNumber] = useState(1);
  const [finalWinner, setFinalWinner] = useState<IdolPreset | null>(null);
  const navigate = useNavigate();

  // Fetch idols from Supabase
  const fetchIdolsFromDB = async (): Promise<IdolPreset[]> => {
    try {
      const { data, error } = await supabase
        .from('idols')
        .select('*')
        .order('id');
      
      if (error) {
        console.error('Error fetching idols:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Failed to fetch idols from database:', error);
      toast.error('아이돌 데이터를 불러오는데 실패했습니다.');
      return [];
    }
  };

  // Generate preset idols if none exist
  const generatePresetIdols = async (): Promise<boolean> => {
    try {
      toast.info('202명의 아이돌 데이터를 생성하고 있습니다... 잠시만 기다려주세요.');
      
      const { data, error } = await supabase.functions.invoke('generate-preset-idols');
      
      if (error) {
        console.error('Error generating preset idols:', error);
        throw error;
      }
      
      toast.success('아이돌 데이터 생성이 완료되었습니다!');
      return true;
    } catch (error) {
      console.error('Failed to generate preset idols:', error);
      toast.error('아이돌 데이터 생성에 실패했습니다.');
      return false;
    }
  };

  // Initialize game data
  useEffect(() => {
    const initializeGame = async () => {
      let idolData = await fetchIdolsFromDB();
      
      // If no idols exist, generate them
      if (idolData.length === 0) {
        const generated = await generatePresetIdols();
        if (generated) {
          idolData = await fetchIdolsFromDB();
        }
      }
      
      if (idolData.length > 0) {
        setIdols(idolData);
        // Randomly select 16 idols for tournament
        const shuffled = [...idolData].sort(() => Math.random() - 0.5);
        const selected16 = shuffled.slice(0, 16);
        
        setBracket(selected16);
        setCurrentRound(selected16);
        setCurrentPair([selected16[0], selected16[1]]);
        setGamePhase('worldcup');
      } else {
        toast.error('아이돌 데이터를 불러올 수 없습니다.');
      }
    };

    initializeGame();
  }, []);

  // Handle idol selection
  const selectIdol = (selectedIdol: IdolPreset) => {
    if (!currentPair) return;

    const currentIndex = currentRound.indexOf(currentPair[0]);
    const nextRound = [...currentRound];
    
    // Remove the current pair and add winner to next round
    nextRound.splice(currentIndex, 2, selectedIdol);
    
    // Check if current round is complete
    const pairsRemaining = Math.floor(nextRound.length / 2);
    
    if (currentIndex + 2 >= currentRound.length) {
      // Current round complete
      if (pairsRemaining === 1) {
        // Tournament complete
        setFinalWinner(selectedIdol);
        setGamePhase('result');
        return;
      } else {
        // Start next round
        setCurrentRound(nextRound.slice(0, pairsRemaining));
        setCurrentPair([nextRound[0], nextRound[1]]);
        setRoundNumber(prev => prev + 1);
      }
    } else {
      // Continue current round
      const nextPairIndex = currentIndex + 2;
      setCurrentPair([currentRound[nextPairIndex], currentRound[nextPairIndex + 1]]);
      setCurrentRound(nextRound);
    }
  };

  // Save selected idol and navigate to vault
  const handleFinalSelection = () => {
    if (!finalWinner) return;

    // Save selected idol to localStorage
    localStorage.setItem('selectedIdol', JSON.stringify({
      id: finalWinner.id,
      name: finalWinner.name,
      personality: finalWinner.personality,
      image: finalWinner.profile_image,
      persona_prompt: finalWinner.persona_prompt
    }));

    toast.success(`${finalWinner.name}를 선택했습니다!`);
    navigate('/vault');
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

  const getTotalMatches = () => {
    return Math.floor(currentRound.length / 2);
  };

  const getCurrentMatchNumber = () => {
    if (!currentPair) return 0;
    const currentIndex = currentRound.indexOf(currentPair[0]);
    return Math.floor(currentIndex / 2) + 1;
  };

  // Loading phase
  if (gamePhase === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="text-center space-y-6">
          <LoadingSpinner size="lg" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold gradient-text">아이돌 데이터 로딩 중...</h2>
            <p className="text-muted-foreground">잠시만 기다려주세요</p>
          </div>
        </div>
      </div>
    );
  }

  // Result phase
  if (gamePhase === 'result' && finalWinner) {
    return (
      <div className="min-h-screen bg-gradient-background p-4">
        <div className="max-w-4xl mx-auto text-center space-y-8 pt-20">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold gradient-text animate-pulse">
              🏆 우승자 🏆
            </h1>
            <p className="text-xl text-muted-foreground">
              축하합니다! 당신이 선택한 아이돌입니다
            </p>
          </div>

          <Card className="p-8 glass-dark border-white/10 max-w-md mx-auto">
            <div className="space-y-6">
              <div className="relative">
                <div className="w-40 h-40 mx-auto rounded-full overflow-hidden bg-gradient-primary/20 border-4 border-primary/30">
                  <img 
                    src={finalWinner.profile_image}
                    alt={finalWinner.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${finalWinner.name}`;
                    }}
                  />
                </div>
                <div className="absolute -top-2 -right-2 text-4xl animate-bounce">
                  👑
                </div>
              </div>
              
              <div className="space-y-3">
                <h2 className="text-3xl font-bold gradient-text">{finalWinner.name}</h2>
                <Badge variant="secondary" className="text-sm px-4 py-1">
                  {finalWinner.personality}
                </Badge>
                <p className="text-muted-foreground leading-relaxed">
                  {finalWinner.description}
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <Button
              onClick={handleFinalSelection}
              size="lg"
              className="min-w-64 text-xl py-4 bg-gradient-primary hover:opacity-90"
            >
              ✨ {finalWinner.name}와 함께 시작하기 ✨
            </Button>
            
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="lg"
                className="bg-card/80 backdrop-blur-sm"
              >
                다시 선택하기
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                size="lg"
                className="bg-card/80 backdrop-blur-sm"
              >
                홈으로 돌아가기
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tournament phase
  if (gamePhase === 'worldcup' && currentPair) {
    return (
      <div className="min-h-screen bg-gradient-background p-4">
        <div className="max-w-6xl mx-auto space-y-8 pt-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold gradient-text">
              🏆 아이돌 월드컵
            </h1>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Badge variant="secondary" className="px-4 py-2">
                {getTournamentRoundName()}
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                {getCurrentMatchNumber()} / {getTotalMatches()} 경기
              </Badge>
            </div>
            <Progress 
              value={(getCurrentMatchNumber() / getTotalMatches()) * 100} 
              className="w-64 mx-auto h-2" 
            />
          </div>

          {/* VS Section */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-8">
              누가 더 매력적인가요?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {currentPair.map((idol, index) => (
                <Card
                  key={idol.id}
                  className="p-6 glass-dark border-white/10 card-hover cursor-pointer group transition-all duration-300"
                  onClick={() => selectIdol(idol)}
                >
                  <div className="space-y-6">
                    <div className="relative">
                      <div className="w-48 h-48 mx-auto rounded-full overflow-hidden bg-gradient-primary/20 group-hover:scale-105 transition-transform duration-300">
                        <img 
                          src={idol.profile_image}
                          alt={idol.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${idol.name}`;
                          }}
                        />
                      </div>
                      {index === 0 && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-2xl animate-pulse">
                          ⚡
                        </div>
                      )}
                      {index === 1 && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-2xl animate-pulse">
                          🔥
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold gradient-text group-hover:scale-105 transition-transform">
                        {idol.name}
                      </h3>
                      <Badge variant="secondary" className="text-sm">
                        {idol.personality}
                      </Badge>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {idol.description}
                      </p>
                    </div>
                    
                    <Button 
                      size="lg"
                      className="w-full group-hover:bg-primary/90 transition-colors"
                    >
                      선택하기
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="text-6xl mt-8 animate-pulse">
              VS
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center space-x-4 pt-8">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              size="lg"
              className="bg-card/80 backdrop-blur-sm border-border hover:bg-card"
            >
              홈으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Pick;