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
import { HeartPurchase } from "@/components/HeartPurchase";
import { Heart } from "lucide-react";
import { isSuperAdmin, SUPER_ADMIN_INITIAL_SUI_COINS, SUPER_ADMIN_INITIAL_FAN_HEARTS, SUPER_ADMIN_DAILY_HEARTS } from "@/utils/adminWallets";
import { applySuperAdminBenefits, autoApplySuperAdminBenefits } from "@/utils/superAdminBenefits";
import { secureStorage } from "@/utils/secureStorage";

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
  const { isAuthenticated, loading } = useAuthGuard('/auth', true);
  
  const [selectedIdol, setSelectedIdol] = useState<SelectedIdol | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [suiCoins, setSuiCoins] = useState(1.0);
  const [fanHearts, setFanHearts] = useState(0);
  const [dailyHearts, setDailyHearts] = useState(10);
  const [dailyFreeAttempts, setDailyFreeAttempts] = useState(3);
  const [pityCounters, setPityCounters] = useState({
    basic: 0,
    premium: 0,
    special: 0
  });
  const [photoCards, setPhotoCards] = useState<PhotoCard[]>([]);
  const [activeTab, setActiveTab] = useState<'storage' | 'randombox' | 'collection'>('storage');

  useEffect(() => {
    const savedWallet = secureStorage.getWalletAddress();
    const savedIdol = localStorage.getItem('selectedIdol');
    
    if (!savedWallet) {
      toast.error("지갑을 먼저 연결해주세요!");
      navigate('/');
      return;
    }
    
    if (!savedIdol) {
      toast.error("먼저 아이돌을 선택해주세요!");
      navigate('/pick');
      return;
    }
  
    setWalletAddress(savedWallet);
    setSelectedIdol(JSON.parse(savedIdol));
    
    // 로컬 스토리지에서 포카 불러오기
    const savedCards = JSON.parse(localStorage.getItem('photoCards') || '[]');
    setPhotoCards(savedCards);
    
    // 수이 코인, 팬 하트, 일일 하트 불러오기 (수퍼어드민 특별 지급)
    const isAdmin = isSuperAdmin(savedWallet);
    
    const savedSuiCoins = localStorage.getItem('suiCoins');
    if (savedSuiCoins) {
      setSuiCoins(parseFloat(savedSuiCoins));
    } else if (isAdmin) {
      // 수퍼어드민 첫 로그인 시 특별 지급
      setSuiCoins(SUPER_ADMIN_INITIAL_SUI_COINS);
      localStorage.setItem('suiCoins', SUPER_ADMIN_INITIAL_SUI_COINS.toString());
      toast.success(`🎉 수퍼어드민 특별 지급! ${SUPER_ADMIN_INITIAL_SUI_COINS} SUI 코인 획득!`);
    } else {
      setSuiCoins(1.0); // 일반 유저 기본값
      localStorage.setItem('suiCoins', '1.0');
    }
    
    const savedFanHearts = localStorage.getItem('fanHearts');
    if (savedFanHearts) {
      setFanHearts(parseInt(savedFanHearts));
    } else if (isAdmin) {
      // 수퍼어드민 첫 로그인 시 특별 지급
      setFanHearts(SUPER_ADMIN_INITIAL_FAN_HEARTS);
      localStorage.setItem('fanHearts', SUPER_ADMIN_INITIAL_FAN_HEARTS.toString());
      toast.success(`💖 수퍼어드민 특별 지급! ${SUPER_ADMIN_INITIAL_FAN_HEARTS} 팬 하트 획득!`);
    }
    
    const savedDailyHearts = localStorage.getItem('dailyHearts');
    if (savedDailyHearts) {
      setDailyHearts(parseInt(savedDailyHearts));
    } else if (isAdmin) {
      setDailyHearts(SUPER_ADMIN_DAILY_HEARTS);
      localStorage.setItem('dailyHearts', SUPER_ADMIN_DAILY_HEARTS.toString());
    }
    
    const savedAttempts = localStorage.getItem('dailyFreeAttempts');
    if (savedAttempts) setDailyFreeAttempts(parseInt(savedAttempts));
    
    // 일일 하트 리셋 체크 (매일 자정) - 수퍼어드민은 더 많이 지급
    const lastHeartReset = localStorage.getItem('lastHeartReset');
    const today = new Date().toDateString();
    if (lastHeartReset !== today) {
      const dailyAmount = isAdmin ? SUPER_ADMIN_DAILY_HEARTS : 10;
      setDailyHearts(dailyAmount);
      localStorage.setItem('dailyHearts', dailyAmount.toString());
      localStorage.setItem('lastHeartReset', today);
    }

    // 수퍼어드민 특권 자동 적용
    autoApplySuperAdminBenefits();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null;
  }

  const handleOpenRandomBox = (type: "free" | "paid") => {
    // 랜덤박스 개봉 로직
    if (type === 'free' && dailyFreeAttempts <= 0) {
      toast.error('오늘의 무료 시도 횟수를 모두 사용했습니다.');
      return;
    }
    
    const cost = type === 'free' ? 0 : 0.15; // SUI 코인 기준
    if (type !== 'free' && suiCoins < cost) {
      toast.error('SUI 코인이 부족합니다.');
      return;
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
        owner: walletAddress,
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

    if (type === 'free') {
      setDailyFreeAttempts(prev => {
        const newValue = prev - 1;
        localStorage.setItem('dailyFreeAttempts', newValue.toString());
        return newValue;
      });
    } else {
      setSuiCoins(prev => {
        const newValue = prev - cost;
        localStorage.setItem('suiCoins', newValue.toFixed(2));
        return newValue;
      });
    }

    toast.success(`🎉 ${cardCount}장의 포토카드를 획득했습니다!`);
  };

  if (!selectedIdol) {
    return <div className="min-h-screen bg-gradient-background flex items-center justify-center">
      <div className="text-center">로딩 중...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <h1 className="text-4xl font-bold gradient-text">
            🗃️ VAULT - 최애 수납 & 랜덤박스 & 포카 생성
          </h1>
          <p className="text-xl text-muted-foreground">
            {selectedIdol.name}와 함께하는 포토카드 수집 여정
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="px-4 py-2">
              🔗 {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
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
            {isSuperAdmin(walletAddress) && (
              <Button
                onClick={() => {
                  applySuperAdminBenefits();
                  // 페이지 새로고침으로 상태 반영
                  window.location.reload();
                }}
                variant="outline"
                size="sm"
                className="text-yellow-400 border-yellow-400 hover:bg-yellow-400/10"
              >
                👑 수퍼어드민 특권 적용
              </Button>
            )}
            <Badge variant="secondary" className="px-4 py-2">
              📦 {photoCards.length}장 보유
            </Badge>
          </div>
        </div>

        {/* 선택된 아이돌 정보 */}
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

        {/* Vault Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'storage' | 'randombox' | 'collection')} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="storage" className="data-[state=active]:bg-primary/20">
              🗃️ 최애 수납
            </TabsTrigger>
            <TabsTrigger value="randombox" className="data-[state=active]:bg-primary/20">
              📦 랜덤박스
            </TabsTrigger>
            <TabsTrigger value="collection" className="data-[state=active]:bg-primary/20">
              🎴 포카 보관함
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
                      <Badge variant="default">{selectedIdol.name}</Badge>
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
                      <span>일일 무료 시도</span>
                      <Badge variant="outline">{dailyFreeAttempts}/3</Badge>
                    </div>
                  </div>
                </div>
              </Card>

              {/* 최애 프로필 */}
              <Card className="p-6 glass-dark border-white/10">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold gradient-text">최애 프로필</h3>
                  
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
                        <div className="text-xl">{photoCards.length * 5}%</div>
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
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="randombox" className="mt-8">
            <RandomBox
              dailyFreeCount={dailyFreeAttempts}
              maxDailyFree={3}
              userCoins={suiCoins}
              pityCounter={{ sr: pityCounters.premium, ssr: pityCounters.special }}
              onOpenBox={handleOpenRandomBox}
              isOpening={false}
            />
          </TabsContent>

          <TabsContent value="collection" className="mt-8">
            <PhotoCardGallery
              photocards={photoCards}
              selectedIdolId={selectedIdol.id.toString()}
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