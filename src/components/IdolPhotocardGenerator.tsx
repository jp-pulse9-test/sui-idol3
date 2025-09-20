import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePhotoCardMinting } from "@/services/photocardMintingStable";
import { AdvancedPhotocardGenerator } from "@/components/AdvancedPhotocardGenerator";
import { googleGenAI } from "@/services/googleGenAI";
import { toast } from "sonner";
import { Camera, Sparkles, Heart, Star, Zap, ArrowRight, RotateCcw, Loader2 } from "lucide-react";

interface SelectedIdol {
  id: number;
  name: string;
  personality: string;
  image: string;
  profile_image?: string;
  persona_prompt?: string;
}

interface IdolPhotocardGeneratorProps {
  selectedIdol: SelectedIdol;
  userCoins: number;
  fanHearts: number;
  hasAdvancedAccess?: boolean;
  onCostDeduction: (suiCost: number, heartCost: number) => void;
  onNavigateToCollection?: () => void;
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
  onCostDeduction,
  onNavigateToCollection
}: IdolPhotocardGeneratorProps) => {
  const { mintPhotoCard, isPending } = usePhotoCardMinting();
  const [selectedConcept, setSelectedConcept] = useState<ConceptOption | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string>('Season 1');
  const [selectedWeather, setSelectedWeather] = useState<string>('none');
  const [selectedMood, setSelectedMood] = useState<string>('none');
  const [selectedTheme, setSelectedTheme] = useState<string>('none');
  const [generatedCard, setGeneratedCard] = useState<any | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);


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

    setIsGenerating(true);

    try {
      // 추가 디테일 정보 구성
      const additionalDetails = [
        selectedWeather && selectedWeather !== 'none' && selectedWeather,
        selectedMood && selectedMood !== 'none' && selectedMood,
        selectedTheme && selectedTheme !== 'none' && selectedTheme
      ].filter(Boolean).join(', ');

      // Google GenAI를 사용하여 이미지 생성 (아이돌 프로필 이미지를 참조로 사용)
      toast.info('🎨 AI가 포토카드를 생성하고 있습니다...');

      // 아이돌 프로필 이미지 URL (profile_image가 있으면 사용, 없으면 image 사용)
      const profileImageUrl = selectedIdol.profile_image || selectedIdol.image;
      console.log('🖼️ Profile image URL being used:', profileImageUrl);
      console.log('🎭 Selected idol data:', {
        id: selectedIdol.id,
        name: selectedIdol.name,
        image: selectedIdol.image,
        profile_image: selectedIdol.profile_image
      });

      // 참조 이미지가 없으면 경고
      if (!profileImageUrl) {
        console.warn('⚠️ WARNING: No profile image available for idol - consistency cannot be guaranteed');
        toast.warning('참조 이미지가 없어 아이돌 일관성이 보장되지 않을 수 있습니다.');
      } else {
        console.log('✅ Reference image available - will maintain idol consistency');
        toast.info('🎭 아이돌 참조 이미지를 사용하여 일관성을 유지합니다.');
      }

      const imageResult = await googleGenAI.generatePhotocard(
        selectedIdol.name,
        selectedConcept.name,
        additionalDetails,
        selectedIdol.personality,
        profileImageUrl // 아이돌 프로필 이미지를 참조로 전달
      );

      if (!imageResult.success) {
        throw new Error(imageResult.error || '이미지 생성에 실패했습니다.');
      }

      const generatedImageUrl = imageResult.data!.image_url;
      setGeneratedImageUrl(generatedImageUrl);

      // 민팅 데이터 준비
      const conceptDescription = additionalDetails ? `${selectedConcept.name} (${additionalDetails})` : selectedConcept.name;

      const mintingData = {
        idolId: selectedIdol.id,
        idolName: selectedIdol.name,
        rarity: selectedConcept.rarity,
        concept: conceptDescription,
        season: selectedSeason,
        serialNo: Math.floor(Math.random() * 10000) + 1,
        totalSupply: selectedConcept.rarity === 'SSR' ? 500 : selectedConcept.rarity === 'SR' ? 2000 : 5000,
        imageUrl: generatedImageUrl, // 생성된 이미지 URL 사용
        personaPrompt: selectedIdol.persona_prompt || selectedIdol.personality,
      };

      const cardData = {
        idolName: selectedIdol.name,
        concept: conceptDescription,
        rarity: selectedConcept.rarity,
        season: selectedSeason,
        image: generatedImageUrl, // 생성된 이미지 URL 사용
        serialNo: mintingData.serialNo,
        totalSupply: mintingData.totalSupply,
        seed: imageResult.data!.seed,
        prompt: imageResult.data!.prompt // Gemini 개선된 프롬프트
      };

      // 실제 민팅 수행
      await mintPhotoCard(mintingData);

      // 비용 차감
      onCostDeduction(suiCost, heartCost);

      setGeneratedCard(cardData);
      setShowResult(true);

      toast.success(`🎉 ${selectedIdol.name}의 ${selectedConcept.name} 포토카드가 생성되었습니다!`);
    } catch (error) {
      console.error('포토카드 생성 실패:', error);
      toast.error(`포토카드 생성에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinueCreating = () => {
    setShowResult(false);
    setGeneratedCard(null);
    setGeneratedImageUrl(null);
    setSelectedConcept(null);
    setSelectedWeather('none');
    setSelectedMood('none');
    setSelectedTheme('none');
  };

  const handleGoToCollection = () => {
    if (onNavigateToCollection) {
      onNavigateToCollection();
    } else {
      // Fallback: try to switch to collection tab
      // This will work if the parent component uses hash-based tab switching
      window.location.hash = 'collection';
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

        {/* Reference Image Preview */}
        <div className="flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">참조 이미지</p>
            <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-primary/30">
              <img
                src={selectedIdol.profile_image || selectedIdol.image}
                alt={`${selectedIdol.name} 프로필`}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{selectedIdol.name}</p>
          </div>
        </div>
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
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-primary/20 relative group">
                <img
                  src={selectedIdol.image}
                  alt={selectedIdol.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-xs text-white">참조 이미지</span>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold gradient-text">{selectedIdol.name}</h4>
                <p className="text-sm text-muted-foreground">{selectedIdol.personality}</p>
                <p className="text-xs text-green-400 mt-1">✓ 이 얼굴을 기반으로 AI가 생성합니다</p>
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
                    <SelectItem value="none">선택 안함</SelectItem>
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
                    <SelectItem value="none">선택 안함</SelectItem>
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
                    <SelectItem value="none">선택 안함</SelectItem>
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
                disabled={!selectedConcept || isPending || isGenerating || !canAfford(selectedConcept!)}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    AI 이미지 생성 중...
                  </div>
                ) : isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin">⭐</div>
                    포토카드 민팅 중...
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
                <li>• 내 아이돌 전용 포토카드를 AI로 생성</li>
                <li>• 높은 등급일수록 더 희귀하고 아름다운 포토카드</li>
                <li>• 시즌별로 다른 스타일의 포토카드 제작 가능</li>
                <li>• 생성된 포토카드는 컬렉션에서 확인 가능</li>
                <li>• 팬 하트는 다른 사람 포카에 하트를 받으면 획득</li>
                <li>• AI 생성에는 약 10-30초가 소요됩니다</li>
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

      {/* Generated Card Result Modal */}
      {showResult && generatedCard && (
        <Card className="p-6 glass-dark border-green-400/30 bg-green-400/5 mt-6">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-green-400 flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6" />
                포토카드 생성 완료!
              </h3>
              <p className="text-muted-foreground mt-2">
                새로운 포토카드가 성공적으로 생성되었습니다
              </p>
            </div>

            {/* Generated Prompts Display */}
            {(generatedCard?.prompt || generatedCard?.nano_banana_prompt) && (
              <div className="max-w-2xl mx-auto space-y-4">
                {/* Gemini Enhanced Prompt */}
                {generatedCard?.prompt && (
                  <Card className="glass-dark border-blue-500/30 bg-blue-500/5">
                    <div className="p-4">
                      <h4 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Gemini 향상된 프롬프트
                      </h4>
                      <div className="bg-background/50 rounded-lg p-3 border border-blue-500/20">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {generatedCard.prompt}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Nano Banana Formatted Prompt */}
                {generatedCard?.nano_banana_prompt && (
                  <Card className="glass-dark border-green-500/30 bg-green-500/5">
                    <div className="p-4">
                      <h4 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Nano Banana 최적화 프롬프트
                      </h4>
                      <div className="bg-background/50 rounded-lg p-3 border border-green-500/20">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {generatedCard.nano_banana_prompt}
                        </p>
                      </div>
                      <div className="mt-2 text-xs text-green-400/70">
                        💡 이 프롬프트는 Stable Diffusion/Nano Banana API에 최적화되었습니다.
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Card Preview */}
            <div className="max-w-sm mx-auto">
              <div className="relative bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl p-4 border border-white/20">
                <div className="aspect-[3/4] bg-gradient-primary/20 rounded-lg overflow-hidden mb-4 relative">
                  {generatedCard.image ? (
                    <img
                      src={generatedCard.image}
                      alt={generatedCard.idolName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('이미지 로드 실패:', e);
                        toast.error('생성된 이미지를 로드할 수 없습니다.');
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-primary/20">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  )}

                  {/* Rarity Badge */}
                  <div className="absolute top-2 right-2">
                    <Badge className={`${getRarityColor(generatedCard.rarity)} bg-black/50 backdrop-blur-sm`}>
                      {generatedCard.rarity}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-lg gradient-text">{generatedCard.idolName}</h4>
                    <Badge className={`${getRarityColor(generatedCard.rarity)} bg-transparent`}>
                      {generatedCard.rarity}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{generatedCard.concept}</p>
                  <p className="text-xs text-muted-foreground">{generatedCard.season}</p>
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>#{generatedCard.serialNo.toString().padStart(4, '0')}</span>
                    <span>/{generatedCard.totalSupply.toLocaleString()}</span>
                  </div>

                  {generatedCard.seed && (
                    <div className="text-xs text-muted-foreground text-center">
                      Seed: {generatedCard.seed}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button 
                onClick={handleContinueCreating}
                variant="outline" 
                className="flex-1"
                size="lg"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                계속 만들기
              </Button>
              <Button 
                onClick={handleGoToCollection}
                className="flex-1"
                size="lg"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                포카 보관함으로
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};