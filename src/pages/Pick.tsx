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
import SecurityNotice from "@/components/SecurityNotice";
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
  Gender?: string; // Add Gender property
}

type GamePhase = 'loading' | 'gender-select' | 'personality-test' | 'tournament' | 'result' | 'preview' | 'minting';

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
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | ''>('');
  const [filteredIdols, setFilteredIdols] = useState<IdolPreset[]>([]);
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
  const [showSecurityNotice, setShowSecurityNotice] = useState(false);
  const navigate = useNavigate();
  const { mintIdolCard } = usePhotoCardMinting();
  const { isConnected, walletAddress } = useWallet();
  const { isAuthenticated } = useAuthGuard('/auth', false);

  // Gender normalization helpers
  const normalizeGender = (g?: string) => (g ?? '').trim().toLowerCase();
  const isDBMale = (g?: string) => {
    const n = normalizeGender(g);
    return ['boy','male','man','m','남자','소년'].includes(n);
  };
  const isDBFemale = (g?: string) => {
    const n = normalizeGender(g);
    return ['girl','female','woman','f','여자','소녀'].includes(n);
  };

  // Fetch idols from Supabase
  const fetchIdolsFromDB = async (): Promise<IdolPreset[]> => {
    try {
      console.log('Fetching idols from database...');
      
      // 보안 강화: 인증된 사용자는 전체 데이터, 미인증 사용자는 공개 뷰 사용
      const { data: session } = await supabase.auth.getSession();
      
      let query;
      if (session?.session?.user) {
        // 인증된 사용자: 전체 데이터 접근
        query = supabase
          .from('idols')
          .select('*')
          .order('id');
      } else {
        // 미인증 사용자: 제한된 공개 데이터만 접근
        query = supabase
          .from('idols_public')
          .select('*')
          .order('id');
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching idols:', error);
        throw error;
      }
      
      console.log('Successfully fetched', data?.length || 0, 'idols');
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
      toast.error('아이돌 데이터 생성에 실패했습니다. 샘플 데이터로 진행합니다.');
      
      // Create sample idol data as fallback
      const sampleIdols = Array.from({ length: 10 }, (_, i) => ({
        name: `아이돌${i + 1}`,
        Gender: i % 2 === 0 ? 'female' : 'male',
        Category: 'sample',
        Concept: 'cute',
        personality: `성격${i + 1}`,
        description: `설명${i + 1}`,
        profile_image: '/placeholder.svg',
        persona_prompt: `아이돌 ${i + 1}의 페르소나`
      }));
      
      // Insert sample data into database
      const { error: insertError } = await supabase
        .from('idols')
        .insert(sampleIdols);
        
      if (insertError) {
        console.error('Failed to insert sample data:', insertError);
        return false;
      }
      
      return true;
    }
  };

  // Initialize game data
  useEffect(() => {
    const initializeGame = async () => {
      console.log('Starting idol data fetch...');
      
      // 먼저 아이돌 데이터를 가져와보기 (인증 없이도 시도)
      let idolData = await fetchIdolsFromDB();
      console.log('Fetched idol data:', idolData?.length || 0, 'idols');
      
      // 아이돌 데이터가 있다면 성별 선택부터 진행 (보안: 기본 정보는 공개)
      if (idolData.length >= 10) {
        console.log('Sufficient idol data found, proceeding to gender select');
        setIdols(idolData);
        setGamePhase('gender-select');
        return;
      }

      // 데이터가 부족한 경우 인증 후 전체 데이터 접근 시도
      if (!isAuthenticated && idolData.length < 10) {
        console.log('Limited data available, authentication recommended for full access');
        setShowSecurityNotice(true);
        setIdols(idolData);
        setGamePhase('gender-select');
        return;
      }
      
      // 인증된 사용자인 경우 데이터 생성 시도
      if (idolData.length === 0) {
        console.log('No idols found, generating preset idols...');
        const generated = await generatePresetIdols();
        if (generated) {
          console.log('Generation completed, refetching data...');
          idolData = await fetchIdolsFromDB();
          console.log('After generation, idol count:', idolData?.length || 0);
        }
      }
      
      if (idolData.length > 0) {
        console.log('Setting idols and moving to gender select');
        setIdols(idolData);
        setGamePhase('gender-select');
      } else {
        console.log('Still no idol data, continuing with empty data');
        toast.error('아이돌 데이터를 불러올 수 없습니다.');
        setGamePhase('gender-select'); // Continue to gender select even with no data
      }
    };

    // 인증 상태와 상관없이 일단 시도
    initializeGame();
  }, [navigate]); // isAuthenticated 의존성 제거

  const handleGenderSelect = (gender: 'male' | 'female') => {
    setSelectedGender(gender);
    setPersonalityData(prev => ({ ...prev, gender }));
    
    // Filter idols by selected gender (robust, handles Boy/Girl/Male/Female etc.)
    const filtered = idols.filter(idol => 
      gender === 'male' ? isDBMale(idol.Gender) : isDBFemale(idol.Gender)
    );
    
    console.log(`Selected ${gender}. Total idols: ${idols.length}, filtered: ${filtered.length}`);
    console.log('Gender values present in DB:', [...new Set(idols.map(i => i.Gender))]);
    
    setFilteredIdols(filtered);
    
    if (filtered.length === 0) {
      toast.error(`${gender === 'male' ? '소년' : '소녀'} 아이돌 데이터가 없습니다. 관리자에게 문의해주세요.`);
      return;
    }
    
    setGamePhase('personality-test');
  };
  const handlePersonalityComplete = (scores: { extroversion: number; intuition: number; feeling: number; judging: number }) => {
    setPersonalityData(prev => ({
      ...prev,
      ...scores
    }));
    setGamePhase('tournament');
  };

  const handleBackToGender = () => {
    setGamePhase('gender-select');
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

  const handleConfirmPick = async () => {
    if (!finalWinner) return;
    
    if (!isConnected) {
      toast.error('지갑을 먼저 연결해주세요!');
      navigate('/auth');
      return;
    }

    setIsMinting(true);
    
    try {
      console.log('아이돌 카드 민팅 시작:', finalWinner);
      
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

  // Gender select phase
  if (gamePhase === 'gender-select') {
    // Get sample idols for preview
    const maleIdols = idols.filter(idol => isDBMale(idol.Gender)).slice(0, 3);
    const femaleIdols = idols.filter(idol => isDBFemale(idol.Gender)).slice(0, 3);

    return (
      <div className="min-h-screen bg-gradient-background p-4">
        <div className="max-w-4xl mx-auto space-y-8 pt-12">
          {/* 보안 알림 */}
          {showSecurityNotice && !isAuthenticated && (
            <SecurityNotice 
              type="limited-access" 
              onDismiss={() => setShowSecurityNotice(false)}
            />
          )}
          
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold gradient-text mb-8">
              💫 성별 선택
            </h1>
            <p className="text-muted-foreground text-lg">
              어떤 아이돌과 함께하고 싶나요?
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* 소년 선택 */}
            <Card 
              className="p-8 glass-dark border-white/10 card-hover cursor-pointer transition-all duration-300 hover:scale-105"
              onClick={() => handleGenderSelect('male')}
            >
              <div className="text-center space-y-6">
                <div className="text-6xl mb-4">👦</div>
                <h2 className="text-2xl font-bold gradient-text">소년 아이돌</h2>
                <p className="text-muted-foreground">매력적인 소년 아이돌들과 함께해요</p>
                
                {/* Preview images */}
                <div className="flex justify-center gap-2 mt-4">
                  {maleIdols.map((idol, index) => (
                    <div key={idol.id} className="w-12 h-12 rounded-full overflow-hidden bg-gradient-primary/20">
                      <img 
                        src={idol.profile_image} 
                        alt={idol.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" size="lg" className="w-full mt-4">
                  소년 선택
                </Button>
              </div>
            </Card>

            {/* 소녀 선택 */}
            <Card 
              className="p-8 glass-dark border-white/10 card-hover cursor-pointer transition-all duration-300 hover:scale-105"
              onClick={() => handleGenderSelect('female')}
            >
              <div className="text-center space-y-6">
                <div className="text-6xl mb-4">👧</div>
                <h2 className="text-2xl font-bold gradient-text">소녀 아이돌</h2>
                <p className="text-muted-foreground">사랑스러운 소녀 아이돌들과 함께해요</p>
                
                {/* Preview images */}
                <div className="flex justify-center gap-2 mt-4">
                  {femaleIdols.map((idol, index) => (
                    <div key={idol.id} className="w-12 h-12 rounded-full overflow-hidden bg-gradient-primary/20">
                      <img 
                        src={idol.profile_image} 
                        alt={idol.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" size="lg" className="w-full mt-4">
                  소녀 선택
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Personality test phase
  if (gamePhase === 'personality-test') {
    return (
      <PersonalityTest 
        onComplete={handlePersonalityComplete}
        onSkip={handlePersonalitySkip}
        onBack={handleBackToGender}
      />
    );
  }

  // Tournament battle phase  
  if (gamePhase === 'tournament') {
    // 반드시 필터링된 아이돌만 사용, 없으면 에러 처리
    if (filteredIdols.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-background flex items-center justify-center">
          <Card className="p-8 glass-dark border-white/10 text-center">
            <h2 className="text-xl font-bold text-destructive">선택한 성별의 아이돌이 없습니다</h2>
            <p className="text-muted-foreground mt-2">다시 성별을 선택해주세요.</p>
            <Button onClick={handleBackToGender} className="mt-4">
              성별 선택으로 돌아가기
            </Button>
          </Card>
        </div>
      );
    }

    return (
      <TournamentBattle
        idols={filteredIdols}
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
        onBack={handleBackToPersonality}
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