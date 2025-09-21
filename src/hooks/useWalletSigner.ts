import { useSignTransaction } from '@mysten/dapp-kit';
import { useWallet } from './useWallet';
import { Transaction } from '@mysten/sui/transactions';

/**
 * Walrus SDK와 호환되는 지갑 서명 기능을 제공하는 훅
 */
export function useWalletSigner() {
  const { currentAccount } = useWallet();
  const { mutateAsync: signTransaction } = useSignTransaction();

  const createSigner = () => {
    if (!currentAccount) {
      throw new Error('지갑이 연결되지 않았습니다');
    }

    return {
      account: currentAccount,
      signTransaction: async (transaction: Transaction) => {
        try {
          const result = await signTransaction({
            transaction,
          });
          return result;
        } catch (error) {
          console.error('트랜잭션 서명 실패:', error);
          throw error;
        }
      },
    };
  };

  // 안전한 체크 - 새창에서도 문제없도록
  const isReady = !!currentAccount && typeof signTransaction === 'function';

  return {
    createSigner,
    isReady,
    account: currentAccount,
  };
}