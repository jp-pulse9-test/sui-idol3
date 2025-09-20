import { Transaction } from '@mysten/sui/transactions';
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { toast } from 'sonner';

// 투표 시스템을 위한 Move 패키지 정보 (포토카드 패키지와 동일하게 사용)
const VOTING_PACKAGE_ID = '0x39d1d59ddc953d4ff0c0f80f868d00bb1718e1d1807db6a3e5745fd4f03f79fe';
const VOTING_MODULE = 'voting'; // 새로운 모듈 또는 기존 모듈 사용

export interface VotingData {
  idolId: number;
  idolName: string;
  voteAmount: number; // SUI 단위 (0.15 SUI)
  voterAddress: string;
  timestamp: number;
}

export const useVotingService = () => {
  const { mutateAsync: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();

  const voteForIdol = async (idolId: number, idolName: string, voteAmount: number = 0.15) => {
    if (!currentAccount) {
      throw new Error('지갑이 연결되지 않았습니다.');
    }

    // 개발 모드 체크 (환경 변수로 제어 가능, 기본값은 개발 모드)
    const isDevMode = import.meta.env.VITE_DEV_MODE !== 'false';
    
    if (isDevMode) {
      console.log('개발 모드: 투표 시뮬레이션');
      
      // 개발 모드에서는 시뮬레이션된 결과 반환
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 대기
      
      // 투표 정보를 로컬 스토리지에 저장
      const voteData: VotingData = {
        idolId,
        idolName,
        voteAmount,
        voterAddress: currentAccount.address,
        timestamp: Date.now(),
      };

      // 로컬 스토리지에 투표 기록 저장
      const existingVotes = JSON.parse(localStorage.getItem('idolVotes') || '[]');
      existingVotes.push(voteData);
      localStorage.setItem('idolVotes', JSON.stringify(existingVotes));

      // 아이돌별 투표 수 업데이트
      const idolVoteCounts = JSON.parse(localStorage.getItem('idolVoteCounts') || '{}');
      idolVoteCounts[idolId] = (idolVoteCounts[idolId] || 0) + 1;
      localStorage.setItem('idolVoteCounts', JSON.stringify(idolVoteCounts));

      toast.success(`🎉 ${idolName}에게 ${voteAmount} SUI 투표가 완료되었습니다! (개발 모드)`);
      return {
        success: true,
        digest: `dev_vote_${Date.now()}`,
        voteData,
      };
    }

    try {
      // Transaction 객체 생성
      const txb = new Transaction();

      // SUI 전송 (투표 금액)
      const [coin] = txb.splitCoins(txb.gas, [txb.pure.u64(voteAmount * 1e9)]); // SUI를 MIST로 변환

      // 투표 함수 호출 (실제 Move 함수가 구현되어 있다면)
      // 현재는 SUI 전송만 구현
      txb.transferObjects([coin], currentAccount.address);

      console.log('투표 트랜잭션 준비 완료:', txb);

      // 트랜잭션 실행 - mutateAsync 사용
      let result;
      try {
        result = await signAndExecute({
          transaction: txb,
          options: {
            showEffects: true,
            showObjectChanges: true,
          },
        });
        console.log('투표 결과 (signAndExecute):', result);
      } catch (signError) {
        console.error('signAndExecute 실패, 대안 방법 시도:', signError);
        
        // 대안: 직접 SuiClient 사용
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
            console.log('투표 결과 (SuiClient):', result);
          } catch (clientError) {
            console.error('SuiClient 실행 실패:', clientError);
            throw new Error('모든 투표 방법이 실패했습니다.');
          }
        } else {
          throw signError;
        }
      }

      // 결과 확인 - 더 안전한 방식
      let isSuccess = false;
      let digest = null;
      let effects = null;

      if (result) {
        digest = result.digest;
        effects = result.effects;
        
        // 다양한 성공 조건 확인
        if (result.effects?.status?.status === 'success') {
          isSuccess = true;
        } else if (result.effects?.status === 'success') {
          isSuccess = true;
        } else if (result.digest && !result.effects?.status?.status?.includes('failure')) {
          // digest가 있고 실패 상태가 아니면 성공으로 간주
          isSuccess = true;
        }
      }

      if (isSuccess) {
        // 투표 정보를 로컬 스토리지에 저장
        const voteData: VotingData = {
          idolId,
          idolName,
          voteAmount,
          voterAddress: currentAccount.address,
          timestamp: Date.now(),
        };

        // 로컬 스토리지에 투표 기록 저장
        const existingVotes = JSON.parse(localStorage.getItem('idolVotes') || '[]');
        existingVotes.push(voteData);
        localStorage.setItem('idolVotes', JSON.stringify(existingVotes));

        // 아이돌별 투표 수 업데이트
        const idolVoteCounts = JSON.parse(localStorage.getItem('idolVoteCounts') || '{}');
        idolVoteCounts[idolId] = (idolVoteCounts[idolId] || 0) + 1;
        localStorage.setItem('idolVoteCounts', JSON.stringify(idolVoteCounts));

        toast.success(`🎉 ${idolName}에게 ${voteAmount} SUI 투표가 완료되었습니다!`);
        return {
          success: true,
          digest,
          voteData,
        };
      } else {
        console.error('투표 실패 - 결과:', result);
        throw new Error(`투표에 실패했습니다. 상태: ${effects?.status?.status || 'unknown'}`);
      }
    } catch (error) {
      console.error('투표 오류:', error);
      
      // 더 구체적인 오류 메시지 제공
      let errorMessage = '투표 중 오류가 발생했습니다.';
      
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
      
      toast.error(`투표 실패: ${errorMessage}`);
      throw error;
    }
  };

  // 투표 결과 조회
  const getVoteResults = () => {
    const idolVoteCounts = JSON.parse(localStorage.getItem('idolVoteCounts') || '{}');
    const allVotes = JSON.parse(localStorage.getItem('idolVotes') || '[]');
    
    return {
      idolVoteCounts,
      totalVotes: allVotes.length,
      allVotes,
    };
  };

  // 특정 아이돌의 투표 수 조회
  const getVoteCount = (idolId: number) => {
    const idolVoteCounts = JSON.parse(localStorage.getItem('idolVoteCounts') || '{}');
    return idolVoteCounts[idolId] || 0;
  };

  // 사용자의 투표 기록 조회
  const getUserVotes = (userAddress?: string) => {
    const allVotes = JSON.parse(localStorage.getItem('idolVotes') || '[]');
    const address = userAddress || currentAccount?.address;
    
    if (!address) return [];
    
    return allVotes.filter((vote: VotingData) => vote.voterAddress === address);
  };

  return {
    voteForIdol,
    getVoteResults,
    getVoteCount,
    getUserVotes,
    isConnected: !!currentAccount,
    walletAddress: currentAccount?.address,
    isPending,
  };
};
