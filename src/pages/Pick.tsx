import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface IdolPreset {
  id: number;
  name: string;
  personality: string;
  description: string;
  image: string;
  gender: 'male' | 'female';
  animal_vector: number[]; // [강아지, 고양이, 여우, 사슴, 토끼, 곰, 호랑이, 늑대]
  body_line: number; // 0 = Soft, 1 = Toned
  diversity_tags: string[];
  persona_prompt: string;
}

// Generate 202 idol presets (101 male, 101 female)
const generateIdolPresets = (): IdolPreset[] => {
  const maleNames = ["지훈", "현우", "태양", "민수", "준호", "상민", "은우", "도윤", "서준", "예준"];
  const femaleNames = ["지수", "수연", "하은", "민지", "채영", "유진", "서현", "나연", "사나", "다현"];
  const personalities = ["밝고 활발한", "신비로운", "카리스마틱한", "온화한", "열정적인", "우아한", "자유로운", "독창적인"];
  const animalTypes = ["강아지", "고양이", "여우", "사슴", "토끼", "곰", "호랑이", "늑대"];
  const diversityTags = ["큐트", "시크", "스포티", "레트로", "클래식", "모던", "로맨틱", "쿨"];

  const presets: IdolPreset[] = [];
  
  // Generate male idols (101)
  for (let i = 0; i < 101; i++) {
    const animalVector = Array(8).fill(0);
    const primaryAnimal = Math.floor(Math.random() * 8);
    animalVector[primaryAnimal] = 0.7 + Math.random() * 0.3;
    if (Math.random() > 0.6) {
      const secondaryAnimal = Math.floor(Math.random() * 8);
      if (secondaryAnimal !== primaryAnimal) {
        animalVector[secondaryAnimal] = 0.3 + Math.random() * 0.4;
      }
    }

    presets.push({
      id: i + 1,
      name: maleNames[i % maleNames.length] + (i > 9 ? i : ''),
      personality: personalities[Math.floor(Math.random() * personalities.length)],
      description: `매력적인 ${animalTypes[primaryAnimal]}상의 남성 아이돌`,
      image: "👨",
      gender: 'male',
      animal_vector: animalVector,
      body_line: Math.random(),
      diversity_tags: [diversityTags[Math.floor(Math.random() * diversityTags.length)]],
      persona_prompt: `당신은 ${maleNames[i % maleNames.length]}${i > 9 ? i : ''}라는 ${personalities[Math.floor(Math.random() * personalities.length)]} 성격의 남성 아이돌입니다.`
    });
  }

  // Generate female idols (101)
  for (let i = 0; i < 101; i++) {
    const animalVector = Array(8).fill(0);
    const primaryAnimal = Math.floor(Math.random() * 8);
    animalVector[primaryAnimal] = 0.7 + Math.random() * 0.3;
    if (Math.random() > 0.6) {
      const secondaryAnimal = Math.floor(Math.random() * 8);
      if (secondaryAnimal !== primaryAnimal) {
        animalVector[secondaryAnimal] = 0.3 + Math.random() * 0.4;
      }
    }

    presets.push({
      id: i + 102,
      name: femaleNames[i % femaleNames.length] + (i > 9 ? i : ''),
      personality: personalities[Math.floor(Math.random() * personalities.length)],
      description: `매력적인 ${animalTypes[primaryAnimal]}상의 여성 아이돌`,
      image: "👩",
      gender: 'female',
      animal_vector: animalVector,
      body_line: Math.random(),
      diversity_tags: [diversityTags[Math.floor(Math.random() * diversityTags.length)]],
      persona_prompt: `당신은 ${femaleNames[i % femaleNames.length]}${i > 9 ? i : ''}라는 ${personalities[Math.floor(Math.random() * personalities.length)]} 성격의 여성 아이돌입니다.`
    });
  }

  return presets;
};

const IDOL_PRESETS = generateIdolPresets();
const ANIMAL_TYPES = ["강아지", "고양이", "여우", "사슴", "토끼", "곰", "호랑이", "늑대"];

type GamePhase = 'gender-select' | 'preference-setup' | 'worldcup' | 'result';

const Pick = () => {
  const [gamePhase, setGamePhase] = useState<GamePhase>('gender-select');
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(null);
  const [selectedAnimals, setSelectedAnimals] = useState<number[]>([]);
  const [animalMixRatio, setAnimalMixRatio] = useState([50]);
  const [bodyLinePreference, setBodyLinePreference] = useState([50]);
  const [currentSeeds, setCurrentSeeds] = useState<IdolPreset[]>([]);
  const [currentPair, setCurrentPair] = useState<[IdolPreset, IdolPreset] | null>(null);
  const [bracket, setBracket] = useState<IdolPreset[]>([]);
  const [round, setRound] = useState(1);
  const [maxRounds, setMaxRounds] = useState(4);
  const [champion, setChampion] = useState<IdolPreset | null>(null);
  const [winners, setWinners] = useState<IdolPreset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gamePhase === 'worldcup' && currentPair) {
        if (event.key === 'ArrowLeft') {
          handleChoice(currentPair[0]);
        } else if (event.key === 'ArrowRight') {
          handleChoice(currentPair[1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gamePhase, currentPair]);

  const calculatePersonalizedScore = (idol: IdolPreset) => {
    let animalScore = 0;
    if (selectedAnimals.length > 0) {
      if (selectedAnimals.length === 1) {
        animalScore = idol.animal_vector[selectedAnimals[0]];
      } else if (selectedAnimals.length === 2) {
        const ratio1 = animalMixRatio[0] / 100;
        const ratio2 = 1 - ratio1;
        animalScore = idol.animal_vector[selectedAnimals[0]] * ratio1 + 
                     idol.animal_vector[selectedAnimals[1]] * ratio2;
      }
    } else {
      animalScore = 0.5; // 중립값
    }

    const bodyPref = bodyLinePreference[0] / 100;
    const bodyScore = 1 - Math.abs(bodyPref - idol.body_line);
    const exploreNoise = (Math.random() - 0.5) * 0.04;

    return 0.6 * animalScore + 0.3 * bodyScore + 0.1 * exploreNoise;
  };

  const generateSeeds = () => {
    const genderFiltered = IDOL_PRESETS.filter(idol => idol.gender === selectedGender);
    const scored = genderFiltered.map(idol => ({
      idol,
      score: calculatePersonalizedScore(idol)
    }));

    // 상위 점수에서 다양성 고려하여 16명 선별
    scored.sort((a, b) => b.score - a.score);
    const seeds: IdolPreset[] = [];
    const usedAnimalCounts: number[] = Array(8).fill(0);

    for (const item of scored) {
      if (seeds.length >= 16) break;
      
      const primaryAnimal = item.idol.animal_vector.findIndex(v => v === Math.max(...item.idol.animal_vector));
      if (usedAnimalCounts[primaryAnimal] < 4) {
        seeds.push(item.idol);
        usedAnimalCounts[primaryAnimal]++;
      }
    }

    // 16명이 안되면 나머지 랜덤 추가
    if (seeds.length < 16) {
      const remaining = genderFiltered.filter(idol => !seeds.includes(idol));
      while (seeds.length < 16 && remaining.length > 0) {
        const randomIndex = Math.floor(Math.random() * remaining.length);
        seeds.push(remaining.splice(randomIndex, 1)[0]);
      }
    }

    return seeds;
  };

  const startWorldCup = () => {
    const seeds = generateSeeds();
    setCurrentSeeds(seeds);
    setBracket([...seeds]);
    setCurrentPair([seeds[0], seeds[1]]);
    setRound(1);
    setMaxRounds(4); // 16강 -> 8강 -> 4강 -> 결승
    setWinners([]);
    setGamePhase('worldcup');
  };

  const handleChoice = (chosen: IdolPreset) => {
    const remainingBracket = bracket.slice(2);
    const currentWinners = [...winners, chosen];
    setWinners(currentWinners);

    if (remainingBracket.length >= 2) {
      // 같은 라운드 계속
      setCurrentPair([remainingBracket[0], remainingBracket[1]]);
      setBracket(remainingBracket);
    } else if (remainingBracket.length === 1) {
      // 마지막 선수 자동 진출
      const finalWinners = [...currentWinners, remainingBracket[0]];
      
      if (finalWinners.length === 1) {
        // 우승자 결정
        setChampion(finalWinners[0]);
        setGamePhase('result');
        mintIdolCard(finalWinners[0]);
      } else {
        // 다음 라운드 시작
        setBracket([...finalWinners]);
        setCurrentPair([finalWinners[0], finalWinners[1]]);
        setRound(round + 1);
        setWinners([]);
      }
    } else {
      // 라운드 종료, 다음 라운드 시작
      if (currentWinners.length === 1) {
        setChampion(currentWinners[0]);
        setGamePhase('result');
        mintIdolCard(currentWinners[0]);
      } else {
        setBracket([...currentWinners]);
        setCurrentPair([currentWinners[0], currentWinners[1]]);
        setRound(round + 1);
        setWinners([]);
      }
    }
  };

  const mintIdolCard = async (idol: IdolPreset) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const choicePath = localStorage.getItem('worldcup_choices') || '';
      const idolCard = {
        id: `idol_card_${Date.now()}`,
        idol_id: idol.id,
        owner: "user_wallet_address",
        level: 1,
        experience: 0,
        minted_at: new Date().toISOString(),
        choice_path_hash: btoa(choicePath + idol.id),
        metadata: {
          name: `${idol.name} IdolCard`,
          description: idol.description,
          image: idol.image,
          personality: idol.personality,
          gender: idol.gender
        }
      };

      localStorage.setItem('selectedIdol', JSON.stringify(idol));
      const existingCards = JSON.parse(localStorage.getItem('idolCards') || '[]');
      existingCards.push(idolCard);
      localStorage.setItem('idolCards', JSON.stringify(existingCards));

      toast.success(`${idol.name}의 IdolCard가 발급되었습니다! 심쿵! 💖`);
    } catch (error) {
      toast.error("IdolCard 발급 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnimalToggle = (animalIndex: number) => {
    if (selectedAnimals.includes(animalIndex)) {
      setSelectedAnimals(selectedAnimals.filter(i => i !== animalIndex));
    } else if (selectedAnimals.length < 2) {
      setSelectedAnimals([...selectedAnimals, animalIndex]);
    }
  };

  if (gamePhase === 'gender-select') {
    return (
      <div className="min-h-screen bg-gradient-background p-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold gradient-text">심쿵챌린지</h1>
            <p className="text-xl text-muted-foreground">
              202명 중에서 나만의 최애를 빠르게 찾아보세요
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card 
              className="p-8 cursor-pointer card-hover bg-card/80 backdrop-blur-sm"
              onClick={() => {
                setSelectedGender('female');
                setGamePhase('preference-setup');
              }}
            >
              <div className="text-center space-y-4">
                <div className="text-6xl">👩</div>
                <h3 className="text-2xl font-bold gradient-text">나의 소녀 고르기</h3>
                <p className="text-muted-foreground">101명의 매력적인 여성 아이돌</p>
              </div>
            </Card>

            <Card 
              className="p-8 cursor-pointer card-hover bg-card/80 backdrop-blur-sm"
              onClick={() => {
                setSelectedGender('male');
                setGamePhase('preference-setup');
              }}
            >
              <div className="text-center space-y-4">
                <div className="text-6xl">👨</div>
                <h3 className="text-2xl font-bold gradient-text">나의 소년 고르기</h3>
                <p className="text-muted-foreground">101명의 매력적인 남성 아이돌</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (gamePhase === 'preference-setup') {
    return (
      <div className="min-h-screen bg-gradient-background p-4">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold gradient-text">취향 설정</h1>
            <p className="text-muted-foreground">
              선호하는 스타일을 선택하세요 (선택사항, 언제든 스킵 가능)
            </p>
          </div>

          <Card className="p-6 space-y-6 bg-card/80 backdrop-blur-sm">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">동물상 믹스 (최대 2개)</h3>
              <div className="grid grid-cols-4 gap-2">
                {ANIMAL_TYPES.map((animal, index) => (
                  <Button
                    key={animal}
                    variant={selectedAnimals.includes(index) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAnimalToggle(index)}
                    disabled={!selectedAnimals.includes(index) && selectedAnimals.length >= 2}
                  >
                    {animal}
                  </Button>
                ))}
              </div>
              
              {selectedAnimals.length === 2 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    믹스 비율: {ANIMAL_TYPES[selectedAnimals[0]]} {animalMixRatio[0]}% : {ANIMAL_TYPES[selectedAnimals[1]]} {100 - animalMixRatio[0]}%
                  </label>
                  <Slider
                    value={animalMixRatio}
                    onValueChange={setAnimalMixRatio}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">체형 라인</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Soft</span>
                  <span>Toned</span>
                </div>
                <Slider
                  value={bodyLinePreference}
                  onValueChange={setBodyLinePreference}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
              💡 취향은 스타일 느낌만 반영돼요. 모든 프리셋은 성인 캐릭터이며, 결과는 개인 비공개예요.
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={startWorldCup}
                className="flex-1"
              >
                스킵하고 시작
              </Button>
              <Button 
                onClick={startWorldCup}
                className="flex-1"
              >
                설정 완료
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (gamePhase === 'worldcup' && currentPair) {
    const totalMatches = 16 / Math.pow(2, round - 1);
    const currentMatch = totalMatches - (bracket.length / 2) + 1;
    const progressValue = ((round - 1) * 25) + ((currentMatch - 1) / totalMatches) * 25;
    
    return (
      <div className="min-h-screen bg-gradient-background p-4">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold gradient-text">심쿵챌린지</h1>
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {round === 1 ? "16강" : round === 2 ? "8강" : round === 3 ? "4강" : "결승"}
              </p>
              <Progress value={progressValue} className="w-full max-w-md mx-auto" />
              <p className="text-sm text-muted-foreground">
                {Math.round(progressValue)}% 완료 · 약 {Math.max(1, 5 - round)}분 남음
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {currentPair.map((idol, index) => (
              <Card 
                key={idol.id}
                className="p-6 cursor-pointer card-hover bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-all duration-300 hover:scale-105"
                onClick={() => handleChoice(idol)}
              >
                <div className="text-center space-y-4">
                  <div className="text-8xl mb-4 animate-pulse">{idol.image}</div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold gradient-text">{idol.name}</h3>
                    <p className="text-primary font-medium">{idol.personality}</p>
                    <p className="text-muted-foreground text-sm">{idol.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {idol.diversity_tags.map((tag, tagIndex) => (
                      <span 
                        key={tagIndex}
                        className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Button variant="hero" size="lg" className="w-full">
                    💖 선택하기
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              키보드 ← → 또는 카드 클릭으로 선택하세요
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" size="sm" disabled>
                패스 (2회 제한)
              </Button>
              <Button variant="outline" size="sm" disabled>
                둘 다 좋아요
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gamePhase === 'result' && champion) {
    return (
      <div className="min-h-screen bg-gradient-background p-4">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-6">
            <div className="text-6xl animate-bounce">🎉</div>
            <h1 className="text-4xl font-bold gradient-text">심쿵챌린지 완료!</h1>
            <div className="space-y-4">
              <div className="text-8xl animate-pulse">{champion.image}</div>
              <h2 className="text-3xl font-bold">{champion.name}</h2>
              <p className="text-xl text-primary">{champion.personality}</p>
              <p className="text-muted-foreground">{champion.description}</p>
            </div>
          </div>

          <Card className="p-6 space-y-4 bg-card/80 backdrop-blur-sm">
            <div className="text-center">
              <h3 className="text-xl font-semibold gradient-text mb-3">IdolCard 발급 완료!</h3>
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>블록체인에 기록 중...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-4xl">💖</div>
                  <p className="text-muted-foreground">
                    {champion.name}의 IdolCard가 성공적으로 발급되었습니다!
                  </p>
                  <div className="text-xs text-muted-foreground">
                    PoM 이벤트가 블록체인에 앵커되었습니다.
                  </div>
                </div>
              )}
            </div>
          </Card>

          <div className="text-center space-y-4">
            <Button
              onClick={() => navigate('/vault')}
              size="lg"
              className="w-full max-w-md"
              disabled={isLoading}
            >
              일상 에피소드 시작하기
            </Button>
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

  return null;
};

export default Pick;