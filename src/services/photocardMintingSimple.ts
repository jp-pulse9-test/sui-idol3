import { toast } from 'sonner';

// 임시로 민팅 기능을 시뮬레이션하는 간단한 버전
export interface PhotoCardMintingData {
  idolId: number;
  idolName: string;
  rarity: 'N' | 'R' | 'SR' | 'SSR';
  concept: string;
  season: string;
  serialNo: number;
  totalSupply: number;
  imageUrl: string;
  personaPrompt?: string;
}

export const usePhotoCardMinting = () => {
  const mintPhotoCard = async (mintingData: PhotoCardMintingData) => {
    try {
      // 시뮬레이션된 민팅 (실제 블록체인 트랜잭션 대신)
      console.log('포토카드 민팅 시뮬레이션:', mintingData);
      
      // 2초 대기 (실제 트랜잭션 시간 시뮬레이션)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 민팅된 포토카드 정보를 로컬 스토리지에 저장
      const mintedPhotoCard = {
        id: `pc-${Date.now()}`,
        tokenId: `sim_${Date.now()}`,
        txDigest: `sim_tx_${Date.now()}`,
        ...mintingData,
        mintedAt: new Date().toISOString(),
        owner: 'current_user', // 실제 지갑 주소로 교체
        isPublic: true,
        heartsReceived: 0,
      };

      // 로컬 스토리지에 추가 (지갑별로 구분)
      const walletAddress = localStorage.getItem('walletAddress') || 'anonymous';
      const walletKey = `photoCards_${walletAddress}`;
      const existingCards = JSON.parse(localStorage.getItem(walletKey) || '[]');
      existingCards.push(mintedPhotoCard);
      localStorage.setItem(walletKey, JSON.stringify(existingCards));

      toast.success('포토카드가 성공적으로 민팅되었습니다! (시뮬레이션)');
      return mintedPhotoCard;
    } catch (error) {
      console.error('포토카드 민팅 실패:', error);
      toast.error('포토카드 민팅에 실패했습니다.');
      throw error;
    }
  };

  const mintIdolCard = async (idolData: {
    id: number;
    name: string;
    personality: string;
    image: string;
    persona_prompt: string;
  }) => {
    try {
      // 시뮬레이션된 아이돌 카드 민팅
      console.log('아이돌 카드 민팅 시뮬레이션:', idolData);
      
      // 2초 대기
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 아이돌 카드 정보를 로컬 스토리지에 저장
      const mintedIdolCard = {
        id: `idol-${Date.now()}`,
        tokenId: `sim_idol_${Date.now()}`,
        txDigest: `sim_idol_tx_${Date.now()}`,
        ...idolData,
        mintedAt: new Date().toISOString(),
        owner: 'current_user', // 실제 지갑 주소로 교체
      };

      localStorage.setItem('selectedIdol', JSON.stringify(mintedIdolCard));
      toast.success('아이돌 카드가 성공적으로 민팅되었습니다! (시뮬레이션)');
      return mintedIdolCard;
    } catch (error) {
      console.error('아이돌 카드 민팅 실패:', error);
      toast.error('아이돌 카드 민팅에 실패했습니다.');
      throw error;
    }
  };

  return {
    mintPhotoCard,
    mintIdolCard,
  };
};
