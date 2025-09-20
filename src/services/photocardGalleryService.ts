import { useSuiClient } from '@mysten/dapp-kit';
import { useCurrentAccount } from '@mysten/dapp-kit';

const PACKAGE_ID = '0x0709fa964224865db203e618c89c101c203d7b6b1ff9a6f13dfae4dccda5cba9';

export interface PhotoCard {
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

export interface PhotoCardFilter {
  rarity?: 'N' | 'R' | 'SR' | 'SSR';
  idolId?: string;
  concept?: string;
  season?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'rarity' | 'price' | 'date' | 'hearts';
  sortOrder?: 'asc' | 'desc';
}

export const usePhotoCardGalleryService = () => {
  const client = useSuiClient();
  const account = useCurrentAccount();

  // 사용자의 포토카드 조회
  const getUserPhotoCards = async (): Promise<PhotoCard[]> => {
    if (!account?.address) {
      throw new Error('지갑이 연결되지 않았습니다.');
    }

    try {
      const objects = await client.getOwnedObjects({
        owner: account.address,
        filter: {
          StructType: `${PACKAGE_ID}::photocard::PhotoCard`,
        },
        options: {
          showContent: true,
          showDisplay: true,
        },
      });

      return objects.data.map((obj: any) => {
        const content = obj.data?.content;
        if (content?.dataType === 'moveObject') {
          const fields = content.fields;
          return {
            id: obj.data?.objectId || '',
            idolId: fields.idol_id || '',
            idolName: fields.idol_name || '',
            rarity: fields.rarity || 'N',
            concept: fields.concept || '',
            season: fields.season || '',
            serialNo: parseInt(fields.serial_no || '0'),
            totalSupply: parseInt(fields.total_supply || '0'),
            mintedAt: new Date(parseInt(fields.minted_at || '0')).toISOString(),
            owner: fields.owner || '',
            isPublic: true,
            imageUrl: fields.image_url || '',
            floorPrice: 0.1,
            lastSalePrice: 0.05,
            heartsReceived: Math.floor(Math.random() * 100),
          };
        }
        return null;
      }).filter(Boolean) as PhotoCard[];
    } catch (error) {
      console.error('포토카드 조회 실패:', error);
      return [];
    }
  };

  // 모든 포토카드 조회 (공개된 것만)
  const getAllPhotoCards = async (filter?: PhotoCardFilter): Promise<PhotoCard[]> => {
    try {
      // 실제 구현에서는 블록체인에서 모든 포토카드를 조회해야 함
      // 현재는 시뮬레이션 데이터 반환
      const mockPhotoCards: PhotoCard[] = [
        {
          id: '1',
          idolId: '1',
          idolName: '아이유',
          rarity: 'SSR',
          concept: 'Spring Collection',
          season: '2024',
          serialNo: 1,
          totalSupply: 100,
          mintedAt: new Date().toISOString(),
          owner: account?.address || '',
          isPublic: true,
          imageUrl: 'https://example.com/iu-ssr.jpg',
          floorPrice: 5.0,
          lastSalePrice: 4.5,
          heartsReceived: 150,
        },
        {
          id: '2',
          idolId: '2',
          idolName: '태연',
          rarity: 'SR',
          concept: 'Summer Vibes',
          season: '2024',
          serialNo: 1,
          totalSupply: 500,
          mintedAt: new Date().toISOString(),
          owner: account?.address || '',
          isPublic: true,
          imageUrl: 'https://example.com/taeyeon-sr.jpg',
          floorPrice: 2.0,
          lastSalePrice: 1.8,
          heartsReceived: 89,
        },
        {
          id: '3',
          idolId: '3',
          idolName: 'NewJeans',
          rarity: 'R',
          concept: 'Retro Wave',
          season: '2024',
          serialNo: 1,
          totalSupply: 1000,
          mintedAt: new Date().toISOString(),
          owner: account?.address || '',
          isPublic: true,
          imageUrl: 'https://example.com/newjeans-r.jpg',
          floorPrice: 0.8,
          lastSalePrice: 0.7,
          heartsReceived: 45,
        },
      ];

      return applyFilters(mockPhotoCards, filter);
    } catch (error) {
      console.error('포토카드 조회 실패:', error);
      return [];
    }
  };

  // 필터 적용
  const applyFilters = (photoCards: PhotoCard[], filter?: PhotoCardFilter): PhotoCard[] => {
    if (!filter) return photoCards;

    let filtered = [...photoCards];

    if (filter.rarity) {
      filtered = filtered.filter(pc => pc.rarity === filter.rarity);
    }

    if (filter.idolId) {
      filtered = filtered.filter(pc => pc.idolId === filter.idolId);
    }

    if (filter.concept) {
      filtered = filtered.filter(pc => 
        pc.concept.toLowerCase().includes(filter.concept!.toLowerCase())
      );
    }

    if (filter.season) {
      filtered = filtered.filter(pc => pc.season === filter.season);
    }

    if (filter.minPrice !== undefined) {
      filtered = filtered.filter(pc => (pc.floorPrice || 0) >= filter.minPrice!);
    }

    if (filter.maxPrice !== undefined) {
      filtered = filtered.filter(pc => (pc.floorPrice || 0) <= filter.maxPrice!);
    }

    // 정렬
    if (filter.sortBy) {
      filtered.sort((a, b) => {
        let aValue: any, bValue: any;

        switch (filter.sortBy) {
          case 'rarity':
            const rarityOrder = { N: 1, R: 2, SR: 3, SSR: 4 };
            aValue = rarityOrder[a.rarity];
            bValue = rarityOrder[b.rarity];
            break;
          case 'price':
            aValue = a.floorPrice || 0;
            bValue = b.floorPrice || 0;
            break;
          case 'date':
            aValue = new Date(a.mintedAt).getTime();
            bValue = new Date(b.mintedAt).getTime();
            break;
          case 'hearts':
            aValue = a.heartsReceived || 0;
            bValue = b.heartsReceived || 0;
            break;
          default:
            return 0;
        }

        if (filter.sortOrder === 'desc') {
          return bValue - aValue;
        } else {
          return aValue - bValue;
        }
      });
    }

    return filtered;
  };

  // 포토카드 통계
  const getPhotoCardStats = async (): Promise<{
    total: number;
    byRarity: Record<string, number>;
    byIdol: Record<string, number>;
    totalValue: number;
  }> => {
    const userPhotoCards = await getUserPhotoCards();
    
    const stats = {
      total: userPhotoCards.length,
      byRarity: {} as Record<string, number>,
      byIdol: {} as Record<string, number>,
      totalValue: 0,
    };

    userPhotoCards.forEach(pc => {
      // 레어도별 통계
      stats.byRarity[pc.rarity] = (stats.byRarity[pc.rarity] || 0) + 1;
      
      // 아이돌별 통계
      stats.byIdol[pc.idolName] = (stats.byIdol[pc.idolName] || 0) + 1;
      
      // 총 가치
      stats.totalValue += pc.floorPrice || 0;
    });

    return stats;
  };

  // 포토카드 검색
  const searchPhotoCards = async (query: string): Promise<PhotoCard[]> => {
    const allPhotoCards = await getAllPhotoCards();
    
    return allPhotoCards.filter(pc => 
      pc.idolName.toLowerCase().includes(query.toLowerCase()) ||
      pc.concept.toLowerCase().includes(query.toLowerCase()) ||
      pc.season.toLowerCase().includes(query.toLowerCase())
    );
  };

  return {
    getUserPhotoCards,
    getAllPhotoCards,
    getPhotoCardStats,
    searchPhotoCards,
    applyFilters,
  };
};
