import { useState, useEffect } from 'react';
import { useWallet } from './useWallet';
import { purchaseHistoryService } from '@/services/purchaseHistoryService';
import { toast } from 'sonner';

export const useFreeInputTickets = () => {
  const { walletAddress } = useWallet();
  const [tickets, setTickets] = useState<number>(0);

  // localStorage에서 티켓 수량 로드
  useEffect(() => {
    const storedTickets = localStorage.getItem('freeInputTickets');
    setTickets(storedTickets ? parseInt(storedTickets) : 0);
  }, []);

  // 티켓 사용 (1개 차감)
  const useTicket = (): boolean => {
    if (tickets <= 0) return false;
    
    const newTickets = tickets - 1;
    setTickets(newTickets);
    localStorage.setItem('freeInputTickets', newTickets.toString());
    return true;
  };

  // 티켓 추가
  const addTickets = (amount: number) => {
    const newTickets = tickets + amount;
    setTickets(newTickets);
    localStorage.setItem('freeInputTickets', newTickets.toString());
  };

  // 티켓 구매
  const purchaseTickets = async (quantity: number): Promise<boolean> => {
    const priceMap: { [key: number]: number } = {
      1: 0.10,
      5: 0.40,
      10: 0.70,
    };

    const price = priceMap[quantity];
    if (!price) {
      toast.error('Invalid quantity');
      return false;
    }

    const currentSuiCoins = parseFloat(localStorage.getItem('suiCoins') || '0');
    
    if (currentSuiCoins < price) {
      toast.error(`SUI 코인이 부족합니다. ${price} SUI가 필요합니다.`);
      return false;
    }

    // SUI 코인 차감
    const newSuiCoins = currentSuiCoins - price;
    localStorage.setItem('suiCoins', newSuiCoins.toString());

    // 티켓 추가
    addTickets(quantity);

    // 구매 기록
    await purchaseHistoryService.recordPurchase({
      purchase_type: 'random_box', // 기존 타입 사용 (나중에 'free_input_ticket' 타입 추가 가능)
      item_name: `${quantity} Free Input Ticket${quantity > 1 ? 's' : ''}`,
      amount_sui: price,
      quantity: quantity,
      metadata: { type: 'free_input_ticket' }
    });

    toast.success(`🎫 자유 입력권 ${quantity}개 구매 완료!`);
    return true;
  };

  return {
    tickets,
    useTicket,
    addTickets,
    purchaseTickets,
  };
};
