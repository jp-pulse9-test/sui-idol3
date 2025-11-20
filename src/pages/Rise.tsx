import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Leaderboard } from "@/components/ui/leaderboard";
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

  // Mock idol leaderboard data - to be replaced with API in actual implementation
  const mockIdolLeaderboardData: IdolLeaderboardEntry[] = [
    {
      rank: 1,
      idolId: "1",
      idolName: "Jiwoo",
      personality: "Bright and energetic",
      profileImage: selectedIdol?.image || "/api/placeholder/120/120",
      totalFans: 15420,
      totalHearts: 98500,
      totalPhotocards: 8400,
      averageRarity: 4.2,
      weeklyGrowth: 12.5,
      category: "Dance",
      concept: "Summer Dream"
    },
    {
      rank: 2,
      idolId: selectedIdol?.id.toString() || "2",
      idolName: selectedIdol?.name || "My Favorite",
      personality: selectedIdol?.personality || "Lovely",
      profileImage: selectedIdol?.image || "/api/placeholder/120/120",
      totalFans: 12800,
      totalHearts: 76300,
      totalPhotocards: 6700,
      averageRarity: 3.8,
      weeklyGrowth: 8.9,
      category: "Vocal",
      concept: "Winter Story"
    },
    {
      rank: 3,
      idolId: "3",
      idolName: "Haneul",
      personality: "Calm and elegant",
      profileImage: "/api/placeholder/120/120",
      totalFans: 11200,
      totalHearts: 65400,
      totalPhotocards: 5900,
      averageRarity: 3.6,
      weeklyGrowth: 5.2,
      category: "Rap",
      concept: "Spring Love"
    },
    {
      rank: 4,
      idolId: "4",
      idolName: "Byeol",
      personality: "Charming and charismatic",
      profileImage: "/api/placeholder/120/120",
      totalFans: 9800,
      totalHearts: 58200,
      totalPhotocards: 5100,
      averageRarity: 3.4,
      weeklyGrowth: 7.1,
      category: "Dance",
      concept: "Autumn Wind"
    },
    {
      rank: 5,
      idolId: "5",
      idolName: "Dal",
      personality: "Mysterious and sophisticated",
      profileImage: "/api/placeholder/120/120",
      totalFans: 8900,
      totalHearts: 52100,
      totalPhotocards: 4600,
      averageRarity: 3.2,
      weeklyGrowth: 3.8,
      category: "Vocal",
      concept: "Night Dream"
    }
  ];

  useEffect(() => {
    const savedIdol = localStorage.getItem('selectedIdol');
    
    if (!savedIdol) {
      toast.error("Please select an idol first!");
      navigate('/pick');
      return;
    }

    setSelectedIdol(JSON.parse(savedIdol));
    
    // Load photocards from local storage
    const savedCards = JSON.parse(localStorage.getItem('photoCards') || '[]');
    
    // Set up mock data
    const mockPublicCards: PhotoCard[] = [
      ...savedCards,
      // Mock data
      {
        id: 'mock-1',
        idolId: '1',
        idolName: 'Jiwoo',
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
        idolName: 'Haneul',
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
      <div className="text-center">Loading...</div>
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
            Check idol popularity rankings, display photocards, and trade freely.
          </p>
          
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Badge variant="outline" className="px-4 py-2">
              👑 {selectedIdol.name}'s Favorite
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              🎴 {photoCards.length} Cards Owned
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              🏆 Rank #{currentIdolData?.rank || 'Unranked'}
            </Badge>
          </div>
        </div>

        {/* My Idol Status */}
        <Card className="p-6 glass-dark border-white/10">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">My Favorite Idol</h3>
              <Badge variant="outline" className="text-accent border-accent/30">
                🏆 Participating in Season 1
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
                  Currently Rank #{currentIdolData?.rank || 'Unranked'} • {currentIdolData?.totalFans.toLocaleString() || '0'} fans
                </p>
              </div>
            </div>
            
            <div className="bg-muted/20 rounded-lg p-3">
              <p className="text-sm text-muted-foreground text-center">
                💫 Special rewards given to top idols at the monthly Idol Awards
              </p>
            </div>
          </div>
        </Card>

        {/* Tab Content */}
        <div className="mt-8">
          <Leaderboard
            currentIdol={currentIdolData}
            globalLeaderboard={mockIdolLeaderboardData}
            categoryLeaderboard={mockIdolLeaderboardData.filter(entry => entry.category === "Dance")}
            selectedCategory="Dance"
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
            Back to Vault
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Rise;