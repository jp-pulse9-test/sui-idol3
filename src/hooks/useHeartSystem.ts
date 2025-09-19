import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { isSuperAdmin, SUPER_ADMIN_DAILY_HEARTS } from "@/utils/adminWallets";
import { secureStorage } from "@/utils/secureStorage";

interface HeartSystemState {
  dailyHearts: number;
  fanHearts: number;
  givenHearts: Record<string, boolean>; // cardId -> hasGivenHeart
}

export const useHeartSystem = () => {
  const [heartState, setHeartState] = useState<HeartSystemState>(() => {
    const dailyHearts = parseInt(localStorage.getItem('dailyHearts') || '10');
    const fanHearts = parseInt(localStorage.getItem('fanHearts') || '0');
    const givenHearts = JSON.parse(localStorage.getItem('givenHearts') || '{}');
    
    return { dailyHearts, fanHearts, givenHearts };
  });

  const giveHeart = useCallback((cardId: string, cardOwnerId: string) => {
    if (heartState.dailyHearts <= 0) {
      toast.error('오늘의 하트를 모두 사용했습니다!');
      return false;
    }

    if (heartState.givenHearts[cardId]) {
      toast.error('이미 이 포카에 하트를 보냈습니다!');
      return false;
    }

    // 자신의 포카에는 하트를 줄 수 없음
    const currentWallet = secureStorage.getWalletAddress();
    if (cardOwnerId === currentWallet) {
      toast.error('자신의 포카에는 하트를 줄 수 없습니다!');
      return false;
    }

    const newState = {
      ...heartState,
      dailyHearts: heartState.dailyHearts - 1,
      givenHearts: { ...heartState.givenHearts, [cardId]: true }
    };

    setHeartState(newState);
    
    // 로컬 스토리지 업데이트
    localStorage.setItem('dailyHearts', newState.dailyHearts.toString());
    localStorage.setItem('givenHearts', JSON.stringify(newState.givenHearts));

    // 포카 하트 수 업데이트
    updatePhotoCardHearts(cardId);
    
    // 포카 소유자의 팬 하트 증가 (실제로는 서버에서 처리)
    updateOwnerFanHearts(cardOwnerId);

    toast.success('💖 하트를 보냈습니다!');
    return true;
  }, [heartState]);

  const updatePhotoCardHearts = (cardId: string) => {
    const savedCards = JSON.parse(localStorage.getItem('photoCards') || '[]');
    const updatedCards = savedCards.map((card: any) => {
      if (card.id === cardId) {
        return { ...card, heartsReceived: (card.heartsReceived || 0) + 1 };
      }
      return card;
    });
    localStorage.setItem('photoCards', JSON.stringify(updatedCards));
  };

  const updateOwnerFanHearts = (ownerId: string) => {
    // 실제로는 서버에서 소유자의 팬 하트를 증가시켜야 함
    // 현재는 로컬에서만 시뮬레이션
    const currentWallet = secureStorage.getWalletAddress();
    if (ownerId === currentWallet) {
      const currentFanHearts = parseInt(localStorage.getItem('fanHearts') || '0');
      const newFanHearts = currentFanHearts + 1;
      localStorage.setItem('fanHearts', newFanHearts.toString());
      
      setHeartState(prev => ({ ...prev, fanHearts: newFanHearts }));
    }
  };

  const resetDailyHearts = useCallback(() => {
    const today = new Date().toDateString();
    const lastReset = localStorage.getItem('lastHeartReset');
    
    if (lastReset !== today) {
      const currentWallet = secureStorage.getWalletAddress() || '';
      const isAdmin = isSuperAdmin(currentWallet);
      const dailyAmount = isAdmin ? SUPER_ADMIN_DAILY_HEARTS : 10;
      
      const newState = {
        ...heartState,
        dailyHearts: dailyAmount,
        givenHearts: {} // 하트 기록도 초기화
      };
      
      setHeartState(newState);
      localStorage.setItem('dailyHearts', dailyAmount.toString());
      localStorage.setItem('givenHearts', '{}');
      localStorage.setItem('lastHeartReset', today);
    }
  }, [heartState]);

  const purchaseHearts = useCallback((quantity: number = 10) => {
    const suiCoins = parseFloat(localStorage.getItem('suiCoins') || '0');
    const cost = 0.15; // 10 하트 = 0.15 SUI (700원)
    
    if (suiCoins < cost) {
      toast.error('SUI 코인이 부족합니다. 0.15 SUI가 필요합니다.');
      return false;
    }

    const newFanHearts = heartState.fanHearts + quantity;
    const newSuiCoins = suiCoins - cost;
    
    const newState = { ...heartState, fanHearts: newFanHearts };
    setHeartState(newState);
    
    localStorage.setItem('fanHearts', newFanHearts.toString());
    localStorage.setItem('suiCoins', newSuiCoins.toFixed(2));
    
    toast.success(`💖 ${quantity}개의 팬 하트를 구매했습니다!`);
    return true;
  }, [heartState]);

  return {
    dailyHearts: heartState.dailyHearts,
    fanHearts: heartState.fanHearts,
    giveHeart,
    resetDailyHearts,
    purchaseHearts,
    hasGivenHeart: (cardId: string) => heartState.givenHearts[cardId] || false
  };
};