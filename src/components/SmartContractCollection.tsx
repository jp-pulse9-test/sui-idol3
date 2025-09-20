import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePhotoCardMinting } from '@/services/photocardMintingStable';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { toast } from 'sonner';
import { Loader2, RefreshCw, ExternalLink, Image, User, Star, Heart } from 'lucide-react';

interface PhotoCardData {
  objectId: string;
  display?: {
    name?: string;
    description?: string;
    image_url?: string;
    attributes?: string;
  };
  content?: {
    fields: {
      idol_id: number;
      idol_name: string;
      rarity: string;
      concept: string;
      season: string;
      serial_no: number;
      total_supply: number;
      image_url: string;
      persona_prompt: string;
      minted_at: number;
    };
  };
}

interface IdolCardData {
  objectId: string;
  display?: {
    name?: string;
    description?: string;
    image_url?: string;
    attributes?: string;
  };
  content?: {
    fields: {
      idol_id: number;
      name: string;
      personality: string;
      image_url: string;
      persona_prompt: string;
      minted_at: number;
    };
  };
}

export const SmartContractCollection = () => {
  const { getUserPhotoCards, getUserIdolCards, isPending } = usePhotoCardMinting();
  const currentAccount = useCurrentAccount();
  const [photoCards, setPhotoCards] = useState<PhotoCardData[]>([]);
  const [idolCards, setIdolCards] = useState<IdolCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('photocards');

  const loadCollections = async () => {
    if (!currentAccount) {
      toast.error('지갑이 연결되지 않았습니다.');
      return;
    }

    setLoading(true);
    try {
      const [photoCardsData, idolCardsData] = await Promise.all([
        getUserPhotoCards(),
        getUserIdolCards(),
      ]);

      setPhotoCards(photoCardsData as PhotoCardData[]);
      setIdolCards(idolCardsData as IdolCardData[]);
      
      toast.success(`포토카드 ${photoCardsData.length}개, 아이돌 카드 ${idolCardsData.length}개를 불러왔습니다.`);
    } catch (error) {
      console.error('컬렉션 로드 실패:', error);
      toast.error('컬렉션을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentAccount) {
      loadCollections();
    }
  }, [currentAccount]);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('ko-KR');
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'SSR': return 'bg-purple-500';
      case 'SR': return 'bg-blue-500';
      case 'R': return 'bg-green-500';
      case 'N': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const openInExplorer = (objectId: string) => {
    const explorerUrl = `https://suiexplorer.com/object/${objectId}?network=testnet`;
    window.open(explorerUrl, '_blank');
  };

  if (!currentAccount) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            스마트 컨트랙트 컬렉션
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">지갑을 연결하여 컬렉션을 확인하세요.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            스마트 컨트랙트 컬렉션
          </CardTitle>
          <Button
            onClick={loadCollections}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            새로고침
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="photocards" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              포토카드 ({photoCards.length})
            </TabsTrigger>
            <TabsTrigger value="idolcards" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              아이돌 카드 ({idolCards.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="photocards" className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">포토카드를 불러오는 중...</span>
              </div>
            ) : photoCards.length === 0 ? (
              <div className="text-center py-8">
                <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">보유한 포토카드가 없습니다.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  포토카드를 민팅하여 컬렉션을 시작하세요!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {photoCards.map((card) => (
                  <Card key={card.objectId} className="overflow-hidden">
                    <div className="aspect-square relative">
                      {card.display?.image_url ? (
                        <img
                          src={card.display.image_url}
                          alt={card.display.name || '포토카드'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Image className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <Badge 
                        className={`absolute top-2 right-2 ${getRarityColor(card.content?.fields.rarity || 'N')}`}
                      >
                        {card.content?.fields.rarity || 'N'}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold truncate">
                        {card.display?.name || card.content?.fields.idol_name || 'Unknown'}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {card.display?.description || `${card.content?.fields.concept} - ${card.content?.fields.season}`}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="text-xs text-muted-foreground">
                          #{card.content?.fields.serial_no || 0}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openInExplorer(card.objectId)}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="idolcards" className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">아이돌 카드를 불러오는 중...</span>
              </div>
            ) : idolCards.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">보유한 아이돌 카드가 없습니다.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  아이돌 카드를 민팅하여 컬렉션을 시작하세요!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {idolCards.map((card) => (
                  <Card key={card.objectId} className="overflow-hidden">
                    <div className="aspect-square relative">
                      {card.display?.image_url ? (
                        <img
                          src={card.display.image_url}
                          alt={card.display.name || '아이돌 카드'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <User className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold truncate">
                        {card.display?.name || card.content?.fields.name || 'Unknown'}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {card.display?.description || card.content?.fields.personality}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="text-xs text-muted-foreground">
                          ID: {card.content?.fields.idol_id || 0}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openInExplorer(card.objectId)}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
