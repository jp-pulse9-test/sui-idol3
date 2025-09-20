import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Image, 
  Search, 
  Filter, 
  Users, 
  Heart, 
  Calendar, 
  Trophy,
  Star,
  Sparkles,
  Grid3X3,
  List
} from "lucide-react";
import { useHeartSystem } from "@/hooks/useHeartSystem";
import { toast } from "sonner";
import { secureStorage } from "@/utils/secureStorage";

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

interface IdolStats {
  idolId: string;
  idolName: string;
  profileImage: string;
  totalCards: number;
  totalHearts: number;
  averageRarity: number;
  topCollector: string;
  latestCard: PhotoCard;
}

interface PublicGalleryProps {
  allPhotocards: PhotoCard[];
  selectedIdolId?: string;
  onIdolSelect?: (idolId: string) => void;
  viewMode?: 'grid' | 'list';
}

export const PublicGallery = ({ 
  allPhotocards, 
  selectedIdolId, 
  onIdolSelect,
  viewMode = 'grid'
}: PublicGalleryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<'recent' | 'hearts' | 'rarity' | 'name'>('hearts');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterConcept, setFilterConcept] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'idols' | 'gallery'>('idols');
  const [selectedCard, setSelectedCard] = useState<PhotoCard | null>(null);
  const [currentViewMode, setCurrentViewMode] = useState<'grid' | 'list'>(viewMode);
  
  const { dailyHearts, giveHeart, hasGivenHeart } = useHeartSystem();
  const currentWallet = secureStorage.getWalletAddress();

  // 아이돌별 통계 계산
  const idolStats: IdolStats[] = Object.values(
    allPhotocards
      .filter(card => card.isPublic)
      .reduce((acc, card) => {
        const idolId = card.idolId;
        if (!acc[idolId]) {
          acc[idolId] = {
            idolId,
            idolName: card.idolName,
            profileImage: card.imageUrl, // 첫 번째 이미지를 프로필로 사용
            totalCards: 0,
            totalHearts: 0,
            averageRarity: 0,
            topCollector: '',
            latestCard: card
          };
        }
        
        acc[idolId].totalCards += 1;
        acc[idolId].totalHearts += card.heartsReceived || 0;
        
        // 최신 카드 업데이트
        if (new Date(card.mintedAt) > new Date(acc[idolId].latestCard.mintedAt)) {
          acc[idolId].latestCard = card;
        }
        
        return acc;
      }, {} as Record<string, IdolStats>)
  );

  // 평균 희귀도 및 탑 컬렉터 계산
  idolStats.forEach(idol => {
    const idolCards = allPhotocards.filter(card => card.idolId === idol.idolId && card.isPublic);
    const rarityScores = idolCards.map(card => {
      switch(card.rarity) {
        case 'SSR': return 4;
        case 'SR': return 3;
        case 'R': return 2;
        case 'N': return 1;
        default: return 1;
      }
    });
    
    idol.averageRarity = rarityScores.reduce((a, b) => a + b, 0) / rarityScores.length || 0;
    
    // 소유자별 카드 수 계산
    const ownerCounts = idolCards.reduce((acc, card) => {
      acc[card.owner] = (acc[card.owner] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topCollectorEntry = Object.entries(ownerCounts).sort(([,a], [,b]) => b - a)[0];
    idol.topCollector = topCollectorEntry ? 
      `${topCollectorEntry[0].substring(0, 6)}...${topCollectorEntry[0].substring(38)} (${topCollectorEntry[1]}장)` : 
      '없음';
  });

  // 필터링된 포토카드
  const filteredCards = allPhotocards
    .filter(card => card.isPublic)
    .filter(card => selectedIdolId ? card.idolId === selectedIdolId : true)
    .filter(card => searchTerm === "" || 
      card.idolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.concept.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(card => filterRarity === 'all' || card.rarity === filterRarity)
    .filter(card => filterConcept === 'all' || card.concept === filterConcept)
    .sort((a, b) => {
      switch(sortBy) {
        case 'recent':
          return new Date(b.mintedAt).getTime() - new Date(a.mintedAt).getTime();
        case 'hearts':
          return (b.heartsReceived || 0) - (a.heartsReceived || 0);
        case 'rarity':
          const rarityOrder = { 'SSR': 4, 'SR': 3, 'R': 2, 'N': 1 };
          return rarityOrder[b.rarity] - rarityOrder[a.rarity];
        case 'name':
          return a.idolName.localeCompare(b.idolName);
        default:
          return 0;
      }
    });

  const getRarityColor = (rarity: string) => {
    switch(rarity) {
      case 'SSR': return 'border-yellow-400 bg-yellow-400/10';
      case 'SR': return 'border-purple-400 bg-purple-400/10';
      case 'R': return 'border-blue-400 bg-blue-400/10';
      case 'N': return 'border-gray-400 bg-gray-400/10';
      default: return 'border-gray-400 bg-gray-400/10';
    }
  };

  const handleGiveHeart = (cardId: string, cardOwnerId: string) => {
    if (giveHeart(cardId, cardOwnerId)) {
      // 하트 상태가 성공적으로 업데이트됨
    }
  };

  const formatWalletAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(38)}`;
  };

  const IdolCard = ({ idol }: { idol: IdolStats }) => (
    <Card 
      className="p-4 glass-dark border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group"
      onClick={() => onIdolSelect?.(idol.idolId)}
    >
      <div className="space-y-4">
        {/* 아이돌 헤더 */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-primary/20 border-2 border-primary/30">
            <img 
              src={idol.profileImage} 
              alt={idol.idolName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg gradient-text">{idol.idolName}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Image className="w-3 h-3" />
              <span>{idol.totalCards}개 작품</span>
              <Heart className="w-3 h-3 text-red-400" />
              <span>{idol.totalHearts.toLocaleString()}</span>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            평균 {idol.averageRarity.toFixed(1)}★
          </Badge>
        </div>

        {/* 최신 작품 미리보기 */}
        <div className="space-y-2">
          <div className="text-sm font-semibold text-muted-foreground">최신 작품</div>
          <div className="relative group">
            <img 
              src={idol.latestCard.imageUrl} 
              alt={idol.latestCard.concept}
              className="w-full h-32 object-cover rounded-lg border"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-sm font-semibold">{idol.latestCard.concept}</div>
                <Badge className={`mt-1 ${getRarityColor(idol.latestCard.rarity)}`}>
                  {idol.latestCard.rarity}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* 통계 정보 */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-card/30 rounded">
            <div className="text-muted-foreground">TOP 컬렉터</div>
            <div className="font-semibold truncate">{idol.topCollector}</div>
          </div>
          <div className="p-2 bg-card/30 rounded">
            <div className="text-muted-foreground">최근 업데이트</div>
            <div className="font-semibold">
              {new Date(idol.latestCard.mintedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  const PhotoCardItem = ({ card }: { card: PhotoCard }) => (
    <Card className={`overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer ${getRarityColor(card.rarity)}`}>
      <div className="aspect-[3/4] relative group">
        <img 
          src={card.imageUrl} 
          alt={`${card.idolName} - ${card.concept}`}
          className="w-full h-full object-cover"
          onClick={() => setSelectedCard(card)}
        />
        
        {/* 카드 정보 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
            <div className="text-sm font-semibold">{card.idolName}</div>
            <div className="text-xs text-gray-300">{card.concept}</div>
            <div className="flex items-center justify-between mt-2">
              <Badge className={`text-xs ${getRarityColor(card.rarity)}`}>
                {card.rarity}
              </Badge>
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-400" />
                <span className="text-xs">{card.heartsReceived || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 하트 버튼 */}
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white"
          onClick={(e) => {
            e.stopPropagation();
            handleGiveHeart(card.id, card.owner);
          }}
          disabled={hasGivenHeart(card.id) || card.owner === currentWallet}
        >
          <Heart className={`w-4 h-4 ${hasGivenHeart(card.id) ? 'fill-red-400 text-red-400' : ''}`} />
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold gradient-text flex items-center justify-center gap-2">
          <Image className="w-8 h-8" />
          공개 갤러리
        </h2>
        <p className="text-muted-foreground">
          모든 유저들이 만든 아이돌 포토카드를 구경하고 하트를 보내세요
        </p>
        
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Badge variant="outline" className="px-4 py-2">
            💖 일일 하트: {dailyHearts}개
          </Badge>
          <Badge variant="secondary" className="px-4 py-2">
            🎨 전체 작품: {allPhotocards.filter(c => c.isPublic).length}개
          </Badge>
          <Badge variant="secondary" className="px-4 py-2">
            👥 아이돌: {idolStats.length}명
          </Badge>
        </div>
      </div>

      {/* 검색 & 필터 */}
      <Card className="p-4 glass-dark border-white/10">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="아이돌 이름 또는 컨셉으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hearts">❤️ 하트순</SelectItem>
                <SelectItem value="recent">🕒 최신순</SelectItem>
                <SelectItem value="rarity">⭐ 희귀도순</SelectItem>
                <SelectItem value="name">📝 이름순</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterRarity} onValueChange={setFilterRarity}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="SSR">SSR</SelectItem>
                <SelectItem value="SR">SR</SelectItem>
                <SelectItem value="R">R</SelectItem>
                <SelectItem value="N">N</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentViewMode(currentViewMode === 'grid' ? 'list' : 'grid')}
            >
              {currentViewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </Card>

      {/* 탭 컨텐츠 */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="idols" className="data-[state=active]:bg-primary/20">
            👥 아이돌별 보기
          </TabsTrigger>
          <TabsTrigger value="gallery" className="data-[state=active]:bg-primary/20">
            🖼️ 갤러리 보기
          </TabsTrigger>
        </TabsList>

        <TabsContent value="idols" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {idolStats
              .sort((a, b) => b.totalHearts - a.totalHearts)
              .map((idol) => (
                <IdolCard key={idol.idolId} idol={idol} />
              ))
            }
          </div>
        </TabsContent>

        <TabsContent value="gallery" className="mt-6">
          {selectedIdolId && (
            <div className="mb-4 p-3 bg-primary/10 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  현재 선택: <strong>{idolStats.find(i => i.idolId === selectedIdolId)?.idolName}</strong>
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onIdolSelect?.('')}
                >
                  전체 보기
                </Button>
              </div>
            </div>
          )}
          
          <div className={`grid gap-4 ${
            currentViewMode === 'grid' 
              ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {filteredCards.map((card) => (
              <PhotoCardItem key={card.id} card={card} />
            ))}
          </div>

          {filteredCards.length === 0 && (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">조건에 맞는 포토카드가 없습니다.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* 카드 상세 모달 */}
      {selectedCard && (
        <Dialog open={!!selectedCard} onOpenChange={() => setSelectedCard(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span>{selectedCard.idolName} - {selectedCard.concept}</span>
                <Badge className={getRarityColor(selectedCard.rarity)}>
                  {selectedCard.rarity}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <img 
                  src={selectedCard.imageUrl} 
                  alt={`${selectedCard.idolName} - ${selectedCard.concept}`}
                  className="w-full aspect-[3/4] object-cover rounded-lg border"
                />
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold">{selectedCard.concept}</h3>
                  <p className="text-muted-foreground">시즌 {selectedCard.season}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="text-muted-foreground">시리얼 번호</div>
                    <div className="font-semibold">#{selectedCard.serialNo.toLocaleString()}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">발행 수량</div>
                    <div className="font-semibold">{selectedCard.totalSupply.toLocaleString()}장</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">소유자</div>
                    <div className="font-semibold">{formatWalletAddress(selectedCard.owner)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">받은 하트</div>
                    <div className="font-semibold text-red-400">{selectedCard.heartsReceived || 0}💖</div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    className="flex-1"
                    onClick={() => handleGiveHeart(selectedCard.id, selectedCard.owner)}
                    disabled={hasGivenHeart(selectedCard.id) || selectedCard.owner === currentWallet}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${hasGivenHeart(selectedCard.id) ? 'fill-current' : ''}`} />
                    {hasGivenHeart(selectedCard.id) ? '하트 완료' : '하트 보내기'}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};