import { Transaction } from '@mysten/sui/transactions';
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { toast } from 'sonner';

// 포토카드 민팅을 위한 Move 패키지 정보
const PHOTOCARD_PACKAGE_ID = '0x51bfb8010e6e72c43578eed4d5a940d8de233a9e2b83c166f8879d029bf41cc7';
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

export interface IdolCardMintingData {
  idolId: number;
  name: string;
  personality: string;
  imageUrl: string;
  personaPrompt: string;
}

export interface MintingResult {
  success: boolean;
  digest?: string;
  objectChanges?: any[];
  effects?: any;
  error?: string;
}

export const usePhotoCardMinting = () => {
  const { mutateAsync: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();

  // 포토카드 민팅 함수
  const mintPhotoCard = async (mintingData: PhotoCardMintingData): Promise<MintingResult> => {
    if (!currentAccount) {
      throw new Error('지갑이 연결되지 않았습니다.');
    }

    // 실제 블록체인 민팅 모드 (개발 모드 비활성화)
    const isDevMode = false;
    
    if (isDevMode) {
      console.log('개발 모드: 포토카드 민팅 시뮬레이션');
      
      // 개발 모드에서는 시뮬레이션된 결과 반환
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
        floorPrice: Math.random() * 5 + 1,
        lastSalePrice: Math.random() * 8 + 2,
      };

      // 로컬 스토리지에 저장
      const existingCards = JSON.parse(localStorage.getItem('photoCards') || '[]');
      existingCards.push(mintedPhotoCard);
      localStorage.setItem('photoCards', JSON.stringify(existingCards));

      toast.success(`🎉 ${mintingData.idolName} ${mintingData.rarity} 포토카드가 성공적으로 민팅되었습니다! (개발 모드)`);
      
      return {
        success: true,
        digest: `dev_digest_${Date.now()}`,
        objectChanges: [],
        effects: { status: { status: 'success' } },
      };
    }

    try {
      // 실제 블록체인 트랜잭션 생성
      const txb = new Transaction();

      // 포토카드 민팅 함수 호출
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

      console.log('포토카드 민팅 트랜잭션 준비 완료:', txb);

      let result;
      try {
        // dapp-kit을 통한 트랜잭션 실행
        result = await signAndExecute({
          transaction: txb,
          options: {
            showEffects: true,
            showObjectChanges: true,
          },
        });
        console.log('포토카드 민팅 결과 (signAndExecute):', result);
      } catch (signError) {
        console.error('signAndExecute 실패, 대안 방법 시도:', signError);
        
        // 대안: SuiClient를 통한 직접 실행
        if (suiClient && currentAccount) {
          try {
            const txbBytes = await txb.build({ client: suiClient });
            result = await suiClient.executeTransactionBlock({
              transactionBlock: txbBytes,
              signature: await currentAccount.signTransactionBlock(txbBytes),
              options: {
                showEffects: true,
                showObjectChanges: true,
              },
            });
            console.log('포토카드 민팅 결과 (SuiClient):', result);
          } catch (clientError) {
            console.error('SuiClient 실행 실패:', clientError);
            throw new Error('모든 민팅 방법이 실패했습니다.');
          }
        } else {
          throw signError;
        }
      }

      // 결과 검증
      let isSuccess = false;
      let digest = null;
      let objectChanges = null;
      let effects = null;

      if (result) {
        digest = result.digest;
        objectChanges = result.objectChanges;
        effects = result.effects;
        
        // 성공 여부 확인
        if (result.effects?.status?.status === 'success') {
          isSuccess = true;
        } else if (result.effects?.status === 'success') {
          isSuccess = true;
        } else if (result.digest && !result.effects?.status?.status?.includes('failure')) {
          isSuccess = true;
        }
      }

      if (isSuccess) {
        // 성공 시 로컬 스토리지에 저장
        const mintedPhotoCard = {
          id: `pc-${Date.now()}`,
          tokenId: `real_${digest}`,
          txDigest: digest,
          ...mintingData,
          mintedAt: new Date().toISOString(),
          owner: currentAccount.address,
          isPublic: true,
          heartsReceived: 0,
          floorPrice: Math.random() * 5 + 1,
          lastSalePrice: Math.random() * 8 + 2,
        };

        const existingCards = JSON.parse(localStorage.getItem('photoCards') || '[]');
        existingCards.push(mintedPhotoCard);
        localStorage.setItem('photoCards', JSON.stringify(existingCards));

        toast.success(`🎉 ${mintingData.idolName} ${mintingData.rarity} 포토카드가 성공적으로 민팅되었습니다!`);
        
        return {
          success: true,
          digest,
          objectChanges,
          effects,
        };
      } else {
        console.error('민팅 실패 - 결과:', result);
        throw new Error(`포토카드 민팅에 실패했습니다. 상태: ${effects?.status?.status || 'unknown'}`);
      }
    } catch (error) {
      console.error('포토카드 민팅 오류:', error);
      
      let errorMessage = '포토카드 민팅 중 오류가 발생했습니다.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        if (error.message.includes('User rejected')) {
          errorMessage = '사용자가 트랜잭션을 거부했습니다.';
        } else if (error.message.includes('Insufficient funds')) {
          errorMessage = 'SUI 잔액이 부족합니다.';
        } else if (error.message.includes('Network')) {
          errorMessage = '네트워크 연결에 문제가 있습니다.';
        }
      }
      
      toast.error(`포토카드 민팅 실패: ${errorMessage}`);
      throw error;
    }
  };

  // 아이돌 카드 민팅 함수
  const mintIdolCard = async (mintingData: IdolCardMintingData): Promise<MintingResult> => {
    if (!currentAccount) {
      throw new Error('지갑이 연결되지 않았습니다.');
    }

    // 실제 블록체인 민팅 모드 (개발 모드 비활성화)
    const isDevMode = false;
    
    if (isDevMode) {
      console.log('개발 모드: 아이돌 카드 민팅 시뮬레이션');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`🎉 ${mintingData.name} 아이돌 카드가 성공적으로 민팅되었습니다! (개발 모드)`);
      
      return {
        success: true,
        digest: `dev_digest_${Date.now()}`,
        objectChanges: [],
        effects: { status: { status: 'success' } },
      };
    }

    try {
      const txb = new Transaction();

      // 아이돌 카드 민팅 함수 호출
      txb.moveCall({
        target: `${PHOTOCARD_PACKAGE_ID}::${PHOTOCARD_MODULE}::mint_idol_card`,
        arguments: [
          txb.pure.u64(mintingData.idolId),
          txb.pure.string(mintingData.name),
          txb.pure.string(mintingData.personality),
          txb.pure.string(mintingData.imageUrl),
          txb.pure.string(mintingData.personaPrompt),
        ],
      });

      console.log('아이돌 카드 민팅 트랜잭션 준비 완료:', txb);

      let result;
      try {
        result = await signAndExecute({
          transaction: txb,
          options: {
            showEffects: true,
            showObjectChanges: true,
          },
        });
        console.log('아이돌 카드 민팅 결과 (signAndExecute):', result);
      } catch (signError) {
        console.error('signAndExecute 실패, 대안 방법 시도:', signError);
        
        if (suiClient && currentAccount) {
          try {
            const txbBytes = await txb.build({ client: suiClient });
            result = await suiClient.executeTransactionBlock({
              transactionBlock: txbBytes,
              signature: await currentAccount.signTransactionBlock(txbBytes),
              options: {
                showEffects: true,
                showObjectChanges: true,
              },
            });
            console.log('아이돌 카드 민팅 결과 (SuiClient):', result);
          } catch (clientError) {
            console.error('SuiClient 실행 실패:', clientError);
            throw new Error('모든 민팅 방법이 실패했습니다.');
          }
        } else {
          throw signError;
        }
      }

      // 결과 검증
      let isSuccess = false;
      let digest = null;
      let objectChanges = null;
      let effects = null;

      if (result) {
        digest = result.digest;
        objectChanges = result.objectChanges;
        effects = result.effects;
        
        if (result.effects?.status?.status === 'success') {
          isSuccess = true;
        } else if (result.effects?.status === 'success') {
          isSuccess = true;
        } else if (result.digest && !result.effects?.status?.status?.includes('failure')) {
          isSuccess = true;
        }
      }

      if (isSuccess) {
        toast.success(`🎉 ${mintingData.name} 아이돌 카드가 성공적으로 민팅되었습니다!`);
        
        return {
          success: true,
          digest,
          objectChanges,
          effects,
        };
      } else {
        console.error('민팅 실패 - 결과:', result);
        throw new Error(`아이돌 카드 민팅에 실패했습니다. 상태: ${effects?.status?.status || 'unknown'}`);
      }
    } catch (error) {
      console.error('아이돌 카드 민팅 오류:', error);
      
      let errorMessage = '아이돌 카드 민팅 중 오류가 발생했습니다.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        if (error.message.includes('User rejected')) {
          errorMessage = '사용자가 트랜잭션을 거부했습니다.';
        } else if (error.message.includes('Insufficient funds')) {
          errorMessage = 'SUI 잔액이 부족합니다.';
        } else if (error.message.includes('Network')) {
          errorMessage = '네트워크 연결에 문제가 있습니다.';
        }
      }
      
      toast.error(`아이돌 카드 민팅 실패: ${errorMessage}`);
      throw error;
    }
  };

  return {
    mintPhotoCard,
    mintIdolCard,
    isPending,
    isConnected: !!currentAccount,
    walletAddress: currentAccount?.address,
  };
};
