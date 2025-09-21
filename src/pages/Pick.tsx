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
import { useSuiBalance } from "@/services/suiBalanceServiceNew";

interface IdolPreset {
  id: number;
  name: string;
  personality: string;
  description: string;
  profile_image: string;
  persona_prompt: string;
}

type GamePhase = 'loading' | 'gender-select' | 'personality-test' | 'tournament' | 'result' | 'preview' | 'minting';

interface PersonalityTestData {
  gender: 'male' | 'female' | '';
  testType: 'quick' | 'skip' | 'oneclick';
  extroversion: number;
  intuition: number;
  feeling: number;
  judging: number;
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
  const { balance: suiBalance, isLoading: isBalanceLoading, error: balanceError } = useSuiBalance();

  // Fetch idols from Supabase idols table
  const fetchIdolsFromDB = async (): Promise<IdolPreset[]> => {
    try {
      console.log('🔍 Fetching idols from idols table...');

      const { data, error } = await supabase
        .from('idols')
        .select('id, name, personality, description, profile_image, persona_prompt');

      if (error) {
        console.error('❌ Database query error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('⚠️ No idols found in database');
        return [];
      }

      console.log('✅ Successfully fetched idols:', data.length);
      console.log('📊 Sample idol data:', data[0]);

      return data.map((idol: any): IdolPreset => ({
        id: idol.id,
        name: idol.name,
        personality: idol.personality || '',
        description: idol.description || '',
        profile_image: idol.profile_image || '',
        persona_prompt: idol.persona_prompt || ''
      }));

    } catch (error) {
      console.error('❌ Failed to fetch idols:', error);
                              toast.error('Error occurred during RLS policy creation');
      return [];
    }
  };

  // Insert sample data if table is empty
  const insertSampleData = async () => {
    try {
      console.log('🏗️ Inserting sample data to idols table...');

      const sampleData = [
        {
          name: 'Seojun',
          Gender: 'Male',
          Category: 'Main Vocalist',
          Concept: 'Charismatic',
          personality: 'Charismatic',
          description: 'A leader with intense charm who dominates the stage. A perfectionist with a warm heart.',
          profile_image: '/placeholder-male-1.jpg',
          persona_prompt: 'You are Seojun. A charismatic and perfectionist K-POP idol who shows warm and sincere affection to fans.'
        },
        {
          name: 'Haeun',
          Gender: 'Female',
          Category: 'Main Dancer',
          Concept: 'Bright',
          personality: 'Bright and positive',
          description: 'An energetic bundle of joy who makes everyone happy with her sunshine-like smile. Pure and passionate charm.',
          profile_image: '/placeholder-female-1.jpg',
          persona_prompt: 'You are Haeun. A bright and positive K-POP idol who delivers happy energy to fans.'
        },
        {
          name: 'Minho',
          Gender: 'Male',
          Category: 'Lead Rapper',
          Concept: 'Mysterious',
          personality: 'Mysterious',
          description: 'An artist with unpredictable deep charm. A boy whose emotional and philosophical aspects stand out.',
          profile_image: '/placeholder-male-2.jpg',
          persona_prompt: 'You are Minho. A mysterious K-POP idol with deep emotions.'
        },
        {
          name: 'Yoona',
          Gender: 'Female',
          Category: 'Visual',
          Concept: 'Elegant',
          personality: 'Elegant and sophisticated',
          description: 'Perfect visual combining classic beauty with modern sensibility. Hidden strength within elegance.',
          profile_image: '/placeholder-female-2.jpg',
          persona_prompt: 'You are Yoona. An elegant and sophisticated K-POP idol who combines classic charm with modern sensibility.'
        },
        {
          name: 'Taemin',
          Gender: 'Male',
          Category: 'Main Dancer',
          Concept: 'Artistic',
          personality: 'Creative and artistic',
          description: 'A performer who turns the stage into artwork with original ideas and outstanding artistic sense.',
          profile_image: '/placeholder-male-3.jpg',
          persona_prompt: 'You are Taemin. A creative and artistic K-POP idol who captivates fans with unique worldview and outstanding performance.'
        }
      ];

      console.log('Inserting data:', sampleData);

      const { data, error } = await supabase
        .from('idols')
        .insert(sampleData)
        .select();

      if (error) {
        console.error('❌ Failed to insert sample data:', error);
        toast.error(`Data insertion failed: ${error.message}`);
        return false;
      }

      console.log('✅ Sample data inserted successfully:', data);
      toast.success(`✅ ${data.length} idol data entries successfully inserted!`);
      return true;

    } catch (error) {
      console.error('❌ Error inserting sample data:', error);
      toast.error('An error occurred during data insertion.');
      return false;
    }
  };

  // Initialize idol data from database ONLY
  useEffect(() => {
    const initializeIdols = async () => {
      console.log('🚀 Fetching idols from database (idols table only)...');

      // Try to fetch from database
      const idolData = await fetchIdolsFromDB();

      if (idolData.length > 0) {
        console.log('✅ Idols loaded from database:', idolData.length);
        setIdols(idolData);
        setGamePhase('personality-test');
      } else {
        console.error('❌ No idols found in database');
        // Stay in loading state - DO NOT use fallback data
        // User must fix database issue
      }
    };

    initializeIdols();
  }, []);

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

  const handleBackToPersonality = () => {
    setGamePhase('personality-test');
  };

  const handleTournamentComplete = (winner: IdolPreset) => {
    setFinalWinner(winner);
    setGamePhase('preview');
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
      console.error('Confirmation failed:', error);
      toast.error('Confirmation failed. Please try again.');
    } finally {
      setIsMinting(false);
    }
  };

  // Loading screen - Database connection required
  if (gamePhase === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <Card className="p-8 glass-dark border-white/10 text-center max-w-2xl">
          <div className="space-y-4">
            <LoadingSpinner />
            <h2 className="text-xl font-bold gradient-text">Loading from idols table...</h2>
            <p className="text-muted-foreground">Database connection required</p>

            <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-left">
              <h3 className="font-bold text-red-400 mb-2">⚠️ Database Required</h3>
              <p className="text-sm text-red-300">
                This application requires data from the 'idols' table in Supabase.
                Sample/fallback data is NOT allowed.
              </p>
            </div>

            <div className="mt-6 space-y-2">
              <Button
                onClick={async () => {
                  console.log('🧪 Testing Supabase connection...');
                  
                  // 1. 기본 연결 테스트 - auth 상태 확인
                  try {
                    console.log('1. Testing basic Supabase connection...');
                    const { data: { session }, error: authError } = await supabase.auth.getSession();
                    
                    if (authError) {
                      console.log('Auth error (this is OK for anonymous access):', authError);
                    }
                    
                    console.log('✅ Basic Supabase connection OK');
                    toast.success('Basic Supabase connection OK');
                  } catch (err) {
                    console.error('❌ Connection test failed:', err);
                    toast.error('Connection test failed: ' + (err as Error).message);
                    return;
                  }

                  // 2. idols 테이블 확인
                  console.log('2. Testing idols table...');
                  const { data, error } = await supabase
                    .from('idols')
                    .select('id, name, personality, description, profile_image');

                  console.log('🧪 Query result:', { data, error });

                  if (error) {
                    console.error('❌ idols table error:', error);
                    console.error('Error details:', JSON.stringify(error, null, 2));
                    
                    // RLS 정책 문제일 가능성
                    if (error.message.includes('RLS') || error.message.includes('policy') || error.message.includes('permission') || error.code === 'PGRST116') {
                      toast.error('🔒 RLS policy issue detected! SQL solution provided in console.');
                      console.log('� RLS Policy Issue - This is the most common problem!');
                    }

                    // 테이블이 없을 가능성
                    if (error.message.includes('does not exist') || error.message.includes('relation')) {
                      toast.error('idols table does not exist. Create the table first.');
                    }

                    // Show SQL to create and populate table
                    const sql = `
-- ⚠️ REQUIRED: Run this SQL in Supabase SQL Editor

-- 1. First, check if RLS policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'idols';

-- 2. Drop existing policies if any (to recreate)
DROP POLICY IF EXISTS "Allow public read access" ON public.idols;

-- 3. Create proper RLS policy for public read access
CREATE POLICY "Allow public read access" ON public.idols
  FOR SELECT 
  TO public
  USING (true);

-- 4. Make sure RLS is enabled
ALTER TABLE public.idols ENABLE ROW LEVEL SECURITY;

-- 5. Grant necessary permissions
GRANT SELECT ON public.idols TO anon;
GRANT SELECT ON public.idols TO authenticated;

-- 6. Verify the table and data
SELECT * FROM public.idols LIMIT 5;
                    `;
                    console.log(sql);
                    toast.info('Check console for SQL to fix RLS policies');
                  } else if (data && data.length > 0) {
                    toast.success(`✅ Found ${data.length} idols in database`);
                    console.log('Idol data:', data);

                    // Reload page to fetch data
                    setTimeout(() => {
                      window.location.reload();
                    }, 1000);
                  } else {
                    toast.warning('Table exists but is empty. Insert data using SQL above.');
                  }
                }}
                variant="destructive"
                size="lg"
                className="w-full"
              >
                🔍 Test Database Connection
              </Button>

              <Button
                onClick={async () => {
                  console.log('🔄 Attempting to insert data to idols table...');
                  const inserted = await insertSampleData();
                  if (inserted) {
                    window.location.reload();
                  }
                }}
                variant="outline"
                size="lg"
                className="w-full"
              >
                📝 Insert Data to idols Table
              </Button>
            </div>
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
        onBack={() => navigate('/')}
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
        <h2 className="text-xl font-bold">Game State Error</h2>
        <Button onClick={() => navigate('/')} className="mt-4">
          Go Home
        </Button>
      </div>
    </div>
  );
};

export default Pick;