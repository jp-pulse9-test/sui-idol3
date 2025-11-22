import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { IdolChatInterface } from '@/components/IdolChatInterface';
import { useWallet } from '@/hooks/useWallet';
import { 
  ArrowLeft, 
  Gift, 
  BarChart3, 
  Users, 
  Copy,
  Check,
  Settings,
  Star,
  TrendingUp,
  TrendingDown,
  Package,
  Activity,
  Eye,
  EyeOff,
  ExternalLink,
  Download,
  MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface PhotoCard {
  id: string;
  name: string;
  rarity: 'N' | 'R' | 'SR' | 'SSR';
  image: string;
  mintedAt: Date;
  isPublic: boolean;
}

interface ActivityEvent {
  id: string;
  type: 'mint' | 'trade' | 'rank' | 'box';
  title: string;
  description: string;
  timestamp: Date;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface SelectedIdol {
  id: string;
  name: string;
  personality: string;
  image: string;
  level: number;
  badges: string[];
  voiceId?: string; // ElevenLabs voice ID
}

const My = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDemoMode = searchParams.get('demo') === 'true';
  const { isConnected, walletAddress } = useWallet();
  const [selectedIdol, setSelectedIdol] = useState<SelectedIdol | null>(null);
  const [photoCards, setPhotoCards] = useState<PhotoCard[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isPublicProfile, setIsPublicProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activityFilter, setActivityFilter] = useState<'all' | 'mint' | 'trade' | 'rank'>('all');
  const [showChat, setShowChat] = useState(false);

  // 데모 모드용 샘플 아이돌
  const demoIdol: SelectedIdol = {
    id: 'demo-idol',
    name: '지우',
    personality: 'ENFP - 열정적이고 창의적인 아티스트',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    level: 3,
    badges: ['신인', '체험판'],
    voiceId: 'xi3rF0t7dg7uN2M0WUhr'
  };

  useEffect(() => {
    // 데모 모드가 아니고 지갑도 연결 안 되어 있으면 메인으로
    if (!isDemoMode && !isConnected) {
      toast.error('지갑 연결이 필요합니다');
      navigate('/');
      return;
    }
    loadUserData();
  }, [isConnected, isDemoMode, navigate]);

  const loadUserData = async () => {
    try {
      // 데모 모드인 경우 샘플 아이돌 사용
      if (isDemoMode) {
        setSelectedIdol(demoIdol);
        setShowChat(true); // 데모 모드에서는 바로 채팅 화면 표시
      } else {
        // 선택된 아이돌 로드
        const savedIdol = localStorage.getItem('selectedIdol');
        if (savedIdol) {
          const idol = JSON.parse(savedIdol);
          setSelectedIdol({
            ...idol,
            level: 5,
            badges: ['데뷔', '팬클럽 100+']
          });
        }
      }

      // 포토카드 로드
      const savedCards = localStorage.getItem(`photoCards_${walletAddress}`);
      if (savedCards) {
        setPhotoCards(JSON.parse(savedCards));
      }

      // 활동 타임라인 모크 데이터
      const mockActivities: ActivityEvent[] = [
        {
          id: '1',
          type: 'mint',
          title: '새 포토카드 민팅',
          description: 'SSR 카드 획득! "무대 위의 천사"',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          icon: Star,
          color: 'text-yellow-500'
        },
        {
          id: '2',
          type: 'rank',
          title: '랭킹 상승',
          description: '15위 → 12위 (+3)',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
          icon: TrendingUp,
          color: 'text-green-500'
        },
        {
          id: '3',
          type: 'box',
          title: '랜덤박스 개봉',
          description: '데일리 프리박스 개봉',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          icon: Gift,
          color: 'text-blue-500'
        }
      ];
      setActivities(mockActivities);

    } catch (error) {
      console.error('사용자 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAddress = async () => {
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress);
        setCopied(true);
        toast.success('지갑 주소가 복사되었습니다!');
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast.error('주소 복사에 실패했습니다.');
      }
    }
  };

  const getRarityStats = () => {
    const stats = { N: 0, R: 0, SR: 0, SSR: 0 };
    photoCards.forEach(card => {
      stats[card.rarity]++;
    });
    return stats;
  };

  const getRecentCards = () => {
    return photoCards
      .sort((a, b) => b.mintedAt.getTime() - a.mintedAt.getTime())
      .slice(0, 6);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'SSR': return 'text-yellow-500 bg-yellow-500/10';
      case 'SR': return 'text-purple-500 bg-purple-500/10';
      case 'R': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const filteredActivities = activities.filter(activity => 
    activityFilter === 'all' || activity.type === activityFilter
  );

  if (!isDemoMode && !isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">지갑 연결이 필요해요</h2>
            <p className="text-muted-foreground mb-6">마이페이지를 보려면 먼저 지갑을 연결해주세요</p>
            <WalletConnectButton className="w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const rarityStats = getRarityStats();
  const recentCards = getRecentCards();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽 컬럼 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 내 최애 & 성향 */}
            {selectedIdol && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    내 최애
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={selectedIdol.image} alt={selectedIdol.name} />
                      <AvatarFallback>{selectedIdol.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{selectedIdol.name}</h3>
                      <p className="text-muted-foreground">{selectedIdol.personality}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">Lv.{selectedIdol.level}</Badge>
                        {selectedIdol.badges.map((badge, index) => (
                          <Badge key={index} className="bg-primary/10 text-primary border-primary/20">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="premium"
                        size="sm"
                        onClick={() => setShowChat(true)}
                        className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        심쿵톡
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/pick')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        PICK으로
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 자산 요약 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-500" />
                  내 보관함
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 레어도 분포 */}
                  <div>
                    <h4 className="font-medium mb-3">레어도 분포</h4>
                    <div className="space-y-2">
                      {Object.entries(rarityStats).map(([rarity, count]) => (
                        <div key={rarity} className="flex items-center justify-between">
                          <Badge className={getRarityColor(rarity)}>
                            {rarity}
                          </Badge>
                          <span className="text-sm font-medium">{count}장</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-center justify-between font-medium">
                        <span>총합</span>
                        <span>{photoCards.length}장</span>
                      </div>
                    </div>
                  </div>

                  {/* 최근 획득 */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">최근 획득 6개</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">공개</span>
                        <Switch
                          checked={isPublicProfile}
                          onCheckedChange={setIsPublicProfile}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {recentCards.map((card) => (
                        <div
                          key={card.id}
                          className="aspect-square bg-muted rounded-lg overflow-hidden relative group"
                        >
                          <img
                            src={card.image}
                            alt={card.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200" />
                          <Badge
                            className={`absolute top-1 right-1 text-xs ${getRarityColor(card.rarity)}`}
                          >
                            {card.rarity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* RISE 성과 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  상위 15% 팬! 한 번 더 빛나볼까요?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">12위</div>
                    <div className="text-sm text-muted-foreground">종합 랭킹</div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-500">+3</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">2,847</div>
                    <div className="text-sm text-muted-foreground">팬 포인트</div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-500">+156</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">48</div>
                    <div className="text-sm text-muted-foreground">보유 포카</div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-500">+5</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/rise')}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    전체 리더보드 보기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 오른쪽 컬럼 */}
          <div className="space-y-6">
            {/* 활동 타임라인 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-500" />
                  활동 타임라인
                </CardTitle>
                <Tabs value={activityFilter} onValueChange={(value) => setActivityFilter(value as any)}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">모두</TabsTrigger>
                    <TabsTrigger value="mint">포카</TabsTrigger>
                    <TabsTrigger value="trade">거래</TabsTrigger>
                    <TabsTrigger value="rank">랭크</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  {filteredActivities.length > 0 ? (
                    <div className="space-y-4">
                      {filteredActivities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3">
                          <div className={`p-2 rounded-full bg-muted ${activity.color}`}>
                            <activity.icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{activity.title}</div>
                            <div className="text-sm text-muted-foreground">{activity.description}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {activity.timestamp.toLocaleString('ko-KR')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">아직 조용... 랜덤박스 한 번 열어볼래요?</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => navigate('/vault')}
                      >
                        <Gift className="w-4 h-4 mr-2" />
                        랜덤박스 열기
                      </Button>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* 설정/프라이버시 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-500" />
                  설정 & 프라이버시
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">카드 공개 기본값</div>
                    <div className="text-sm text-muted-foreground">새로 획득하는 카드의 공개 설정</div>
                  </div>
                  <Switch
                    checked={isPublicProfile}
                    onCheckedChange={setIsPublicProfile}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Eye className="w-4 h-4 mr-2" />
                    공개 프로필 미리보기
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    데이터 내보내기
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate('/settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    전체 설정
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 심쿵톡 인터페이스 */}
      {selectedIdol && (
        <IdolChatInterface
          idol={{
            id: selectedIdol.id,
            name: selectedIdol.name,
            image: selectedIdol.image,
            personality: selectedIdol.personality
          }}
          isOpen={showChat}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
};

export default My;