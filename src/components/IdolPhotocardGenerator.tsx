import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePhotoCardMinting } from "@/services/photocardMintingStable";
import { AdvancedPhotocardGenerator } from "@/components/AdvancedPhotocardGenerator";
import { toast } from "sonner";
import { Camera, Sparkles, Heart, Star, Zap } from "lucide-react";

interface SelectedIdol {
  id: number;
  name: string;
  personality: string;
  image: string;
  persona_prompt?: string;
}

interface IdolPhotocardGeneratorProps {
  selectedIdol: SelectedIdol;
  userCoins: number;
  fanHearts: number;
  hasAdvancedAccess?: boolean;
  onCostDeduction: (suiCost: number, heartCost: number) => void;
}

interface ConceptOption {
  id: string;
  name: string;
  description: string;
  cost: { sui: number; hearts: number };
  rarity: 'R' | 'SR' | 'SSR';
  icon: string;
}

export const IdolPhotocardGenerator = ({ 
  selectedIdol, 
  userCoins, 
  fanHearts, 
  hasAdvancedAccess = false,
  onCostDeduction 
}: IdolPhotocardGeneratorProps) => {
  const { mintPhotoCard, isPending } = usePhotoCardMinting();
  const [selectedConcept, setSelectedConcept] = useState<ConceptOption | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string>('Season 1');
  const [selectedWeather, setSelectedWeather] = useState<string>('');
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [selectedTheme, setSelectedTheme] = useState<string>('');

  const conceptOptions: ConceptOption[] = [
    {
      id: 'casual',
      name: '캐주얼 일상',
      description: '편안하고 자연스러운 일상 모습',
      cost: { sui: 0.05, hearts: 10 },
      rarity: 'R',
      icon: '👕'
    },
    {
      id: 'stage',
      name: '무대 퍼포먼스',
      description: '화려한 무대 위의 모습',
      cost: { sui: 0.1, hearts: 20 },
      rarity: 'SR',
      icon: '🎤'
    },
    {
      id: 'fansign',
      name: '팬사인회',
      description: '팬들과의 특별한 만남',
      cost: { sui: 0.08, hearts: 15 },
      rarity: 'SR',
      icon: '✍️'
    },
    {
      id: 'photoshoot',
      name: '화보 촬영',
      description: '전문적이고 아름다운 화보',
      cost: { sui: 0.15, hearts: 30 },
      rarity: 'SSR',
      icon: '📸'
    },
    {
      id: 'special',
      name: '스페셜 이벤트',
      description: '한정판 특별 컨셉',
      cost: { sui: 0.2, hearts: 50 },
      rarity: 'SSR',
      icon: '⭐'
    }
  ];

  const seasons = ['Season 1', 'Season 2', 'Winter Special', 'Summer Edition'];
  
  const weatherOptions = [
    '맑음 ☀️', '흐림 ☁️', '비 🌧️', '눈 ❄️', '바람 💨', 
    '안개 🌫️', '새벽 🌅', '석양 🌇', '달밤 🌙'
  ];
  
  const moodOptions = [
    '행복한 😊', '차분한 😌', '신비로운 🪄', '로맨틱한 💕', '쿨한 😎',
    '귀여운 🥰', '성숙한 💼', '몽환적인 ✨', '활기찬 🎉', '우울한 🌧️'
  ];
  
  const themeOptions = [
    '일상 생활', '여행', '카페', '공원', '해변', '도시', '학교', 
    '집', '스튜디오', '콘서트', '팬미팅', '쇼핑', '드라이브'
  ];

  const handleGeneratePhotocard = async () => {
    if (!selectedConcept) {
      toast.error('컨셉을 선택해주세요!');
      return;
    }

    const { sui: suiCost, hearts: heartCost } = selectedConcept.cost;
    
    if (userCoins < suiCost) {
      toast.error('SUI 코인이 부족합니다!');
      return;
    }

    if (fanHearts < heartCost) {
      toast.error('팬 하트가 부족합니다!');
      return;
    }

    try {
      const enhancedPrompt = `${selectedConcept.name} 컨셉의 ${selectedIdol.name}`;
      const additionalDetails = [
        selectedWeather && `날씨: ${selectedWeather}`,
        selectedMood && `분위기: ${selectedMood}`,
        selectedTheme && `주제: ${selectedTheme}`
      ].filter(Boolean).join(', ');

      const mintingData = {
        idolId: selectedIdol.id,
        idolName: selectedIdol.name,
        rarity: selectedConcept.rarity,
        concept: additionalDetails ? `${selectedConcept.name} (${additionalDetails})` : selectedConcept.name,
        season: selectedSeason,
        serialNo: Math.floor(Math.random() * 10000) + 1,
        totalSupply: selectedConcept.rarity === 'SSR' ? 500 : selectedConcept.rarity === 'SR' ? 2000 : 5000,
        imageUrl: selectedIdol.image,
        personaPrompt: selectedIdol.persona_prompt || selectedIdol.personality,
      };

      await mintPhotoCard(mintingData);
      onCostDeduction(suiCost, heartCost);
      
      toast.success(`🎉 ${selectedIdol.name}의 ${selectedConcept.name} 포토카드가 생성되었습니다!`);
      setSelectedConcept(null);
    } catch (error) {
      console.error('포토카드 생성 실패:', error);
      toast.error('포토카드 생성에 실패했습니다.');
    }
  };

  const canAfford = (concept: ConceptOption) => {
    return userCoins >= concept.cost.sui && fanHearts >= concept.cost.hearts;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'SSR': return 'text-yellow-400 border-yellow-400';
      case 'SR': return 'text-purple-400 border-purple-400';
      case 'R': return 'text-blue-400 border-blue-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold gradient-text flex items-center justify-center gap-2">
          <Camera className="w-6 h-6" />
          내 아이돌 포토카드 생성
        </h3>
        <p className="text-muted-foreground">
          {selectedIdol.name}의 특별한 순간을 포토카드로 만들어보세요
        </p>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">기본 생성</TabsTrigger>
          <TabsTrigger value="advanced" disabled={!hasAdvancedAccess}>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              고급 생성
              {!hasAdvancedAccess && <span className="text-xs">(권한 필요)</span>}
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6 mt-6">

      {/* Idol Info */}
      <Card className="p-4 glass-dark border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-primary/20">
            <img 
              src={selectedIdol.image}
              alt={selectedIdol.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-bold gradient-text">{selectedIdol.name}</h4>
            <p className="text-sm text-muted-foreground">{selectedIdol.personality}</p>
          </div>
          <div className="text-right space-y-1">
            <Badge variant="outline" className="text-xs">
              💰 {userCoins.toFixed(2)} SUI
            </Badge>
            <Badge variant="outline" className="text-xs">
              ❤️ {fanHearts} Hearts
            </Badge>
          </div>
        </div>
      </Card>

      {/* Season and Options Selection */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4 glass-dark border-white/10">
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Star className="w-4 h-4" />
              시즌 선택
            </h4>
            <Select value={selectedSeason} onValueChange={setSelectedSeason}>
              <SelectTrigger className="bg-card/50">
                <SelectValue placeholder="시즌을 선택하세요" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border z-50">
                {seasons.map((season) => (
                  <SelectItem key={season} value={season}>
                    {season}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card className="p-4 glass-dark border-white/10">
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              ☀️ 날씨
            </h4>
            <Select value={selectedWeather} onValueChange={setSelectedWeather}>
              <SelectTrigger className="bg-card/50">
                <SelectValue placeholder="날씨를 선택하세요 (선택사항)" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border z-50">
                <SelectItem value="">선택 안함</SelectItem>
                {weatherOptions.map((weather) => (
                  <SelectItem key={weather} value={weather}>
                    {weather}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4 glass-dark border-white/10">
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              😊 기분/분위기
            </h4>
            <Select value={selectedMood} onValueChange={setSelectedMood}>
              <SelectTrigger className="bg-card/50">
                <SelectValue placeholder="기분을 선택하세요 (선택사항)" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border z-50">
                <SelectItem value="">선택 안함</SelectItem>
                {moodOptions.map((mood) => (
                  <SelectItem key={mood} value={mood}>
                    {mood}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card className="p-4 glass-dark border-white/10">
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              🎨 주제
            </h4>
            <Select value={selectedTheme} onValueChange={setSelectedTheme}>
              <SelectTrigger className="bg-card/50">
                <SelectValue placeholder="주제를 선택하세요 (선택사항)" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border z-50">
                <SelectItem value="">선택 안함</SelectItem>
                {themeOptions.map((theme) => (
                  <SelectItem key={theme} value={theme}>
                    {theme}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>
      </div>

      {/* Concept Selection */}
      <div className="space-y-4">
        <h4 className="font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          컨셉 선택
        </h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {conceptOptions.map((concept) => {
            const affordable = canAfford(concept);
            const isSelected = selectedConcept?.id === concept.id;
            
            return (
              <Card
                key={concept.id}
                className={`p-4 cursor-pointer transition-all duration-300 ${
                  isSelected 
                    ? 'ring-2 ring-primary/50 scale-105' 
                    : 'hover:scale-102'
                } ${
                  !affordable 
                    ? 'opacity-50 grayscale' 
                    : 'glass-dark border-white/10 hover:border-white/20'
                }`}
                onClick={() => affordable && setSelectedConcept(concept)}
              >
                <div className="space-y-3">
                  <div className="text-center space-y-2">
                    <div className="text-3xl">{concept.icon}</div>
                    <h5 className="font-bold gradient-text">{concept.name}</h5>
                    <p className="text-xs text-muted-foreground">{concept.description}</p>
                  </div>
                  
                  <div className="text-center">
                    <Badge className={`${getRarityColor(concept.rarity)} bg-transparent`}>
                      {concept.rarity}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>💰 SUI:</span>
                      <span className={userCoins >= concept.cost.sui ? 'text-green-400' : 'text-red-400'}>
                        {concept.cost.sui}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>❤️ Hearts:</span>
                      <span className={fanHearts >= concept.cost.hearts ? 'text-green-400' : 'text-red-400'}>
                        {concept.cost.hearts}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Generate Button */}
      <Card className="p-4 glass-dark border-white/10">
        <div className="space-y-4">
          {selectedConcept && (
            <div className="text-center space-y-2">
              <h4 className="font-semibold text-primary">선택된 컨셉</h4>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">{selectedConcept.icon}</span>
                <span className="font-bold">{selectedConcept.name}</span>
                <Badge className={`${getRarityColor(selectedConcept.rarity)} bg-transparent`}>
                  {selectedConcept.rarity}
                </Badge>
              </div>
              <div className="flex items-center justify-center gap-4 text-sm">
                <span>💰 {selectedConcept.cost.sui} SUI</span>
                <span>❤️ {selectedConcept.cost.hearts} Hearts</span>
              </div>
            </div>
          )}
          
          <Button
            onClick={handleGeneratePhotocard}
            disabled={!selectedConcept || isPending || !canAfford(selectedConcept!)}
            className="w-full"
            size="lg"
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin">⭐</div>
                포토카드 생성 중...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                포토카드 생성하기
              </div>
            )}
          </Button>
        </div>
      </Card>

      {/* Tips */}
      <Card className="p-4 glass-dark border-accent/20 bg-accent/5">
        <div className="space-y-2">
          <h4 className="font-semibold text-accent flex items-center gap-2">
            <Heart className="w-4 h-4" />
            포토카드 생성 가이드
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 내 아이돌 전용 포토카드를 다양한 컨셉으로 생성</li>
            <li>• 높은 등급일수록 더 희귀하고 아름다운 포토카드</li>
            <li>• 시즌별로 다른 스타일의 포토카드 제작 가능</li>
            <li>• 생성된 포토카드는 컬렉션에서 확인 가능</li>
            <li>• 팬 하트는 다른 사람 포카에 하트를 받으면 획득</li>
          </ul>
        </div>
      </Card>
        </TabsContent>

        <TabsContent value="advanced" className="mt-6">
          {hasAdvancedAccess ? (
            <AdvancedPhotocardGenerator
              selectedIdol={selectedIdol}
              userCoins={userCoins}
              fanHearts={fanHearts}
              onCostDeduction={onCostDeduction}
            />
          ) : (
            <Card className="p-8 glass-dark border-amber-400/30 bg-amber-400/5">
              <div className="text-center space-y-4">
                <Zap className="w-16 h-16 mx-auto text-amber-400" />
                <h3 className="text-xl font-bold text-amber-400">고급 생성 권한 필요</h3>
                <p className="text-muted-foreground">
                  울트라 박스를 개봉하여 고급 포토카드 생성 권한을 획득하세요!
                </p>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  Gemini 2.5 Flash AI 고급 생성
                </Badge>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};