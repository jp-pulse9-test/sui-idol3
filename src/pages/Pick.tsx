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

type GamePhase = 'loading' | 'selection' | 'result';

const Pick = () => {
  const [gamePhase, setGamePhase] = useState<GamePhase>('loading');
  const [idols, setIdols] = useState<IdolPreset[]>([]);
  const [selectedIdols, setSelectedIdols] = useState<IdolPreset[]>([]);
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

  // Generate idol photos
  const generateIdolPhotos = async (): Promise<void> => {
    try {
      toast.info('아이돌 사진을 생성하고 있습니다... 잠시만 기다려주세요.');
      
      const { data, error } = await supabase.functions.invoke('generate-idol-photos');
      
      if (error) {
        console.error('Error generating idol photos:', error);
        throw error;
      }
      
      toast.success(`아이돌 사진 생성이 완료되었습니다! 성공: ${data.successful}명, 실패: ${data.failed}명`);
      
      // Refresh idol data
      const updatedIdols = await fetchIdolsFromDB();
      if (updatedIdols.length > 0) {
        setIdols(updatedIdols);
        // Re-select 3 idols for display
        const shuffled = [...updatedIdols].sort(() => Math.random() - 0.5);
        const selected3 = shuffled.slice(0, 3);
        setSelectedIdols(selected3);
      }
    } catch (error) {
      console.error('Failed to generate idol photos:', error);
      toast.error('아이돌 사진 생성에 실패했습니다.');
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
        // Randomly select 3 idols for selection
        const shuffled = [...idolData].sort(() => Math.random() - 0.5);
        const selected3 = shuffled.slice(0, 3);
        
        setSelectedIdols(selected3);
        setGamePhase('selection');
      } else {
        toast.error('아이돌 데이터를 불러올 수 없습니다.');
      }
    };

    initializeGame();
  }, []);

  // Handle idol selection
  const selectIdol = (selectedIdol: IdolPreset) => {
    setFinalWinner(selectedIdol);
    setGamePhase('result');
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

  // Selection phase
  if (gamePhase === 'selection' && selectedIdols.length === 3) {
    return (
      <div className="min-h-screen bg-gradient-background p-4">
        <div className="max-w-6xl mx-auto space-y-8 pt-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold gradient-text">
              💕 최애 아이돌 선택
            </h1>
            <p className="text-xl text-muted-foreground">
              3명 중에서 가장 마음에 드는 아이돌을 선택해주세요
            </p>
          </div>

          {/* Selection Grid */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {selectedIdols.map((idol, index) => (
              <Card
                key={idol.id}
                className="p-6 glass-dark border-white/10 card-hover cursor-pointer group transition-all duration-300"
                onClick={() => selectIdol(idol)}
              >
                <div className="space-y-6">
                  <div className="relative">
                    <div className="w-40 h-40 mx-auto rounded-full overflow-hidden bg-gradient-primary/20 group-hover:scale-105 transition-transform duration-300">
                      <img 
                        src={idol.profile_image}
                        alt={idol.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${idol.name}`;
                        }}
                      />
                    </div>
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-2xl animate-pulse">
                      {index === 0 && "⭐"}
                      {index === 1 && "💖"}
                      {index === 2 && "✨"}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold gradient-text group-hover:scale-105 transition-transform">
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

          {/* Navigation */}
          <div className="flex justify-center space-x-4 pt-8">
            <Button
              onClick={generateIdolPhotos}
              size="lg"
              className="bg-gradient-primary hover:opacity-90"
            >
              📸 아이돌 사진 생성하기
            </Button>
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