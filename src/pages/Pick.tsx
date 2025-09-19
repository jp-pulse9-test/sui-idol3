import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface IdolPreset {
  id: number;
  name: string;
  personality: string;
  description: string;
  profile_image: string;
  persona_prompt: string;
}

type GamePhase = 'loading' | 'quickstart-gender' | 'quickstart-animal' | 'quickstart-vibe' | 'natural-language' | 'slider-mode' | 'worldcup' | 'result' | 'minting';

interface PreferenceData {
  gender: 'male' | 'female' | '';
  animalTypes: string[];
  bodyTypes: string[];
  vibes: string[];
  talent: string;
  cuteChicSlider: number;
  slimAthleticSlider: number;
}

interface OneClickPreset {
  id: string;
  name: string;
  animal: string;
  vibe: string;
  emoji: string;
  description: string;
}

interface HybridBadge {
  animalTypes: string[];
  bodyTypes: string[];
  vibes: string[];
  talent: string;
}

const Pick = () => {
  const [gamePhase, setGamePhase] = useState<GamePhase>('loading');
  const [idols, setIdols] = useState<IdolPreset[]>([]);
  const [currentPair, setCurrentPair] = useState<[IdolPreset, IdolPreset] | null>(null);
  const [bracket, setBracket] = useState<IdolPreset[]>([]);
  const [currentRound, setCurrentRound] = useState<IdolPreset[]>([]);
  const [roundNumber, setRoundNumber] = useState(1);
  const [finalWinner, setFinalWinner] = useState<IdolPreset | null>(null);
  const [preference, setPreference] = useState<PreferenceData>({
    gender: '',
    animalTypes: [],
    bodyTypes: [],
    vibes: [],
    talent: '',
    cuteChicSlider: 50,
    slimAthleticSlider: 50
  });
  const [tournamentSize, setTournamentSize] = useState<16 | 32>(16);
  const [hybridBadge, setHybridBadge] = useState<HybridBadge | null>(null);
  const [mintingProgress, setMintingProgress] = useState(0);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [quickStartAnimal, setQuickStartAnimal] = useState('');
  const [quickStartVibe, setQuickStartVibe] = useState('');
  const [doubleClickMode, setDoubleClickMode] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('quickstart');
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

  const animalOptions = [
    { text: "강아지상", value: "puppy", emoji: "🐶" },
    { text: "고양이상", value: "cat", emoji: "🐱" },
    { text: "여우상", value: "fox", emoji: "🦊" },
    { text: "사슴상", value: "deer", emoji: "🦌" },
    { text: "토끼상", value: "rabbit", emoji: "🐰" },
    { text: "곰상", value: "bear", emoji: "🐻" },
    { text: "늑대상", value: "wolf", emoji: "🐺" },
    { text: "호랑이상", value: "tiger", emoji: "🐅" }
  ];

  const bodyOptions = [
    { text: "슬림", value: "slim", emoji: "🎋" },
    { text: "피트", value: "fit", emoji: "💪" },
    { text: "애슬레틱", value: "athletic", emoji: "🏃" },
    { text: "볼륨", value: "voluminous", emoji: "🌺" },
    { text: "키큰", value: "tall", emoji: "🗼" },
    { text: "아담", value: "petite", emoji: "🌸" }
  ];

  const vibeOptions = [
    { text: "청량", value: "fresh", emoji: "🌿" },
    { text: "시크", value: "chic", emoji: "🖤" },
    { text: "러블리", value: "lovely", emoji: "💕" },
    { text: "카리스마", value: "charismatic", emoji: "⚡" }
  ];

  const talentOptions = [
    { text: "보컬", value: "vocal", emoji: "🎤" },
    { text: "댄스", value: "dance", emoji: "💃" },
    { text: "랩", value: "rap", emoji: "🎵" },
    { text: "프로듀싱", value: "producing", emoji: "🎹" }
  ];

  const oneClickPresets: OneClickPreset[] = [
    { id: 'fresh-puppy', name: '청량 강아지상', animal: 'puppy', vibe: 'fresh', emoji: '🌿🐶', description: '상큼하고 사랑스러운' },
    { id: 'chic-fox', name: '시크 여우상', animal: 'fox', vibe: 'chic', emoji: '🖤🦊', description: '세련되고 매혹적인' },
    { id: 'lovely-rabbit', name: '러블리 토끼상', animal: 'rabbit', vibe: 'lovely', emoji: '💕🐰', description: '사랑스럽고 귀여운' },
    { id: 'charismatic-tiger', name: '카리스마 호랑이상', animal: 'tiger', vibe: 'charismatic', emoji: '⚡🐅', description: '강렬하고 카리스마틱한' },
    { id: 'sporty-wolf', name: '스포티 늑대상', animal: 'wolf', vibe: 'fresh', emoji: '🏃🐺', description: '역동적이고 활기찬' },
    { id: 'modern-cat', name: '모던 고양이상', animal: 'cat', vibe: 'chic', emoji: '😸🐱', description: '현대적이고 트렌디한' }
  ];

  // Methods selection options
  const methodOptions = [
    { value: 'quickstart', label: '3탭 퀵스타트', description: '성별 → 동물상 → 분위기' },
    { value: 'presets', label: '원클릭 프리셋', description: '미리 정의된 조합' },
    { value: 'magic', label: '매직픽', description: '랜덤 추천' },
    { value: 'natural', label: '자연어 입력', description: '텍스트로 설명' },
    { value: 'slider', label: '슬라이더', description: '2축 조절' }
  ];

  // Save last preferences to localStorage
  const saveLastPreferences = () => {
    localStorage.setItem('lastPickPreferences', JSON.stringify(preference));
  };

  const loadLastPreferences = () => {
    const saved = localStorage.getItem('lastPickPreferences');
    if (saved) {
      return JSON.parse(saved) as PreferenceData;
    }
    return null;
  };

  // Natural language parser
  const parseNaturalLanguage = (input: string) => {
    const lowerInput = input.toLowerCase();
    const parsed: Partial<PreferenceData> = {};
    
    // Animal parsing
    animalOptions.forEach(animal => {
      if (lowerInput.includes(animal.text) || lowerInput.includes(animal.value)) {
        parsed.animalTypes = [animal.value];
      }
    });
    
    // Body parsing
    bodyOptions.forEach(body => {
      if (lowerInput.includes(body.text) || lowerInput.includes(body.value)) {
        parsed.bodyTypes = [body.value];
      }
    });
    
    // Vibe parsing
    vibeOptions.forEach(vibe => {
      if (lowerInput.includes(vibe.text) || lowerInput.includes(vibe.value)) {
        parsed.vibes = [vibe.value];
      }
    });
    
    // Talent parsing
    talentOptions.forEach(talent => {
      if (lowerInput.includes(talent.text) || lowerInput.includes(talent.value)) {
        parsed.talent = talent.value;
      }
    });
    
    return parsed;
  };

  const handleNaturalLanguageSubmit = () => {
    const parsed = parseNaturalLanguage(naturalLanguageInput);
    setPreference(prev => ({
      ...prev,
      ...parsed,
      // Set defaults for missing values
      animalTypes: parsed.animalTypes || ['puppy'],
      bodyTypes: parsed.bodyTypes || ['balanced'],
      vibes: parsed.vibes || ['fresh'],
      talent: parsed.talent || 'balanced'
    }));
    startTournament(16);
  };

  const handleOneClickPreset = (preset: OneClickPreset) => {
    setPreference(prev => ({
      ...prev,
      animalTypes: [preset.animal],
      vibes: [preset.vibe],
      bodyTypes: ['balanced'],
      talent: 'balanced'
    }));
    startTournament(16);
  };

  const handleMagicPick = () => {
    const randomAnimal = animalOptions[Math.floor(Math.random() * animalOptions.length)];
    const randomVibe = vibeOptions[Math.floor(Math.random() * vibeOptions.length)];
    
    setPreference(prev => ({
      ...prev,
      animalTypes: [randomAnimal.value],
      vibes: [randomVibe.value],
      bodyTypes: ['balanced'],
      talent: 'balanced'
    }));
    startTournament(16);
  };

  const handleQuickStartGender = (gender: 'male' | 'female') => {
    setPreference(prev => ({ ...prev, gender }));
    setGamePhase('quickstart-animal');
  };

  const handleQuickStartAnimal = (animal: string) => {
    setQuickStartAnimal(animal);
    setGamePhase('quickstart-vibe');
  };

  const handleQuickStartVibe = (vibe: string) => {
    setQuickStartVibe(vibe);
    setPreference(prev => ({
      ...prev,
      animalTypes: [quickStartAnimal],
      vibes: [vibe],
      bodyTypes: ['balanced'],
      talent: 'balanced'
    }));
    startTournament(16);
  };

  const startTournament = (size: 16 | 32) => {
    saveLastPreferences();
    const shuffled = [...idols].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, size);
    
    setBracket(selected);
    setCurrentRound(selected);
    setCurrentPair([selected[0], selected[1]]);
    setTournamentSize(size);
    setGamePhase('worldcup');
  };

  const handleMethodChange = (method: string) => {
    setSelectedMethod(method);
    switch (method) {
      case 'quickstart':
        // Stay on current page, it will show quickstart content
        break;
      case 'presets':
        // Show presets inline
        break;
      case 'magic':
        handleMagicPick();
        break;
      case 'natural':
        setGamePhase('natural-language');
        break;
      case 'slider':
        setGamePhase('slider-mode');
        break;
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
        setGamePhase('quickstart-gender');
      } else {
        toast.error('아이돌 데이터를 불러올 수 없습니다.');
      }
    };

    initializeGame();
  }, []);

  // Enhanced idol selection with double-click support
  const selectIdol = (selectedIdol: IdolPreset, isDoubleClick: boolean = false) => {
    if (!currentPair || !currentPair[0] || !currentPair[1]) return;

    // Double click mode for quick selection
    if (isDoubleClick && doubleClickMode) {
      // Fast track through remaining matches
      const remainingMatches = Math.floor(currentRound.length / 2) - getCurrentMatchNumber();
      if (remainingMatches > 3) {
        toast.info('빠른선택 모드로 자동 진행합니다');
        // Simulate quick selections
        setTimeout(() => {
          finishTournamentQuickly(selectedIdol);
        }, 500);
        return;
      }
    }

    const currentIndex = currentRound.indexOf(currentPair[0]);
    if (currentIndex === -1) return;
    
    const nextRound = [...currentRound];
    
    // Remove the current pair and add winner to next round
    nextRound.splice(currentIndex, 2, selectedIdol);
    
    // Check if current round is complete
    const pairsRemaining = Math.floor(nextRound.length / 2);
    
    if (currentIndex + 2 >= currentRound.length) {
      // Current round complete
      if (pairsRemaining === 1) {
        // Tournament complete - generate hybrid badge
        const badge: HybridBadge = {
          animalTypes: preference.animalTypes,
          bodyTypes: preference.bodyTypes,
          vibes: preference.vibes,
          talent: preference.talent
        };
        setHybridBadge(badge);
        setFinalWinner(selectedIdol);
        setGamePhase('result');
        return;
      } else {
        // Start next round
        const filteredNextRound = nextRound.filter(idol => idol && idol.profile_image).slice(0, pairsRemaining);
        setCurrentRound(filteredNextRound);
        if (filteredNextRound.length >= 2) {
          setCurrentPair([filteredNextRound[0], filteredNextRound[1]]);
        }
        setRoundNumber(prev => prev + 1);
      }
    } else {
      // Continue current round
      const nextPairIndex = currentIndex + 2;
      if (nextPairIndex + 1 < currentRound.length && currentRound[nextPairIndex] && currentRound[nextPairIndex + 1]) {
        setCurrentPair([currentRound[nextPairIndex], currentRound[nextPairIndex + 1]]);
      }
      setCurrentRound(nextRound);
    }
  };

  const finishTournamentQuickly = (preferredIdol: IdolPreset) => {
    // Simulate remaining matches with bias toward preferred idol
    const badge: HybridBadge = {
      animalTypes: preference.animalTypes,
      bodyTypes: preference.bodyTypes,
      vibes: preference.vibes,
      talent: preference.talent
    };
    setHybridBadge(badge);
    setFinalWinner(preferredIdol);
    setGamePhase('result');
  };

  const handleConfirmPick = () => {
    setGamePhase('minting');
    simulateMinting();
  };

  const simulateMinting = async () => {
    setMintingProgress(0);
    
    // Simulate minting progress
    const intervals = [20, 40, 60, 80, 100];
    for (const progress of intervals) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setMintingProgress(progress);
    }
    
    // Save final selection
    if (finalWinner && hybridBadge) {
      localStorage.setItem('selectedIdol', JSON.stringify({
        id: finalWinner.id,
        name: finalWinner.name,
        personality: finalWinner.personality,
        image: finalWinner.profile_image,
        persona_prompt: finalWinner.persona_prompt,
        hybridBadge: hybridBadge
      }));
    }
    
    toast.success('IdolCard NFT 민팅이 완료되었습니다!');
    setTimeout(() => navigate('/vault'), 2000);
  };

  const getTournamentRoundName = () => {
    const remaining = currentRound.length;
    if (remaining > 16) return `${remaining}강`;
    switch (remaining) {
      case 32: return "32강";
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

  // QuickStart Gender Selection (with method selector)
  if (gamePhase === 'quickstart-gender') {
    return (
      <div className="min-h-screen bg-gradient-background p-4">
        <div className="max-w-4xl mx-auto space-y-8 pt-12">
          {/* Method Selector Dropdown */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold gradient-text">
              🎯 내 취향 아이돌 픽하기
            </h1>
            <p className="text-muted-foreground text-lg">
              140초 만에 완벽한 아이돌을 찾아보세요
            </p>
            
            <div className="max-w-xs mx-auto">
              <Select value={selectedMethod} onValueChange={handleMethodChange}>
                <SelectTrigger className="w-full bg-card/90 backdrop-blur-sm border-border z-50">
                  <SelectValue placeholder="방식 선택" />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-md border-border z-50">
                  {methodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="hover:bg-muted/80">
                      <div className="text-left">
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Last Preferences Recommendation */}
          {loadLastPreferences() && (
            <Card className="p-4 glass-dark border-white/10 max-w-md mx-auto">
              <div className="text-center space-y-3">
                <h3 className="text-sm font-bold gradient-text">🔄 지난번처럼 시작</h3>
                <Button
                  onClick={() => {
                    const lastPrefs = loadLastPreferences();
                    if (lastPrefs) {
                      setPreference(lastPrefs);
                      startTournament(16);
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  지난 설정으로 시작
                </Button>
              </div>
            </Card>
          )}

          {/* Show content based on selected method */}
          {selectedMethod === 'quickstart' && (
            <>
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold gradient-text">
                  1/3 성별 선택
                </h2>
                <Progress value={33} className="w-64 mx-auto h-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                <Button
                  onClick={() => handleQuickStartGender('male')}
                  variant="outline"
                  size="lg"
                  className="h-32 flex flex-col items-center justify-center space-y-4 bg-card/80 backdrop-blur-sm border-border hover:border-primary/50 hover:bg-primary/10 transition-all duration-300"
                >
                  <span className="text-6xl">👨</span>
                  <span className="text-xl font-medium">남성 아이돌</span>
                </Button>
                
                <Button
                  onClick={() => handleQuickStartGender('female')}
                  variant="outline"
                  size="lg"
                  className="h-32 flex flex-col items-center justify-center space-y-4 bg-card/80 backdrop-blur-sm border-border hover:border-primary/50 hover:bg-primary/10 transition-all duration-300"
                >
                  <span className="text-6xl">👩</span>
                  <span className="text-xl font-medium">여성 아이돌</span>
                </Button>
              </div>
            </>
          )}

          {/* One-Click Presets (shown when presets method is selected) */}
          {selectedMethod === 'presets' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold gradient-text">원클릭 프리셋</h2>
                <p className="text-muted-foreground">미리 정의된 조합으로 바로 시작</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {oneClickPresets.map((preset) => (
                  <Card key={preset.id} 
                        className="p-4 glass-dark border-white/10 card-hover cursor-pointer group text-center"
                        onClick={() => handleOneClickPreset(preset)}>
                    <div className="space-y-2">
                      <div className="text-3xl">{preset.emoji}</div>
                      <h4 className="text-sm font-bold">{preset.name}</h4>
                      <p className="text-xs text-muted-foreground">{preset.description}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="text-center">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              홈으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // QuickStart Animal Selection
  if (gamePhase === 'quickstart-animal') {
    return (
      <div className="min-h-screen bg-gradient-background p-4">
        <div className="max-w-4xl mx-auto space-y-8 pt-20">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold gradient-text">
              2/3 동물상 선택
            </h1>
            <p className="text-muted-foreground">
              선호하는 동물상을 하나만 선택해주세요
            </p>
            <Progress value={66} className="w-64 mx-auto h-2" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {animalOptions.map((option) => (
              <Button
                key={option.value}
                onClick={() => handleQuickStartAnimal(option.value)}
                variant="outline"
                size="lg"
                className="h-24 flex flex-col items-center justify-center space-y-2 bg-card/80 backdrop-blur-sm border-border hover:border-primary/50 hover:bg-primary/10 transition-all duration-300"
              >
                <span className="text-3xl">{option.emoji}</span>
                <span className="text-sm font-medium">{option.text}</span>
              </Button>
            ))}
          </div>

          <div className="text-center">
            <Button
              onClick={() => setGamePhase('quickstart-gender')}
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              이전 단계
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // QuickStart Vibe Selection
  if (gamePhase === 'quickstart-vibe') {
    return (
      <div className="min-h-screen bg-gradient-background p-4">
        <div className="max-w-4xl mx-auto space-y-8 pt-20">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold gradient-text">
              3/3 분위기 선택
            </h1>
            <p className="text-muted-foreground">
              선호하는 분위기를 하나만 선택해주세요
            </p>
            <Progress value={100} className="w-64 mx-auto h-2" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {vibeOptions.map((option) => (
              <Button
                key={option.value}
                onClick={() => handleQuickStartVibe(option.value)}
                variant="outline"
                size="lg"
                className="h-28 flex flex-col items-center justify-center space-y-3 bg-card/80 backdrop-blur-sm border-border hover:border-primary/50 hover:bg-primary/10 transition-all duration-300"
              >
                <span className="text-4xl">{option.emoji}</span>
                <span className="text-lg font-medium">{option.text}</span>
              </Button>
            ))}
          </div>

          <div className="text-center">
            <Button
              onClick={() => setGamePhase('quickstart-animal')}
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              이전 단계
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Natural Language Input Phase
  if (gamePhase === 'natural-language') {
    return (
      <div className="min-h-screen bg-gradient-background p-4">
        <div className="max-w-4xl mx-auto space-y-8 pt-20">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold gradient-text">
              💬 자연어 한 줄 입력
            </h1>
            <p className="text-muted-foreground">
              원하는 아이돌 스타일을 자유롭게 입력해주세요
            </p>
          </div>

          <Card className="p-8 glass-dark border-white/10 max-w-2xl mx-auto">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  예: "강아지상, 키 크고 춤 잘 추는 소년"
                </label>
                <Input
                  value={naturalLanguageInput}
                  onChange={(e) => setNaturalLanguageInput(e.target.value)}
                  placeholder="원하는 스타일을 자유롭게 입력해주세요..."
                  className="text-lg p-4 h-16"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && naturalLanguageInput.trim()) {
                      handleNaturalLanguageSubmit();
                    }
                  }}
                />
              </div>
              
              <div className="text-center space-y-4">
                <Button
                  onClick={handleNaturalLanguageSubmit}
                  disabled={!naturalLanguageInput.trim()}
                  size="lg"
                  className="min-w-48 text-lg py-3 bg-gradient-primary hover:opacity-90"
                >
                  16강 월드컵 시작
                </Button>
                
                <div className="text-xs text-muted-foreground">
                  인식되는 키워드: 강아지상, 고양이상, 여우상, 사슴상, 토끼상, 곰상, 늑대상, 호랑이상, 
                  슬림, 피트, 애슬레틱, 볼륨, 키큰, 아담, 청량, 시크, 러블리, 카리스마, 보컬, 댄스, 랩, 프로듀싱
                </div>
              </div>
            </div>
          </Card>

          <div className="text-center">
            <Button
              onClick={() => setGamePhase('quickstart-gender')}
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              이전 단계
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 2-Axis Slider Mode
  if (gamePhase === 'slider-mode') {
    return (
      <div className="min-h-screen bg-gradient-background p-4">
        <div className="max-w-4xl mx-auto space-y-8 pt-20">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold gradient-text">
              🎚️ 2축 슬라이더 설정
            </h1>
            <p className="text-muted-foreground">
              슬라이더로 간편하게 감성과 체형을 조절해주세요
            </p>
          </div>

          <Card className="p-8 glass-dark border-white/10 max-w-2xl mx-auto">
            <div className="space-y-8">
              {/* Cute ↔ Chic Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">💕 Cute</span>
                  <span className="text-lg font-medium">🖤 Chic</span>
                </div>
                <Slider
                  value={[preference.cuteChicSlider]}
                  onValueChange={(value) => setPreference(prev => ({ ...prev, cuteChicSlider: value[0] }))}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="text-center text-sm text-muted-foreground">
                  {preference.cuteChicSlider < 30 ? '러블리한 스타일' : 
                   preference.cuteChicSlider > 70 ? '시크한 스타일' : '균형잡힌 스타일'}
                </div>
              </div>

              {/* Slim ↔ Athletic Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">🎋 Slim</span>
                  <span className="text-lg font-medium">💪 Athletic</span>
                </div>
                <Slider
                  value={[preference.slimAthleticSlider]}
                  onValueChange={(value) => setPreference(prev => ({ ...prev, slimAthleticSlider: value[0] }))}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="text-center text-sm text-muted-foreground">
                  {preference.slimAthleticSlider < 30 ? '슬림한 체형' : 
                   preference.slimAthleticSlider > 70 ? '애슬레틱한 체형' : '균형잡힌 체형'}
                </div>
              </div>

              <div className="text-center space-y-4">
                <Button
                  onClick={() => {
                    // Convert slider values to preferences
                    const vibes = preference.cuteChicSlider < 30 ? ['lovely'] : 
                                 preference.cuteChicSlider > 70 ? ['chic'] : ['fresh'];
                    const bodyTypes = preference.slimAthleticSlider < 30 ? ['slim'] : 
                                     preference.slimAthleticSlider > 70 ? ['athletic'] : ['fit'];
                    
                    setPreference(prev => ({
                      ...prev,
                      vibes,
                      bodyTypes,
                      animalTypes: ['balanced'],
                      talent: 'balanced'
                    }));
                    startTournament(16);
                  }}
                  size="lg"
                  className="min-w-48 text-lg py-3 bg-gradient-primary hover:opacity-90"
                >
                  16강 월드컵 시작
                </Button>
              </div>
            </div>
          </Card>

          <div className="text-center">
            <Button
              onClick={() => setGamePhase('quickstart-gender')}
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              이전 단계
            </Button>
          </div>
        </div>
      </div>
    );
  }

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

  // Result phase with hybrid preview
  if (gamePhase === 'result' && finalWinner && hybridBadge) {
    const getEmojiForValue = (category: string, value: string) => {
      const allOptions = [...animalOptions, ...bodyOptions, ...vibeOptions, ...talentOptions];
      return allOptions.find(opt => opt.value === value)?.emoji || '✨';
    };

    return (
      <div className="min-h-screen bg-gradient-background p-4">
        <div className="max-w-4xl mx-auto text-center space-y-8 pt-12">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold gradient-text animate-pulse">
              🏆 결승 & 하이브리드 미리보기 🏆
            </h1>
            <p className="text-xl text-muted-foreground">
              당신의 픽이 완성되었습니다!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Winner Card */}
            <Card className="p-6 glass-dark border-white/10">
              <div className="space-y-6">
                <div className="relative">
                  <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gradient-primary/20 border-4 border-primary/30">
                    <img 
                      src={finalWinner.profile_image}
                      alt={finalWinner.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${finalWinner.name}`;
                      }}
                    />
                  </div>
                  <div className="absolute -top-2 -right-2 text-3xl animate-bounce">
                    👑
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold gradient-text">{finalWinner.name}</h2>
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {finalWinner.personality}
                  </Badge>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {finalWinner.description}
                  </p>
                </div>
              </div>
            </Card>

            {/* Hybrid Badge */}
            <Card className="p-6 glass-dark border-white/10">
              <div className="space-y-6">
                <h3 className="text-xl font-bold gradient-text">하이브리드 배지</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">동물상</h4>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {hybridBadge.animalTypes.map((type) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {getEmojiForValue('animal', type)} {animalOptions.find(opt => opt.value === type)?.text}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">체형</h4>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {hybridBadge.bodyTypes.map((type) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {getEmojiForValue('body', type)} {bodyOptions.find(opt => opt.value === type)?.text}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">분위기</h4>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {hybridBadge.vibes.map((vibe) => (
                        <Badge key={vibe} variant="outline" className="text-xs">
                          {getEmojiForValue('vibe', vibe)} {vibeOptions.find(opt => opt.value === vibe)?.text}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">역량</h4>
                    <Badge variant="default" className="text-xs">
                      {getEmojiForValue('talent', hybridBadge.talent)} {talentOptions.find(opt => opt.value === hybridBadge.talent)?.text}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleConfirmPick}
              size="lg"
              className="min-w-64 text-xl py-4 bg-gradient-primary hover:opacity-90"
            >
              🎊 나의 픽 확정 🎊
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

  // Minting phase
  if (gamePhase === 'minting' && finalWinner) {
    return (
      <div className="min-h-screen bg-gradient-background p-4">
        <div className="max-w-4xl mx-auto text-center space-y-8 pt-20">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold gradient-text">
              🎨 IdolCard NFT 민팅
            </h1>
            <p className="text-xl text-muted-foreground">
              하이브리드 메타데이터와 함께 NFT를 생성하고 있습니다...
            </p>
          </div>

          <Card className="p-8 glass-dark border-white/10 max-w-md mx-auto">
            <div className="space-y-6">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gradient-primary/20 border-4 border-primary/30">
                <img 
                  src={finalWinner.profile_image}
                  alt={finalWinner.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${finalWinner.name}`;
                  }}
                />
              </div>
              
              <div className="space-y-3">
                <h2 className="text-2xl font-bold gradient-text">{finalWinner.name}</h2>
                <Progress value={mintingProgress} className="w-full h-3" />
                <p className="text-sm text-muted-foreground">
                  민팅 진행률: {mintingProgress}%
                </p>
              </div>
            </div>
          </Card>

          {mintingProgress === 100 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-4xl animate-bounce">🎉</div>
              <p className="text-lg text-green-400 font-medium">
                민팅이 완료되었습니다!
              </p>
              <Button
                onClick={() => window.open('https://explorer.example.com', '_blank')}
                variant="outline"
                size="lg"
                className="bg-card/80 backdrop-blur-sm"
              >
                🔍 탐색기에서 확인하기
              </Button>
            </div>
          )}
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
              {currentPair.filter(idol => idol && idol.profile_image).map((idol, index) => (
                <Card
                  key={idol.id}
                  className="p-6 glass-dark border-white/10 card-hover cursor-pointer group transition-all duration-300"
                  onClick={() => selectIdol(idol)}
                  onDoubleClick={() => selectIdol(idol, true)}
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
              onClick={() => setDoubleClickMode(!doubleClickMode)}
              variant={doubleClickMode ? "default" : "outline"}
              size="lg"
              className="bg-card/80 backdrop-blur-sm border-border hover:bg-card"
            >
              {doubleClickMode ? "⚡ 빠른선택 ON" : "빠른선택 모드"}
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