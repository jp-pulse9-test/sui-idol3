// Updated to use dailyFreeStatus instead of dailyFreeAttempts
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RandomBox } from "@/components/ui/random-box";
import { PhotoCardGallery } from "@/components/ui/photocard-gallery";
import { Marketplace } from "@/components/ui/marketplace";
import { HeartPurchase } from "@/components/HeartPurchase";
import { IdolPhotocardGenerator } from "@/components/IdolPhotocardGenerator";
import { Heart } from "lucide-react";
import { secureStorage } from "@/utils/secureStorage";
import { usePhotoCardMinting } from "@/services/photocardMintingSimple";
import { useWallet } from "@/hooks/useWallet";
import { dailyFreeBoxService } from "@/services/dailyFreeBoxService";

interface SelectedIdol {
  id: number;
  name: string;
  personality: string;
  image: string;
  persona_prompt?: string;
}

interface PhotoCard {
  id: string;
  idolId: string;
  idolName: string;
  rarity: 'N' | 'R' | 'SR' | 'SSR';
  concept: string;
  season: string;
  serialNo: number;
  totalSupply: number;
  mintedAt: string;
  owner: string;
  isPublic: boolean;
  imageUrl: string;
  floorPrice?: number;
  lastSalePrice?: number;
  heartsReceived?: number;
}

const Vault = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuthGuard('/', true);
  const { mintPhotoCard } = usePhotoCardMinting();
  const { isConnected, walletAddress: currentWalletAddress } = useWallet();
  
  const [selectedIdol, setSelectedIdol] = useState<SelectedIdol | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [suiCoins, setSuiCoins] = useState(1.0);
  const [fanHearts, setFanHearts] = useState(100); // 기본 하트 지급으로 컨셉 선택 가능하게 함
  const [dailyHearts, setDailyHearts] = useState(10);
  const [dailyFreeStatus, setDailyFreeStatus] = useState({
    canClaim: false,
    remainingSlots: 0,
    totalClaimsToday: 0,
    userHasClaimedToday: false,
    maxDailyClaims: 10
  });
  const [pityCounters, setPityCounters] = useState({
    sr: 0,
    ssr: 0
  });
  const [photoCards, setPhotoCards] = useState<PhotoCard[]>([]);
  const [activeTab, setActiveTab] = useState<'storage' | 'randombox' | 'collection' | 'generator' | 'marketplace'>('storage');
  const [isMinting, setIsMinting] = useState(false);
  const [hasAdvancedAccess, setHasAdvancedAccess] = useState(false);

  // Check URL params for tab and filters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['storage', 'randombox', 'collection', 'generator', 'marketplace'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, []);

  useEffect(() => {
    console.log('Vault useEffect triggered - User:', user, 'Loading:', loading);
    
    // user가 있을 때만 실행 (AuthContext에서 지갑 연결 확인됨)
    if (!user) return;

    console.log('Vault useEffect - User:', user);

    const savedIdol = localStorage.getItem('selectedIdol');
    console.log('Vault useEffect - Saved Idol:', savedIdol);

    setWalletAddress(user.wallet_address);

    if (!savedIdol) {
      console.log('No idol selected - user can still access vault but some features will be limited');
      setSelectedIdol(null);
    } else {
      try {
        const parsedIdol = JSON.parse(savedIdol);
        console.log('Parsed Idol:', parsedIdol);
        setSelectedIdol(parsedIdol);
      } catch (error) {
        console.error('Error parsing saved idol:', error);
        setSelectedIdol(null);
      }
    }
    
    // 로컬 스토리지에서 포카 불러오기
    const savedCards = JSON.parse(localStorage.getItem('photoCards') || '[]');
    setPhotoCards(savedCards);
    
    // 수이 코인 불러오기
    const savedSuiCoins = localStorage.getItem('suiCoins');
    if (savedSuiCoins) {
      setSuiCoins(parseFloat(savedSuiCoins));
    } else {
      setSuiCoins(1.0); // 기본값
      localStorage.setItem('suiCoins', '1.0');
    }
    
    const savedFanHearts = localStorage.getItem('fanHearts');
    if (savedFanHearts) {
      setFanHearts(parseInt(savedFanHearts));
    } else {
      // 기본값: 포토카드 생성을 위한 충분한 하트 지급
      setFanHearts(100);
      localStorage.setItem('fanHearts', '100');
      toast.success('💖 환영합니다! 100 팬 하트를 받았습니다!');
    }
    
    const savedDailyHearts = localStorage.getItem('dailyHearts');
    if (savedDailyHearts) {
      setDailyHearts(parseInt(savedDailyHearts));
    } else {
      setDailyHearts(10);
      localStorage.setItem('dailyHearts', '10');
    }
    
    // 매일 무료 박스 상태 로드 (비동기로 처리하여 렌더링 블로킹 방지)
    setTimeout(() => {
      loadDailyFreeStatus(user.wallet_address);
    }, 0);

    // 고급 접근 권한 로드
    const savedAdvancedAccess = localStorage.getItem('hasAdvancedAccess');
    if (savedAdvancedAccess === 'true') {
      setHasAdvancedAccess(true);
    }
    
    // 일일 하트 리셋 체크 (매일 자정)
    const lastHeartReset = localStorage.getItem('lastHeartReset');
    const today = new Date().toDateString();
    if (lastHeartReset !== today) {
      const dailyAmount = 10;
      setDailyHearts(dailyAmount);
      localStorage.setItem('dailyHearts', dailyAmount.toString());
      localStorage.setItem('lastHeartReset', today);
    }
  }, [user]);

  const loadDailyFreeStatus = async (walletAddress: string) => {
    try {
      console.log('Loading daily free status for:', walletAddress);
      const status = await dailyFreeBoxService.getStatus(walletAddress);
      console.log('Daily free status loaded:', status);
      setDailyFreeStatus(status);
    } catch (error) {
      console.error('Error loading daily free status:', error);
      // 에러가 발생해도 기본값으로 계속 진행
      setDailyFreeStatus({
        canClaim: false,
        remainingSlots: 0,
        totalClaimsToday: 10,
        userHasClaimedToday: true,
        maxDailyClaims: 10
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }
  
  if (!user) {
    return null;
  }

  const handleOpenRandomBox = async (type: "free" | "paid", boxCost?: number) => {
    // 랜덤박스 개봉 로직
    if (type === 'free' && !dailyFreeStatus.canClaim) {
      if (dailyFreeStatus.userHasClaimedToday) {
        toast.error('이미 오늘 무료 박스를 개봉했습니다.');
      } else {
        toast.error('오늘의 무료 박스 한정 수량이 소진되었습니다.');
      }
      return;
    }
    
    const cost = type === 'free' ? 0 : (boxCost || 0.15); // SUI 코인 기준
    if (type !== 'free' && suiCoins < cost) {
      toast.error('SUI 코인이 부족합니다.');
      return;
    }

    if (!isConnected) {
      toast.error('지갑을 먼저 연결해주세요!');
      return;
    }

    setIsMinting(true);

    try {
      // 무료 박스인 경우 클레임 처리
      if (type === 'free') {
        const claimResult = await dailyFreeBoxService.claimFreeBox(walletAddress);
        if (!claimResult.success) {
          toast.error(claimResult.error || '무료 박스 클레임에 실패했습니다.');
          setIsMinting(false);
          return;
        }
        
        // 상태 업데이트
        setDailyFreeStatus(prev => ({
          ...prev,
          userHasClaimedToday: true,
          canClaim: false,
          totalClaimsToday: claimResult.totalClaimsToday,
          remainingSlots: claimResult.remainingSlots
        }));
      }
      // 울트라 박스인 경우 고급 생성 권한 부여
      if (type === 'paid' && cost >= 0.45) {
        setHasAdvancedAccess(true);
        localStorage.setItem('hasAdvancedAccess', 'true');
        toast.success('🎉 고급 포토카드 생성 권한을 획득했습니다!');
      }

      // 랜덤 포카 수량 (1-10개)
      const cardCount = Math.floor(Math.random() * 10) + 1;
      const newPhotoCards: PhotoCard[] = [];
      
      const rarities = ['N', 'R', 'SR', 'SSR'] as const;
      const rarityWeights = { 'N': 50, 'R': 30, 'SR': 15, 'SSR': 5 };
      const concepts = ['Summer Dream', 'Winter Story', 'Spring Love', 'Autumn Wind'];

      for (let i = 0; i < cardCount; i++) {
        // 희귀도 가중치 기반 선택
        const random = Math.random() * 100;
        let rarity: typeof rarities[number] = 'N';
        let cumulativeWeight = 0;
        
        for (const [r, weight] of Object.entries(rarityWeights)) {
          cumulativeWeight += weight;
          if (random <= cumulativeWeight) {
            rarity = r as typeof rarities[number];
            break;
          }
        }

        const randomConcept = concepts[Math.floor(Math.random() * concepts.length)];

        const mintingData = {
          idolId: selectedIdol?.id || 1,
          idolName: selectedIdol?.name || 'Unknown',
          rarity: rarity,
          concept: randomConcept,
          season: 'Season 1',
          serialNo: Math.floor(Math.random() * 10000) + 1,
          totalSupply: 5000,
          imageUrl: selectedIdol?.image || '',
          personaPrompt: selectedIdol?.persona_prompt || '',
        };

        // 실제 포토카드 민팅
        await mintPhotoCard(mintingData);

        const newPhotoCard: PhotoCard = {
          id: `pc-${Date.now()}-${i}`,
          idolId: selectedIdol?.id.toString() || '1',
          idolName: selectedIdol?.name || 'Unknown',
          rarity: rarity,
          concept: randomConcept,
          season: 'Season 1',
          serialNo: Math.floor(Math.random() * 10000) + 1,
          totalSupply: 5000,
          mintedAt: new Date().toISOString(),
          owner: currentWalletAddress || walletAddress,
          isPublic: true,
          imageUrl: selectedIdol?.image || '',
          floorPrice: Math.random() * 5 + 1,
          lastSalePrice: Math.random() * 8 + 2,
          heartsReceived: 0
        };

        newPhotoCards.push(newPhotoCard);
      }

      // 상태 업데이트
      const updatedCards = [...photoCards, ...newPhotoCards];
      setPhotoCards(updatedCards);
      localStorage.setItem('photoCards', JSON.stringify(updatedCards));

      if (type !== 'free') {
        setSuiCoins(prev => {
          const newValue = prev - cost;
          localStorage.setItem('suiCoins', newValue.toFixed(2));
          return newValue;
        });
      }

      toast.success(`🎉 ${cardCount}장의 포토카드를 민팅했습니다!`);
    } catch (error) {
      console.error('포토카드 민팅 실패:', error);
      toast.error('포토카드 민팅에 실패했습니다.');
    } finally {
      setIsMinting(false);
    }
  };

  // 아이돌이 선택되지 않았어도 Vault 접근 허용 (제한된 기능)
  const showLimitedAccess = !selectedIdol;

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <h1 className="text-4xl font-bold gradient-text">
            🗃️ VAULT
          </h1>
          <p className="text-xl text-muted-foreground">
            {selectedIdol ? `${selectedIdol.name}와 함께하는 포토카드 수집 여정` : '포토카드 수집 여정'}
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="px-4 py-2">
              🔗 {walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}` : '지갑 연결 중...'}
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              💰 {suiCoins.toFixed(2)} SUI
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              ❤️ {fanHearts} 팬 하트
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              💝 {dailyHearts}/10 일일 하트
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              📦 {photoCards.length}장 보유
            </Badge>
          </div>
        </div>

        {/* 선택된 아이돌 정보 */}
        {selectedIdol ? (
          <Card className="p-6 glass-dark border-white/10">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-primary/20">
                <img
                  src={selectedIdol.image}
                  alt={selectedIdol.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold gradient-text">{selectedIdol.name}</h2>
                <p className="text-muted-foreground">{selectedIdol.personality}</p>
              </div>
              <Button
                onClick={() => navigate('/rise')}
                variant="outline"
                className="border-accent text-accent hover:bg-accent/20"
              >
                RISE로 이동 →
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-6 glass-dark border-amber-400/30 bg-amber-400/5">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-bold text-amber-400">아이돌을 선택해주세요</h2>
              <p className="text-muted-foreground">
                포토카드 생성과 일부 기능을 사용하려면 먼저 아이돌을 선택해야 합니다.
              </p>
              <Button
                onClick={() => navigate('/pick')}
                className="bg-amber-400 hover:bg-amber-500 text-black"
              >
                아이돌 선택하러 가기
              </Button>
            </div>
          </Card>
        )}

        {/* Vault Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'storage' | 'randombox' | 'collection' | 'generator' | 'marketplace')} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="storage" className="data-[state=active]:bg-primary/20">
              🗃️ 최애 수납
            </TabsTrigger>
            <TabsTrigger value="generator" className="data-[state=active]:bg-primary/20">
              📷 포카 생성
            </TabsTrigger>
            <TabsTrigger value="randombox" className="data-[state=active]:bg-primary/20">
              📦 랜덤박스
            </TabsTrigger>
            <TabsTrigger value="collection" className="data-[state=active]:bg-primary/20">
              🎴 포카 보관함
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="data-[state=active]:bg-primary/20">
              🛒 마켓플레이스
            </TabsTrigger>
          </TabsList>

          <TabsContent value="storage" className="mt-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* 최애 수납 현황 */}
              <Card className="p-6 glass-dark border-white/10">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold gradient-text">최애 수납 현황</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg">
                      <span>수납된 아이돌</span>
                      <Badge variant={selectedIdol ? "default" : "outline"}>
                        {selectedIdol ? selectedIdol.name : '선택 안됨'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg">
                      <span>보유 포토카드</span>
                      <Badge variant="secondary">{photoCards.length}장</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg">
                      <span>보유 SUI 코인</span>
                      <Badge variant="outline">{suiCoins.toFixed(2)} 💰</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg">
                      <span>팬 하트 포인트</span>
                      <Badge variant="outline">{fanHearts} ❤️</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg">
                      <span>선착순 무료 박스</span>
                      <Badge variant="outline">
                        {dailyFreeStatus.canClaim ? '신청가능' : dailyFreeStatus.userHasClaimedToday ? '완료' : '마감'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>

              {/* 최애 프로필 */}
              <Card className="p-6 glass-dark border-white/10">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold gradient-text">최애 프로필</h3>

                  {selectedIdol ? (
                    <div className="text-center space-y-4">
                      <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gradient-primary/20">
                        <img
                          src={selectedIdol.image}
                          alt={selectedIdol.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold">{selectedIdol.name}</h4>
                        <p className="text-muted-foreground">{selectedIdol.personality}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="p-3 bg-card/50 rounded-lg">
                          <div className="font-bold text-primary">수집률</div>
                          <div className="text-xl">{Math.min(photoCards.length * 5, 100)}%</div>
                        </div>
                        <div className="p-3 bg-card/50 rounded-lg">
                          <div className="font-bold text-accent">희귀도</div>
                          <div className="text-xl">
                            {photoCards.filter(card => card.rarity === 'SSR').length > 0 ? 'SSR' :
                             photoCards.filter(card => card.rarity === 'SR').length > 0 ? 'SR' :
                             photoCards.filter(card => card.rarity === 'R').length > 0 ? 'R' : 'N'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="w-32 h-32 mx-auto rounded-full bg-gradient-primary/20 flex items-center justify-center">
                        <span className="text-4xl">🎭</span>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-muted-foreground">아이돌 미선택</h4>
                        <p className="text-muted-foreground">아이돌을 선택하면 프로필이 표시됩니다</p>
                      </div>

                      <Button
                        onClick={() => navigate('/pick')}
                        variant="outline"
                        size="sm"
                      >
                        아이돌 선택하기
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

            <TabsContent value="generator" className="mt-8">
              {selectedIdol ? (
                <IdolPhotocardGenerator
                  selectedIdol={selectedIdol}
                  userCoins={suiCoins}
                  fanHearts={fanHearts}
                  hasAdvancedAccess={hasAdvancedAccess}
                  onCostDeduction={(suiCost, heartCost) => {
                    setSuiCoins(prev => {
                      const newValue = prev - suiCost;
                      localStorage.setItem('suiCoins', newValue.toFixed(2));
                      return newValue;
                    });
                    setFanHearts(prev => {
                      const newValue = prev - heartCost;
                      localStorage.setItem('fanHearts', newValue.toString());
                      return newValue;
                    });
                  }}
                  onNavigateToCollection={() => setActiveTab('collection')}
                />
              ) : (
                <Card className="p-8 glass-dark border-white/10">
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-bold">아이돌 선택 필요</h3>
                    <p className="text-muted-foreground">
                      포토카드를 생성하려면 먼저 아이돌을 선택해주세요.
                    </p>
                    <Button onClick={() => navigate('/pick')}>
                      아이돌 선택하러 가기
                    </Button>
                  </div>
                </Card>
              )}
            </TabsContent>

          <TabsContent value="randombox" className="mt-8">
            <RandomBox
              dailyFreeCount={dailyFreeStatus.totalClaimsToday}
              maxDailyFree={dailyFreeStatus.maxDailyClaims}
              userCoins={suiCoins}
              pityCounter={pityCounters}
              onOpenBox={handleOpenRandomBox}
              isOpening={isMinting}
            />
          </TabsContent>

          <TabsContent value="collection" className="mt-8">
            <PhotoCardGallery
              photocards={photoCards}
              selectedIdolId={selectedIdol?.id.toString() || ''}
            />
          </TabsContent>

          <TabsContent value="marketplace" className="mt-8">
            <Marketplace
              listings={[]} // 실제로는 API에서 가져올 예정
              priceHistory={[]} // 실제로는 API에서 가져올 예정
              userWallet={walletAddress}
              onPurchase={(listingId) => console.log('Purchase:', listingId)}
              onBid={(listingId, amount) => console.log('Bid:', listingId, amount)}
              onCreateListing={(photocardId, price, isAuction) => console.log('Create listing:', photocardId, price, isAuction)}
            />
          </TabsContent>
        </Tabs>

        {/* Navigation */}
        <div className="flex justify-center space-x-4 pt-8">
          <Button
            onClick={() => navigate('/pick')}
            variant="outline"
            size="lg"
            className="bg-card/80 backdrop-blur-sm border-border hover:bg-card"
          >
            ← 아이돌 선택
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
};

export default Vault;