import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { supabase } from "@/integrations/supabase/client";
import PersonalityTest from "@/components/PersonalityTest";
import TournamentBattle from "@/components/TournamentBattle";
import IdolPreview from "@/components/IdolPreview";
import { usePhotoCardMinting } from "@/services/photocardMintingStable";
import { useWallet } from "@/hooks/useWallet";
import { useAuthGuard } from "@/hooks/useAuthGuard";

interface IdolPreset {
  id: number;
  name: string;
  personality: string;
  description: string;
  profile_image: string;
  persona_prompt: string;
}

type GamePhase = 'loading' | 'personality-test' | 'tournament' | 'result' | 'preview' | 'minting';

interface PersonalityTestData {
  gender: 'male' | 'female' | '';
  testType: 'quick' | 'skip' | 'oneclick';
  extroversion: number; // E/I
  intuition: number;    // N/S  
  feeling: number;      // F/T
  judging: number;      // J/P
  selectedAnswers: number[];
}

const Pick = () => {
  const [gamePhase, setGamePhase] = useState<GamePhase>('loading');
  const [idols, setIdols] = useState<IdolPreset[]>([]);
  const [finalWinner, setFinalWinner] = useState<IdolPreset | null>(null);
  const [personalityData, setPersonalityData] = useState<PersonalityTestData>({
    gender: '',
    testType: 'quick',
    extroversion: 50,
    intuition: 50,
    feeling: 50,
    judging: 50,
    selectedAnswers: []
  });
  const [isMinting, setIsMinting] = useState(false);
  const navigate = useNavigate();
  const { mintIdolCard } = usePhotoCardMinting();
  const { isConnected, walletAddress } = useWallet();
  const { isAuthenticated } = useAuthGuard('/auth', false);

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
      // Check if user is authenticated before fetching idol data
      if (!isAuthenticated) {
        toast.error('아이돌 데이터에 접근하려면 지갑 연결이 필요합니다.');
        navigate('/auth');
        return;
      }

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
        setGamePhase('personality-test');
      } else {
        toast.error('아이돌 데이터를 불러올 수 없습니다.');
      }
    };

    // Only run if authentication state is determined
    if (isAuthenticated !== undefined) {
      initializeGame();
    }
  }, [isAuthenticated, navigate]);

  const handlePersonalityComplete = (scores: { extroversion: number; intuition: number; feeling: number; judging: number }) => {
    setPersonalityData(prev => ({
      ...prev,
      ...scores
    }));
    setGamePhase('tournament');
  };

  const handlePersonalitySkip = () => {
    setGamePhase('tournament');
  };

  const handleTournamentComplete = (winner: IdolPreset) => {
    setFinalWinner(winner);
    setGamePhase('preview');
  };

  const handleBackToPersonality = () => {
    setGamePhase('personality-test');
  };

  const handleBackToTournament = () => {
    setGamePhase('tournament');
  };

  const handleConfirmPick = async () => {
    if (!finalWinner) return;
    
    if (!isConnected) {
      toast.error('지갑을 먼저 연결해주세요!');
      navigate('/auth');
      return;
    }

    setIsMinting(true);
    
    try {
      // 아이돌 카드 민팅
      await mintIdolCard({
        id: finalWinner.id,
        name: finalWinner.name,
        personality: finalWinner.personality,
        image: finalWinner.profile_image,
        persona_prompt: finalWinner.persona_prompt,
      });

      // Save selection to localStorage
      localStorage.setItem('selectedIdol', JSON.stringify({
        id: finalWinner.id,
        name: finalWinner.name,
        personality: finalWinner.personality,
        image: finalWinner.profile_image,
        persona_prompt: finalWinner.persona_prompt,
        personalityData: personalityData,
        walletAddress: walletAddress,
        mintedAt: new Date().toISOString()
      }));
      
      toast.success('IdolCard NFT 민팅이 완료되었습니다!');
      setTimeout(() => navigate('/vault'), 2000);
    } catch (error) {
      console.error('민팅 실패:', error);
      toast.error('민팅에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsMinting(false);
    }
  };

  // Loading screen
  if (gamePhase === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <Card className="p-8 glass-dark border-white/10 text-center">
          <div className="space-y-4">
            <LoadingSpinner />
            <h2 className="text-xl font-bold gradient-text">아이돌 데이터 로딩 중...</h2>
            <p className="text-muted-foreground">잠시만 기다려주세요</p>
          </div>
        </Card>
      </div>
    );
  }

  // Personality test phase
  if (gamePhase === 'personality-test') {
    return (
      <PersonalityTest 
        onComplete={handlePersonalityComplete}
        onSkip={handlePersonalitySkip}
      />
    );
  }

  // Tournament battle phase  
  if (gamePhase === 'tournament') {
    return (
      <TournamentBattle
        idols={idols}
        onComplete={handleTournamentComplete}
        onBack={handleBackToPersonality}
      />
    );
  }

  // Preview phase
  if (gamePhase === 'preview' && finalWinner) {
    return (
      <IdolPreview
        selectedIdol={finalWinner}
        onConfirm={handleConfirmPick}
        onBack={handleBackToTournament}
        isMinting={isMinting}
      />
    );
  }

  // Fallback
  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-bold">게임 상태 오류</h2>
        <Button onClick={() => navigate('/')} className="mt-4">
          홈으로 돌아가기
        </Button>
      </div>
    </div>
  );
};

export default Pick;