import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
      const walletAddress = localStorage.getItem('walletAddress') || 'guest';
      
      console.log('포토카드 저장 중:', mintingData);
      
      // Supabase에 저장
      const { data: photocard, error } = await supabase
        .from('photocards')
        .insert({
          user_wallet: walletAddress,
          idol_id: mintingData.idolId,
          idol_name: mintingData.idolName,
          rarity: mintingData.rarity,
          concept: mintingData.concept,
          season: mintingData.season,
          serial_no: mintingData.serialNo,
          total_supply: mintingData.totalSupply,
          image_url: mintingData.imageUrl,
          persona_prompt: mintingData.personaPrompt,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Supabase 저장 실패:', error);
        throw error;
      }
      
      // 로컬 스토리지 동기화 (캐시용)
      const cachedCards = JSON.parse(localStorage.getItem('photoCards') || '[]');
      cachedCards.push(photocard);
      localStorage.setItem('photoCards', JSON.stringify(cachedCards));
      
      toast.success('✅ 포토카드가 컬렉션에 저장되었습니다!');
      return photocard;
    } catch (error) {
      console.error('포토카드 저장 실패:', error);
      toast.error('포토카드 저장에 실패했습니다.');
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
      console.log('아이돌 카드 저장:', idolData);
      
      const mintedIdolCard = {
        id: `idol-${Date.now()}`,
        tokenId: `sim_idol_${Date.now()}`,
        txDigest: `sim_idol_tx_${Date.now()}`,
        ...idolData,
        mintedAt: new Date().toISOString(),
        owner: 'current_user',
      };

      localStorage.setItem('selectedIdol', JSON.stringify(mintedIdolCard));
      toast.success('아이돌이 선택되었습니다!');
      return mintedIdolCard;
    } catch (error) {
      console.error('아이돌 카드 저장 실패:', error);
      toast.error('아이돌 선택에 실패했습니다.');
      throw error;
    }
  };

  return {
    mintPhotoCard,
    mintIdolCard,
  };
};
