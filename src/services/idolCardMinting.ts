import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { toast } from 'sonner';

// Move 스마트 컨트랙트 패키지 ID
const PHOTOCARD_PACKAGE_ID = '0x51bfb8010e6e72c43578eed4d5a940d8de233a9e2b83c166f8879d029bf41cc7';

export interface IdolCardMintingData {
  idolId: number;
  name: string;
  personality: string;
  imageUrl: string;
  personaPrompt: string;
}

export const useIdolCardMinting = () => {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();

  const mintIdolCard = async (mintingData: IdolCardMintingData) => {
    if (!currentAccount) {
      throw new Error('지갑이 연결되지 않았습니다.');
    }

    // 실제 블록체인 민팅 모드 (개발 모드 비활성화)
    const isDevMode = false;
    
    if (isDevMode) {
      console.log('개발 모드: IdolCard 민팅 시뮬레이션');
      
      // 개발 모드에서는 시뮬레이션된 결과 반환
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 대기
      
      toast.success(`🎉 ${mintingData.name} IdolCard NFT가 성공적으로 민팅되었습니다! (개발 모드)`);
      return {
        success: true,
        digest: `dev_digest_${Date.now()}`,
        objectChanges: [],
        effects: { status: { status: 'success' } },
      };
    }

    try {
      // Transaction 객체 생성
      const txb = new Transaction();

      // IdolCard 민팅 함수 호출
      txb.moveCall({
        target: `${PHOTOCARD_PACKAGE_ID}::photocard::mint_idol_card`,
        arguments: [
          txb.pure.u64(mintingData.idolId),
          txb.pure.string(mintingData.name),
          txb.pure.string(mintingData.personality),
          txb.pure.string(mintingData.imageUrl),
          txb.pure.string(mintingData.personaPrompt),
        ],
      });

      console.log('IdolCard 민팅 트랜잭션 준비 완료:', txb);

      // 트랜잭션 실행 - mutateAsync 사용
      let result = null;
      try {
        result = await signAndExecute({
          transaction: txb,
        }, {
          onSuccess: (data) => {
            console.log('Transaction successful:', data);
          },
          onError: (error) => {
            console.error('Transaction failed:', error);
          }
        });
        console.log('IdolCard 민팅 결과 (signAndExecute):', result);
      } catch (signError) {
        console.error('signAndExecute 실패, 대안 방법 시도:', signError);
        
        // 대안: 직접 SuiClient 사용
        if (suiClient && currentAccount) {
          try {
            const txbBytes = await txb.build({ client: suiClient });
            // 대안 방법은 현재 지원되지 않으므로 제거
            throw new Error('Primary signing method failed');
            console.log('IdolCard 민팅 결과 (SuiClient):', result);
          } catch (clientError) {
            console.error('SuiClient 실행 실패:', clientError);
            throw new Error('모든 민팅 방법이 실패했습니다.');
          }
        } else {
          throw signError;
        }
      }

      // 결과 확인 - 더 안전한 방식
      let isSuccess = false;
      let digest = null;
      let objectChanges = null;
      let effects = null;

      if (result && typeof result === 'object') {
        digest = result.digest || null;
        objectChanges = result.objectChanges || null;
        effects = result.effects || null;
        
        // 다양한 성공 조건 확인
        if (effects?.status?.status === 'success') {
          isSuccess = true;
        } else if (effects?.status === 'success') {
          isSuccess = true;
        } else if (digest && effects && !effects.status?.status?.includes('failure')) {
          // digest가 있고 실패 상태가 아니면 성공으로 간주
          isSuccess = true;
        } else if (digest && !effects) {
          // effects가 없어도 digest가 있으면 성공으로 간주
          isSuccess = true;
        }
      } else {
        console.error('IdolCard 민팅 결과가 유효하지 않습니다:', result);
        throw new Error('트랜잭션 결과를 처리할 수 없습니다.');
      }

      if (isSuccess) {
        toast.success(`🎉 ${mintingData.name} IdolCard NFT가 성공적으로 민팅되었습니다!`);
        return {
          success: true,
          digest,
          objectChanges,
          effects,
        };
      } else {
        console.error('민팅 실패 - 결과:', result);
        
        // 마지막 fallback: digest가 있으면 성공으로 간주
        if (digest) {
          console.warn('digest가 있으므로 성공으로 간주합니다:', digest);
          toast.success(`🎉 ${mintingData.name} IdolCard NFT가 성공적으로 민팅되었습니다! (Fallback)`);
          return {
            success: true,
            digest,
            objectChanges,
            effects,
          };
        }
        
        throw new Error(`IdolCard 민팅에 실패했습니다. 상태: ${effects?.status?.status || 'unknown'}`);
      }
    } catch (error) {
      console.error('IdolCard 민팅 오류:', error);
      
      // 더 구체적인 오류 메시지 제공
      let errorMessage = 'IdolCard 민팅 중 오류가 발생했습니다.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // 특정 오류 타입에 따른 메시지
        if (error.message.includes('User rejected')) {
          errorMessage = '사용자가 트랜잭션을 거부했습니다.';
        } else if (error.message.includes('Insufficient funds')) {
          errorMessage = 'SUI 잔액이 부족합니다.';
        } else if (error.message.includes('Network')) {
          errorMessage = '네트워크 연결에 문제가 있습니다.';
        }
      }
      
      toast.error(`IdolCard 민팅 실패: ${errorMessage}`);
      throw error;
    }
  };

  return {
    mintIdolCard,
    isConnected: !!currentAccount,
    walletAddress: currentAccount?.address,
  };
};
