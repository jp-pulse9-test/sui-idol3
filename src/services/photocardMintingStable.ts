import { Transaction } from '@mysten/sui/transactions';
import { useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';
import { toast } from 'sonner';

// 포토카드 민팅을 위한 Move 패키지 정보
const PHOTOCARD_PACKAGE_ID = '0x39d1d59ddc953d4ff0c0f80f868d00bb1718e1d1807db6a3e5745fd4f03f79fe';
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
      const txb = new Transaction();

      // 포토카드 민팅 트랜잭션 구성 - 더 간단한 방식
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
            options: {
              showEffects: true,
              showObjectChanges: true,
            },
          },
          {
            onSuccess: (result) => {
              console.log('포토카드 민팅 성공:', result);
              toast.success('포토카드가 성공적으로 민팅되었습니다!');
              
              // 민팅된 포토카드 정보를 로컬 스토리지에 저장
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

              // 로컬 스토리지에 추가
              const existingCards = JSON.parse(localStorage.getItem('photoCards') || '[]');
              existingCards.push(mintedPhotoCard);
              localStorage.setItem('photoCards', JSON.stringify(existingCards));

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
            options: {
              showEffects: true,
              showObjectChanges: true,
            },
          },
          {
            onSuccess: (result) => {
              console.log('아이돌 카드 민팅 성공:', result);
              toast.success('아이돌 카드가 성공적으로 민팅되었습니다!');
              
              // 아이돌 카드 정보를 로컬 스토리지에 저장
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
