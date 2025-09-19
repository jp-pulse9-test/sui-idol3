import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaderboard } from "@/components/ui/leaderboard";
import { PhotoCardGallery } from "@/components/ui/photocard-gallery";
import { Marketplace } from "@/components/ui/marketplace";
import { secureStorage } from "@/utils/secureStorage";

interface SelectedIdol {
  id: number;
  name: string;
  personality: string;
  image: string;
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
}

interface LeaderboardEntry {
  rank: number;
  walletAddress: string;
  fanPoints: number;
  randomBoxOpens: number;
  photocardRarityScore: number;
  tradingContribution: number;
  badges: string[];
  avatar?: string;
}

interface MarketplaceListing {
  id: string;
  photocardId: string;
  idolName: string;
  concept: string;
  rarity: 'N' | 'R' | 'SR' | 'SSR';
  serialNo: number;
  imageUrl: string;
  price: number;
  seller: string;
  listedAt: string;
  isAuction: boolean;
  auctionEndTime?: string;
  currentBid?: number;
  isOwn?: boolean;
}

interface PriceHistory {
  id: string;
  photocardId: string;
  price: number;
  soldAt: string;
  seller: string;
  buyer: string;
}

const Rise = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuthGuard('/auth', true);
  
  const [selectedIdol, setSelectedIdol] = useState<SelectedIdol | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [photoCards, setPhotoCards] = useState<PhotoCard[]>([]);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'gallery' | 'marketplace'>('leaderboard');

  // Mock data - 실제 구현에서는 API로 대체
  const mockLeaderboardData: LeaderboardEntry[] = [
    {
      rank: 1,
      walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
      fanPoints: 15420,
      randomBoxOpens: 84,
      photocardRarityScore: 3200,
      tradingContribution: 12,
      badges: ["debut", "collector", "trader"],
      avatar: selectedIdol?.image
    },
    {
      rank: 2,
      walletAddress: walletAddress,
      fanPoints: 12800,
      randomBoxOpens: 67,
      photocardRarityScore: 2800,
      tradingContribution: 8,
      badges: ["debut", "collector"],
      avatar: selectedIdol?.image
    },
    // 더 많은 목 데이터...
  ];

  const mockMarketplaceListings: MarketplaceListing[] = [
    {
      id: "listing1",
      photocardId: "pc1",
      idolName: selectedIdol?.name || "Unknown",
      concept: "Summer Dream",
      rarity: 'SR',
      serialNo: 1234,
      imageUrl: selectedIdol?.image || "",
      price: 2.5,
      seller: "0x9876543210fedcba9876543210fedcba98765432",
      listedAt: "2024-01-20T15:30:00Z",
      isAuction: false
    },
    // 더 많은 목 데이터...
  ];

  const mockPriceHistory: PriceHistory[] = [
    {
      id: "sale1",
      photocardId: "pc1", 
      price: 3.2,
      soldAt: "2024-01-19T12:00:00Z",
      seller: "0x1111111111111111111111111111111111111111",
      buyer: "0x2222222222222222222222222222222222222222"
    },
    // 더 많은 목 데이터...
  ];

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
    
    // 포토카드 불러오기
    const savedCards = JSON.parse(localStorage.getItem('photoCards') || '[]');
    setPhotoCards(savedCards);
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

  const handlePurchase = (listingId: string) => {
    toast.success('포토카드를 구매했습니다!');
    // 실제 구매 로직 구현
  };

  const handleBid = (listingId: string, bidAmount: number) => {
    toast.success(`${bidAmount} SUI로 입찰했습니다!`);
    // 실제 입찰 로직 구현
  };

  if (!selectedIdol) {
    return <div className="min-h-screen bg-gradient-background flex items-center justify-center">
      <div className="text-center">로딩 중...</div>
    </div>;
  }

  const currentUserData = mockLeaderboardData.find(entry => entry.walletAddress === walletAddress);

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <h1 className="text-4xl font-bold gradient-text">
            📈 RISE - 리더보드 & 갤러리 & 마켓플레이스
          </h1>
          <p className="text-xl text-muted-foreground">
            경쟁·과시·유동성으로 완성되는 팬 생태계
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="px-4 py-2">
              🔗 {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              🎴 {photoCards.length}장 보유
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              🏆 {currentUserData?.rank || 'Unranked'}위
            </Badge>
          </div>
        </div>

        {/* 아이돌 & 시즌 정보 */}
        <Card className="p-6 glass-dark border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-primary/20">
                <img 
                  src={selectedIdol.image}
                  alt={selectedIdol.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold gradient-text">{selectedIdol.name}</h2>
                <p className="text-muted-foreground">{selectedIdol.personality}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Season 1</div>
              <div className="text-lg font-bold">2025 AI심쿵챌린지</div>
              <Badge variant="outline">시즌 종료까지 45일</Badge>
            </div>
          </div>
        </Card>

        {/* Rise Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'leaderboard' | 'gallery' | 'marketplace')} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-primary/20">
              🏆 리더보드
            </TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-primary/20">
              🖼️ 인물별 갤러리
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="data-[state=active]:bg-primary/20">
              🛒 2차 거래
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard" className="mt-8">
            <Leaderboard
              currentUser={currentUserData}
              globalLeaderboard={mockLeaderboardData}
              idolSpecificLeaderboard={mockLeaderboardData.filter(entry => entry.rank <= 50)}
              selectedIdolId={selectedIdol?.id.toString()}
            />
          </TabsContent>

          <TabsContent value="gallery" className="mt-8">
            <PhotoCardGallery
              photocards={photoCards}
              selectedIdolId={selectedIdol?.id.toString()}
              isPinterestMode={true}
            />
          </TabsContent>

          <TabsContent value="marketplace" className="mt-8">
            <Marketplace
              listings={mockMarketplaceListings}
              priceHistory={mockPriceHistory}
              onPurchase={handlePurchase}
              onBid={handleBid}
            />
          </TabsContent>
        </Tabs>

        {/* Navigation */}
        <div className="flex justify-center space-x-4 pt-8">
          <Button
            onClick={() => navigate('/vault')}
            variant="outline"
            size="lg"
            className="bg-card/80 backdrop-blur-sm border-border hover:bg-card"
          >
            ← VAULT로 돌아가기
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

export default Rise;