import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Leaderboard } from "@/components/ui/leaderboard";
import { secureStorage } from "@/utils/secureStorage";
import { TrendingUp, ArrowLeft, Home } from "lucide-react";

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

interface IdolLeaderboardEntry {
  rank: number;
  idolId: string;
  idolName: string;
  personality: string;
  profileImage: string;
  totalFans: number;
  totalHearts: number;
  totalPhotocards: number;
  averageRarity: number;
  weeklyGrowth: number;
  category: string;
  concept: string;
}

const Rise = () => {
  const navigate = useNavigate();
  const [selectedIdol, setSelectedIdol] = useState<SelectedIdol | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [photoCards, setPhotoCards] = useState<PhotoCard[]>([]);
  const [activeTab, setActiveTab] = useState<'leaderboard'>('leaderboard');

  // Mock 아이돌 리더보드 데이터 - 실제 구현에서는 API로 대체
  const mockIdolLeaderboardData: IdolLeaderboardEntry[] = [
    {
      rank: 1,
      idolId: "1",
      idolName: "지우",
      personality: "밝고 활발한",
      profileImage: selectedIdol?.image || "/api/placeholder/120/120",
      totalFans: 15420,
      totalHearts: 98500,
      totalPhotocards: 8400,
      averageRarity: 4.2,
      weeklyGrowth: 12.5,
      category: "댄스",
      concept: "Summer Dream"
    },
    {
      rank: 2,
      idolId: selectedIdol?.id.toString() || "2",
      idolName: selectedIdol?.name || "내 최애",
      personality: selectedIdol?.personality || "사랑스러운",
      profileImage: selectedIdol?.image || "/api/placeholder/120/120",
      totalFans: 12800,
      totalHearts: 76300,
      totalPhotocards: 6700,
      averageRarity: 3.8,
      weeklyGrowth: 8.9,
      category: "보컬",
      concept: "Winter Story"
    },
    {
      rank: 3,
      idolId: "3",
      idolName: "하늘",
      personality: "차분하고 우아한",
      profileImage: "/api/placeholder/120/120",
      totalFans: 11200,
      totalHearts: 65400,
      totalPhotocards: 5900,
      averageRarity: 3.6,
      weeklyGrowth: 5.2,
      category: "랩",
      concept: "Spring Love"
    },
    {
      rank: 4,
      idolId: "4",
      idolName: "별",
      personality: "매력적이고 카리스마",
      profileImage: "/api/placeholder/120/120",
      totalFans: 9800,
      totalHearts: 58200,
      totalPhotocards: 5100,
      averageRarity: 3.4,
      weeklyGrowth: 7.1,
      category: "댄스",
      concept: "Autumn Wind"
    },
    {
      rank: 5,
      idolId: "5",
      idolName: "달",
      personality: "신비롭고 세련된",
      profileImage: "/api/placeholder/120/120",
      totalFans: 8900,
      totalHearts: 52100,
      totalPhotocards: 4600,
      averageRarity: 3.2,
      weeklyGrowth: 3.8,
      category: "보컬",
      concept: "Night Dream"
    }
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
    
    // 로컬 스토리지에서 모든 포카 불러오기 (공개 갤러리용)
    const savedCards = JSON.parse(localStorage.getItem('photoCards') || '[]');
    
    // Mock 데이터 추가 (실제로는 서버에서 모든 유저의 공개 포카를 가져옴)
    const mockPublicCards: PhotoCard[] = [
      ...savedCards,
      // 다른 유저들의 mock 데이터
      {
        id: 'mock-1',
        idolId: '1',
        idolName: '지우',
        rarity: 'SSR' as const,
        concept: 'Summer Paradise',
        season: 'Season 1',
        serialNo: 1001,
        totalSupply: 500,
        mintedAt: new Date(Date.now() - 86400000).toISOString(),
        owner: '0x1234567890abcdef1234567890abcdef12345678',
        isPublic: true,
        imageUrl: '/api/placeholder/300/400',
        heartsReceived: 124
      },
      {
        id: 'mock-2',
        idolId: '2',
        idolName: '하늘',
        rarity: 'SR' as const,
        concept: 'Winter Dream',
        season: 'Season 1',
        serialNo: 2001,
        totalSupply: 1000,
        mintedAt: new Date(Date.now() - 172800000).toISOString(),
        owner: '0xabcdef1234567890abcdef1234567890abcdef12',
        isPublic: true,
        imageUrl: '/api/placeholder/300/400',
        heartsReceived: 89
      }
    ];
    
    setPhotoCards(mockPublicCards);
  }, [navigate]);

  const currentIdolData = mockIdolLeaderboardData.find(entry => entry.idolId === selectedIdol?.id.toString());

  if (!selectedIdol) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">로딩 중...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <h1 className="text-4xl md:text-6xl font-bold gradient-text flex items-center justify-center gap-3">
            <TrendingUp className="w-12 h-12" />
            📈 RISE
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            아이돌 인기 순위를 확인하고, 포토카드를 전시하며, 자유롭게 거래하는 공간입니다.
          </p>
          
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Badge variant="outline" className="px-4 py-2">
              👑 {selectedIdol.name}님의 최애
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              🎴 {photoCards.length}장 보유
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              🏆 {currentIdolData?.rank || 'Unranked'}위
            </Badge>
          </div>
        </div>

        {/* 내 아이돌 현황 */}
        <Card className="p-6 glass-dark border-white/10">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">내 최애 아이돌</h3>
              <Badge variant="outline" className="text-accent border-accent/30">
                🏆 시즌 1 참여 중
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-primary/20 ring-2 ring-primary/20">
                <img 
                  src={selectedIdol.image}
                  alt={selectedIdol.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold gradient-text">{selectedIdol.name}</h2>
                <p className="text-muted-foreground">{selectedIdol.personality}</p>
                <p className="text-sm text-accent mt-1">
                  현재 {currentIdolData?.rank || 'Unranked'}위 • {currentIdolData?.totalFans.toLocaleString() || '0'}명의 팬
                </p>
              </div>
            </div>
            
            <div className="bg-muted/20 rounded-lg p-3">
              <p className="text-sm text-muted-foreground text-center">
                💫 매월 말 아이돌 어워드에서 상위 아이돌에게 특별 리워드 지급
              </p>
            </div>
          </div>
        </Card>

        {/* 탭 컨텐츠 */}
        <div className="mt-8">
          <Leaderboard
            currentIdol={currentIdolData}
            globalLeaderboard={mockIdolLeaderboardData}
            categoryLeaderboard={mockIdolLeaderboardData.filter(entry => entry.category === "댄스")}
            selectedCategory="댄스"
            allPhotocards={photoCards}
            onIdolClick={(idolId) => {
              // Navigate to marketplace with idol filter
              navigate(`/vault?tab=marketplace&idol=${idolId}`);
            }}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-center space-x-4 pt-8">
          <Button
            variant="outline"
            onClick={() => navigate('/vault')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            볼트로 돌아가기
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            홈으로
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Rise;