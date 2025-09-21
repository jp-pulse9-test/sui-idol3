import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePhotoCardMinting } from "@/services/photocardMintingStable";
import { AdvancedPhotocardGenerator } from "@/components/AdvancedPhotocardGenerator";
import { CrossChainMinting } from "@/components/CrossChainMinting";
import { googleGenAI } from "@/services/googleGenAI";
import { usePhotocardStorage } from "@/hooks/usePhotocardStorage";
import { useWallet } from "@/hooks/useWallet";
import { toast } from "sonner";
import { Camera, Sparkles, Heart, Star, Zap, ArrowRight, RotateCcw, Loader2, ArrowRightLeft, Database, Save } from "lucide-react";
import { WalrusClient, WalrusFile } from "@mysten/walrus";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";

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
  const { storePhotocard, isLoading: isStoring, error: storageError } = usePhotocardStorage();
  const { currentAccount } = useWallet();
  const [selectedConcept, setSelectedConcept] = useState<ConceptOption | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string>('Season 1');
  const [selectedWeather, setSelectedWeather] = useState<string>('none');
  const [selectedMood, setSelectedMood] = useState<string>('none');
  const [selectedTheme, setSelectedTheme] = useState<string>('none');
  const [generatedCard, setGeneratedCard] = useState<any | null>(null);
  const [isCrossChainModalOpen, setIsCrossChainModalOpen] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isStoringToWalrus, setIsStoringToWalrus] = useState(false);
  const {mutate: signAndExecute} = useSignAndExecuteTransaction();
  
  const suiClient = new SuiClient({
    url: getFullnodeUrl('testnet'),
    network: 'testnet',
  });
  const walrusClient = new WalrusClient(
    {network: 'testnet', suiClient}
  );

  const conceptOptions: ConceptOption[] = [
    {
      id: 'casual',
      name: 'Casual Daily',
      description: 'Comfortable and natural everyday look',
      cost: { sui: 0.05, hearts: 10 },
      rarity: 'R',
      icon: '👕'
    },
    {
      id: 'stage',
      name: 'Stage Performance',
      description: 'Glamorous appearance on stage',
      cost: { sui: 0.1, hearts: 20 },
      rarity: 'SR',
      icon: '🎤'
    },
    {
      id: 'fansign',
      name: 'Fan Meet',
      description: 'Special moments with fans',
      cost: { sui: 0.08, hearts: 15 },
      rarity: 'SR',
      icon: '✍️'
    },
    {
      id: 'photoshoot',
      name: 'Photo Shoot',
      description: 'Professional and beautiful pictorial',
      cost: { sui: 0.15, hearts: 30 },
      rarity: 'SSR',
      icon: '📸'
    },
    {
      id: 'special',
      name: 'Special Event',
      description: 'Limited edition special concept',
      cost: { sui: 0.2, hearts: 50 },
      rarity: 'SSR',
      icon: '⭐'
    }
  ];

  const seasons = ['Season 1', 'Season 2', 'Winter Special', 'Summer Edition'];
  
  const weatherOptions = [
    'Sunny ☀️', 'Cloudy ☁️', 'Rainy 🌧️', 'Snowy ❄️', 'Windy 💨',
    'Foggy 🌫️', 'Dawn 🌅', 'Sunset 🌇', 'Moonlit Night 🌙'
  ];
  
  const moodOptions = [
    'Happy 😊', 'Calm 😌', 'Mysterious 🪄', 'Romantic 💕', 'Cool 😎',
    'Cute 🥰', 'Mature 💼', 'Dreamy ✨', 'Energetic 🎉', 'Melancholy 🌧️'
  ];
  
  const themeOptions = [
    'Daily Life', 'Travel', 'Cafe', 'Park', 'Beach', 'City', 'School',
    'Home', 'Studio', 'Concert', 'Fan Meeting', 'Shopping', 'Drive'
  ];

  const handleGeneratePhotocard = async () => {
    if (!selectedConcept) {
      toast.error('Please select a concept!');
      return;
    }

    const { sui: suiCost, hearts: heartCost } = selectedConcept.cost;

    if (userCoins < suiCost) {
      toast.error('Insufficient SUI coins!');
      return;
    }

    if (fanHearts < heartCost) {
      toast.error('Insufficient fan hearts!');
      return;
    }

    setIsGenerating(true);

    try {
      // Compose additional detail information
      const additionalDetails = [
        selectedWeather && selectedWeather !== 'none' && selectedWeather,
        selectedMood && selectedMood !== 'none' && selectedMood,
        selectedTheme && selectedTheme !== 'none' && selectedTheme
      ].filter(Boolean).join(', ');

      // Generate image using Google GenAI (using idol profile image as reference)
      toast.info('🎨 AI is generating photocard...');

      // Idol profile image URL (use profile_image if available, otherwise use image)
      const profileImageUrl = selectedIdol.profile_image || selectedIdol.image;
      console.log('🖼️ Profile image URL being used:', profileImageUrl);
      console.log('🎭 Selected idol data:', {
        id: selectedIdol.id,
        name: selectedIdol.name,
        image: selectedIdol.image,
        profile_image: selectedIdol.profile_image
      });

      // Warning if no reference image
      if (!profileImageUrl) {
        console.warn('⚠️ WARNING: No profile image available for idol - consistency cannot be guaranteed');
        toast.warning('Idol consistency may not be guaranteed without reference image.');
      } else {
        console.log('✅ Reference image available - will maintain idol consistency');
        toast.info('🎭 Using idol reference image to maintain consistency.');
      }

      const imageResult = await googleGenAI.generatePhotocard(
        selectedIdol.name,
        selectedConcept.name,
        additionalDetails,
        selectedIdol.personality,
        profileImageUrl // 아이돌 프로필 이미지를 참조로 전달
      );

      if (!imageResult.success) {
        throw new Error(imageResult.error || 'Failed to generate image.');
      }

      const generatedImageUrl = imageResult.data!.image_url;
      setGeneratedImageUrl(generatedImageUrl);

      
      // Prepare minting data
      const conceptDescription = additionalDetails ? `${selectedConcept.name} (${additionalDetails})` : selectedConcept.name;

      const mintingData = {
        idolId: selectedIdol.id,
        idolName: selectedIdol.name,
        rarity: selectedConcept.rarity,
        concept: conceptDescription,
        season: selectedSeason,
        serialNo: Math.floor(Math.random() * 10000) + 1,
        totalSupply: selectedConcept.rarity === 'SSR' ? 500 : selectedConcept.rarity === 'SR' ? 2000 : 5000,
        imageUrl: generatedImageUrl, // Use generated image URL
        personaPrompt: selectedIdol.persona_prompt || selectedIdol.personality,
      };

      const cardData = {
        idolName: selectedIdol.name,
        concept: conceptDescription,
        rarity: selectedConcept.rarity,
        season: selectedSeason,
        image: generatedImageUrl, // Use generated image URL
        serialNo: mintingData.serialNo,
        totalSupply: mintingData.totalSupply,
        seed: imageResult.data!.seed,
        prompt: imageResult.data!.prompt // Gemini enhanced prompt
      };

      // Perform actual minting
      await mintPhotoCard(mintingData);

      // Deduct costs
      onCostDeduction(suiCost, heartCost);

      setGeneratedCard(cardData);
      setShowResult(true);

      toast.success(`🎉 ${selectedIdol.name}'s ${selectedConcept.name} photocard has been created!`);
    } catch (error) {
      console.error('Photocard generation failed:', error);
      toast.error(`Photocard generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  const handleStoreToWalrus = async () => {
    if (!currentAccount) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!generatedCard || !generatedImageUrl) {
      toast.error('No photocard to save');
      return;
    }

    setIsStoringToWalrus(true);

    try {
      // Generate photocard metadata
      const metadata = {
        id: `photocard_${selectedIdol.id}_${Date.now()}`,
        idolId: selectedIdol.id,
        idolName: selectedIdol.name,
        rarity: generatedCard.rarity,
        concept: generatedCard.concept,
        season: generatedCard.season,
        serialNo: generatedCard.serialNo,
        totalSupply: generatedCard.totalSupply,
        mintedAt: new Date().toISOString(),
        owner: currentAccount.address,
        imageUrl: generatedImageUrl,
        personaPrompt: selectedIdol.persona_prompt || selectedIdol.personality,
        seed: generatedCard.seed,
        prompt: generatedCard.prompt,
        weather: selectedWeather !== 'none' ? selectedWeather : undefined,
        mood: selectedMood !== 'none' ? selectedMood : undefined,
        theme: selectedTheme !== 'none' ? selectedTheme : undefined,
        isAdvanced: false
      };

      const res = await fetch(generatedImageUrl);
      const blob = await (await res.blob()).arrayBuffer();

      const flow = walrusClient.writeFilesFlow({
        files: [
          WalrusFile.from({
            contents: new Uint8Array(blob),
            identifier: "photocard.png"
          })
        ]
      });

      await flow.encode();

      const registerTx = flow.register({
        epochs: 2,
        deletable: true,
        owner: currentAccount.address,
      });

      console.log("Walrus??????")

      signAndExecute({transaction: registerTx},{onSuccess: () => {
        toast.success('Photocard saved to Walrus!');
        console.log("Walrus!!!!!!!")
      }, onError: (e)=>{
        console.log(e)
      }});


      console.log("Walrus!!!!!!!2222")


      // Save to Walrus
      const result = await storePhotocard(metadata, generatedImageUrl, {
        epochs: 10, // 포토카드는 오래 보관
        deletable: false, // 포토카드는 삭제 불가
        account: currentAccount
      });

      toast.success(`🎉 Photocard saved to Walrus! Blob ID: ${result.blobId.slice(0, 8)}...`);
    } catch (error) {
      console.error('Walrus save failed:', error);
      toast.error(`Failed to save to Walrus: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsStoringToWalrus(false);
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
          My Idol Photocard Generator
        </h3>
        <p className="text-muted-foreground">
          Create special moments of {selectedIdol.name} as photocards
        </p>

        {/* Reference Image Preview */}
        <div className="flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Reference Image</p>
            <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-primary/30">
              <img
                src={selectedIdol.profile_image || selectedIdol.image}
                alt={`${selectedIdol.name} Profile`}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{selectedIdol.name}</p>
          </div>
        </div>
      </div>


      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic Generation</TabsTrigger>
          <TabsTrigger value="advanced" disabled={!hasAdvancedAccess}>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Advanced Generation
              {!hasAdvancedAccess && <span className="text-xs">(Access Required)</span>}
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
                  <span className="text-xs text-white">Reference Image</span>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold gradient-text">{selectedIdol.name}</h4>
                <p className="text-sm text-muted-foreground">{selectedIdol.personality}</p>
                <p className="text-xs text-green-400 mt-1">✓ AI generates based on this face</p>
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
                  Season Selection
                </h4>
                <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                  <SelectTrigger className="bg-card/50">
                    <SelectValue placeholder="Select a season" />
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
                  ☀️ Weather
                </h4>
                <Select value={selectedWeather} onValueChange={setSelectedWeather}>
                  <SelectTrigger className="bg-card/50">
                    <SelectValue placeholder="Select weather (optional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border z-50">
                    <SelectItem value="none">Not Selected</SelectItem>
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
                  😊 Mood/Atmosphere
                </h4>
                <Select value={selectedMood} onValueChange={setSelectedMood}>
                  <SelectTrigger className="bg-card/50">
                    <SelectValue placeholder="Select mood (optional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border z-50">
                    <SelectItem value="none">Not Selected</SelectItem>
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
                  🎨 Theme
                </h4>
                <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                  <SelectTrigger className="bg-card/50">
                    <SelectValue placeholder="Select theme (optional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border z-50">
                    <SelectItem value="none">Not Selected</SelectItem>
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
              Concept Selection
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
                  <h4 className="font-semibold text-primary">Selected Concept</h4>
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
                    Generating AI image...
                  </div>
                ) : isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin">⭐</div>
                    Minting photocard...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Generate Photocard
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
                Photocard Generation Guide
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Generate exclusive photocards for your idol using AI</li>
                <li>• Higher rarity creates more rare and beautiful photocards</li>
                <li>• Create different styles of photocards by season</li>
                <li>• Generated photocards can be viewed in collection</li>
                <li>• Fan hearts are earned when others like your photocards</li>
                <li>• AI generation takes approximately 10-30 seconds</li>
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
                <h3 className="text-xl font-bold text-amber-400">Advanced Generation Access Required</h3>
                <p className="text-muted-foreground">
                  Open Ultra Boxes to gain advanced photocard generation access!
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
                Photocard Generation Complete!
              </h3>
              <p className="text-muted-foreground mt-2">
                New photocard has been successfully generated
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
                        Gemini Enhanced Prompt
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
                        Nano Banana Optimized Prompt
                      </h4>
                      <div className="bg-background/50 rounded-lg p-3 border border-green-500/20">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {generatedCard.nano_banana_prompt}
                        </p>
                      </div>
                      <div className="mt-2 text-xs text-green-400/70">
                        💡 This prompt is optimized for Stable Diffusion/Nano Banana API.
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
                        console.error('Image load failed:', e);
                        toast.error('Cannot load generated image.');
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
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button 
                  onClick={handleContinueCreating}
                  variant="outline" 
                  className="flex-1"
                  size="lg"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Continue Creating
                </Button>
                <Button 
                  onClick={() => setIsCrossChainModalOpen(true)}
                  variant="outline"
                  className="px-4"
                  size="lg"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={handleGoToCollection}
                  className="flex-1"
                  size="lg"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Go to Collection
                </Button>
              </div>
              
              {/* Walrus 저장 버튼 */}
              <Button 
                onClick={handleStoreToWalrus}
                disabled={!currentAccount || isStoringToWalrus || isStoring}
                variant="secondary"
                className="w-full"
                size="lg"
              >
                {isStoringToWalrus || isStoring ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving to Walrus...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Save to Walrus Distributed Storage
                  </div>
                )}
              </Button>
              
              {storageError && (
                <div className="text-sm text-red-400 text-center">
                  Storage error: {storageError}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Cross Chain Minting Modal */}
      {generatedCard && (
        <CrossChainMinting
          isOpen={isCrossChainModalOpen}
          onClose={() => setIsCrossChainModalOpen(false)}
          photocardData={{
            id: generatedCard.id || `photocard_${Date.now()}`,
            idolName: generatedCard.idolName,
            imageUrl: generatedCard.image,
            rarity: generatedCard.rarity,
            concept: generatedCard.concept
          }}
        />
      )}
    </div>
  );
};