import { Transaction } from '@mysten/sui/transactions';
import { useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';
import { toast } from 'sonner';

// 포토카드 민팅을 위한 Move 패키지 정보
const PHOTOCARD_PACKAGE_ID = '0x0709fa964224865db203e618c89c101c203d7b6b1ff9a6f13dfae4dccda5cba9';
const PHOTOCARD_MODULE = 'photocard';

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
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();

  const mintPhotoCard = async (mintingData: PhotoCardMintingData) => {
    if (!currentAccount) {
      throw new Error('지갑이 연결되지 않았습니다.');
    }
    
    try {
      // 개발 중에는 시뮬레이션 모드로 작동
      console.log('포토카드 민팅 (개발 모드):', mintingData);
      
      // 시뮬레이션 대기 시간
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 민팅된 포토카드 정보를 로컬 스토리지에 저장
      const mintedPhotoCard = {
        id: `pc-${Date.now()}`,
        tokenId: `dev_${Date.now()}`,
        txDigest: `dev_tx_${Date.now()}`,
        ...mintingData,
        mintedAt: new Date().toISOString(),
        owner: currentAccount.address,
        isPublic: true,
        heartsReceived: 0,
      };

      // 로컬 스토리지에 추가
      const walletKey = `photoCards_${currentAccount.address}`;
      const existingCards = JSON.parse(localStorage.getItem(walletKey) || '[]');
      existingCards.push(mintedPhotoCard);
      localStorage.setItem(walletKey, JSON.stringify(existingCards));

      toast.success('포토카드가 성공적으로 민팅되었습니다! (개발 모드)');
      return mintedPhotoCard;
      
      /* 실제 블록체인 민팅 코드 (현재 비활성화)
      const txb = new Transaction();

      // 포토카드 민팅 트랜잭션 구성
      txb.moveCall({
        target: `${PHOTOCARD_PACKAGE_ID}::${PHOTOCARD_MODULE}::mint_photocard`,
        arguments: [
          txb.pure.u64(mintingData.idolId),
          txb.pure.string(mintingData.idolName),
          txb.pure.string(mintingData.rarity),
          txb.pure.string(mintingData.concept),
          txb.pure.string(mintingData.season),
          txb.pure.u64(mintingData.serialNo),
          txb.pure.u64(mintingData.totalSupply),
          txb.pure.string(mintingData.imageUrl),
          txb.pure.string(mintingData.personaPrompt || ''),
        ],
      });

      // 트랜잭션 실행
      return new Promise((resolve, reject) => {
        signAndExecute(
          {
            transaction: txb,
          },
          {
            onSuccess: (result) => {
              console.log('포토카드 민팅 성공:', result);
              toast.success('포토카드가 성공적으로 민팅되었습니다!');
              
              const mintedPhotoCard = {
                id: `pc-${Date.now()}`,
                tokenId: result.digest,
                txDigest: result.digest,
                ...mintingData,
                mintedAt: new Date().toISOString(),
                owner: currentAccount.address,
                isPublic: true,
                heartsReceived: 0,
              };

              const walletKey = `photoCards_${currentAccount.address}`;
              const existingCards = JSON.parse(localStorage.getItem(walletKey) || '[]');
              existingCards.push(mintedPhotoCard);
              localStorage.setItem(walletKey, JSON.stringify(existingCards));

              resolve(result);
            },
            onError: (error) => {
              console.error('포토카드 민팅 실패:', error);
              toast.error(`포토카드 민팅에 실패했습니다: ${error.message || error}`);
              reject(error);
            },
          }
        );
      });
      */
    } catch (error) {
      console.error('포토카드 민팅 중 오류:', error);
      toast.error('포토카드 민팅 중 오류가 발생했습니다.');
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
    if (!currentAccount) {
      throw new Error('지갑이 연결되지 않았습니다.');
    }
    
    try {
      // 개발 중에는 시뮬레이션 모드로 작동
      console.log('아이돌 카드 민팅 (개발 모드):', idolData);
      
      // 시뮬레이션 대기 시간
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 아이돌 카드 정보를 로컬 스토리지에 저장
      const mintedIdolCard = {
        id: `idol-${Date.now()}`,
        tokenId: `dev_idol_${Date.now()}`,
        txDigest: `dev_idol_tx_${Date.now()}`,
        ...idolData,
        mintedAt: new Date().toISOString(),
        owner: currentAccount.address,
      };

      localStorage.setItem('selectedIdol', JSON.stringify(mintedIdolCard));
      toast.success('아이돌 카드가 성공적으로 민팅되었습니다! (개발 모드)');
      return mintedIdolCard;
      
      /* 실제 블록체인 민팅 코드 (현재 비활성화)
      const txb = new Transaction();

      // 아이돌 카드 민팅 트랜잭션 구성
      txb.moveCall({
        target: `${PHOTOCARD_PACKAGE_ID}::${PHOTOCARD_MODULE}::mint_idol_card`,
        arguments: [
          txb.pure.u64(idolData.id),
          txb.pure.string(idolData.name),
          txb.pure.string(idolData.personality),
          txb.pure.string(idolData.image),
          txb.pure.string(idolData.persona_prompt),
        ],
      });

      return new Promise((resolve, reject) => {
        signAndExecute(
          {
            transaction: txb,
          },
          {
            onSuccess: (result) => {
              console.log('아이돌 카드 민팅 성공:', result);
              toast.success('아이돌 카드가 성공적으로 민팅되었습니다!');
              
              const mintedIdolCard = {
                id: `idol-${Date.now()}`,
                tokenId: result.digest,
                txDigest: result.digest,
                ...idolData,
                mintedAt: new Date().toISOString(),
                owner: currentAccount.address,
              };

              localStorage.setItem('selectedIdol', JSON.stringify(mintedIdolCard));
              resolve(result);
            },
            onError: (error) => {
              console.error('아이돌 카드 민팅 실패:', error);
              toast.error(`아이돌 카드 민팅에 실패했습니다: ${error.message || error}`);
              reject(error);
            },
          }
        );
      });
      */
    } catch (error) {
      console.error('아이돌 카드 민팅 중 오류:', error);
      toast.error('아이돌 카드 민팅 중 오류가 발생했습니다.');
      throw error;
    }
  };

  return {
    mintPhotoCard,
    mintIdolCard,
    isPending,
  };
};