import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useCurrentAccount } from '@mysten/dapp-kit';

const PACKAGE_ID = '0x0709fa964224865db203e618c89c101c203d7b6b1ff9a6f13dfae4dccda5cba9';

export interface MarketplaceListing {
  id: string;
  photocardId: string;
  seller: string;
  price: number;
  listingType: 'sale' | 'auction';
  auctionEndTime?: number;
  highestBidder?: string;
  highestBid?: number;
  isActive: boolean;
  createdAt: number;
}

export interface PhotoCardSale {
  photocardId: string;
  seller: string;
  buyer: string;
  price: number;
  timestamp: number;
}

export const useMarketplaceService = () => {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const account = useCurrentAccount();

  // 마켓플레이스 리스팅 생성
  const createListing = async (
    photocardId: string,
    price: number,
    listingType: 'sale' | 'auction' = 'sale',
    auctionEndTime?: number
  ) => {
    if (!account?.address) {
      throw new Error('지갑이 연결되지 않았습니다.');
    }

    const txb = new Transaction();
    
    txb.moveCall({
      target: `${PACKAGE_ID}::photocard::create_listing`,
      arguments: [
        txb.object(photocardId),
        txb.pure.u64(price),
        txb.pure.string(listingType),
        txb.pure.u64(auctionEndTime || 0),
      ],
    });

    return new Promise((resolve, reject) => {
      signAndExecute(
        {
          transactionBlock: txb,
          options: {
            showEffects: true,
            showObjectChanges: true,
            showEvents: true,
          },
        },
        {
          onSuccess: (result) => {
            console.log('마켓플레이스 리스팅 생성 성공:', result);
            
            // 이벤트에서 결과 추출
            const events = result.events || [];
            const listingEvent = events.find(
              (event: any) => event.type.includes('PhotoCardListed')
            );
            
            if (listingEvent) {
              const parsedEvent = {
                photocardId: listingEvent.parsedJson.photocard_id,
                seller: listingEvent.parsedJson.seller,
                price: listingEvent.parsedJson.price,
                listingType: listingEvent.parsedJson.listing_type,
                timestamp: listingEvent.parsedJson.timestamp,
              };
              resolve(parsedEvent);
            } else {
              resolve(result);
            }
          },
          onError: (error) => {
            console.error('마켓플레이스 리스팅 생성 실패:', error);
            reject(error);
          },
        }
      );
    });
  };

  // 포토카드 구매
  const buyPhotoCard = async (
    listingId: string,
    paymentAmount: number
  ) => {
    if (!account?.address) {
      throw new Error('지갑이 연결되지 않았습니다.');
    }

    const txb = new Transaction();
    
    // SUI 코인 분할
    const [coin] = txb.splitCoins(txb.gas, [txb.pure.u64(paymentAmount)]);
    
    txb.moveCall({
      target: `${PACKAGE_ID}::photocard::buy_photocard`,
      arguments: [
        txb.object(listingId),
        coin,
      ],
    });

    return new Promise((resolve, reject) => {
      signAndExecute(
        {
          transactionBlock: txb,
          options: {
            showEffects: true,
            showObjectChanges: true,
            showEvents: true,
          },
        },
        {
          onSuccess: (result) => {
            console.log('포토카드 구매 성공:', result);
            
            // 이벤트에서 결과 추출
            const events = result.events || [];
            const saleEvent = events.find(
              (event: any) => event.type.includes('PhotoCardSold')
            );
            
            if (saleEvent) {
              const parsedEvent = {
                photocardId: saleEvent.parsedJson.photocard_id,
                seller: saleEvent.parsedJson.seller,
                buyer: saleEvent.parsedJson.buyer,
                price: saleEvent.parsedJson.price,
                timestamp: saleEvent.parsedJson.timestamp,
              };
              resolve(parsedEvent);
            } else {
              resolve(result);
            }
          },
          onError: (error) => {
            console.error('포토카드 구매 실패:', error);
            reject(error);
          },
        }
      );
    });
  };

  // 가격 계산 유틸리티
  const calculatePrice = (basePrice: number, rarity: 'N' | 'R' | 'SR' | 'SSR') => {
    const rarityMultipliers = {
      N: 1,
      R: 2,
      SR: 5,
      SSR: 10,
    };
    return basePrice * rarityMultipliers[rarity];
  };

  // 가격 포맷팅
  const formatPrice = (price: number) => {
    return (price / 1e9).toFixed(4) + ' SUI';
  };

  // 가격 히스토리 시뮬레이션 (실제로는 블록체인 이벤트에서 가져와야 함)
  const getPriceHistory = (photocardId: string) => {
    // 실제 구현에서는 블록체인 이벤트를 쿼리해야 함
    return [
      { timestamp: Date.now() - 86400000, price: 0.5 },
      { timestamp: Date.now() - 43200000, price: 0.6 },
      { timestamp: Date.now() - 21600000, price: 0.55 },
      { timestamp: Date.now(), price: 0.7 },
    ];
  };

  // 마켓플레이스 통계 시뮬레이션
  const getMarketplaceStats = () => {
    return {
      totalListings: 1250,
      totalVolume: 12500.5,
      averagePrice: 2.1,
      activeUsers: 450,
    };
  };

  return {
    createListing,
    buyPhotoCard,
    calculatePrice,
    formatPrice,
    getPriceHistory,
    getMarketplaceStats,
  };
};
