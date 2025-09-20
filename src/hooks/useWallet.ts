import { useConnectWallet, useDisconnectWallet, useCurrentAccount, useWallets } from '@mysten/dapp-kit';
import { useCallback } from 'react';
import { toast } from 'sonner';

export const useWallet = () => {
  const { mutate: connect } = useConnectWallet();
  const { mutate: disconnect } = useDisconnectWallet();
  const currentAccount = useCurrentAccount();
  const wallets = useWallets();

  const isConnected = !!currentAccount;
  const walletAddress = currentAccount?.address || null;

  const connectWallet = useCallback(async () => {
    try {
      console.log('🔍 지갑 연결 진단 시작');
      console.log('사용 가능한 지갑 수:', wallets.length);
      console.log('지갑 목록:', wallets.map(w => ({ name: w.name, version: w.version })));
      
      if (wallets.length === 0) {
        console.error('❌ 설치된 지갑이 없습니다');
        toast.error('지갑이 설치되지 않았습니다. Sui 지갑을 설치해주세요.');
        return { success: false, error: 'No wallets available' };
      }

      // 첫 번째 사용 가능한 지갑 사용
      const wallet = wallets[0];
      console.log('🎯 연결 시도할 지갑:', { name: wallet.name, version: wallet.version });
      
      return new Promise<{ success: boolean; error?: any }>((resolve) => {
        connect(
          { wallet },
          {
            onSuccess: () => {
              console.log('✅ 지갑 연결 성공!');
              toast.success('지갑이 성공적으로 연결되었습니다!');
              resolve({ success: true });
            },
            onError: (error) => {
              console.error('❌ 지갑 연결 실패:', error);
              console.error('에러 상세 정보:', {
                message: error.message || '알 수 없는 오류',
                name: error.name,
                stack: error.stack
              });
              toast.error(`지갑 연결에 실패했습니다: ${error.message || '알 수 없는 오류'}`);
              resolve({ success: false, error });
            },
          }
        );
      });
    } catch (error) {
      console.error('❌ 지갑 연결 예외:', error);
      toast.error(`지갑 연결에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      return { success: false, error };
    }
  }, [wallets, connect]);

  const disconnectWallet = useCallback(async () => {
    try {
      return new Promise<void>((resolve) => {
        disconnect(
          undefined,
          {
            onSuccess: () => {
              toast.success('지갑 연결이 해제되었습니다.');
              resolve();
            },
            onError: (error) => {
              console.error('지갑 연결 해제 실패:', error);
              toast.error('지갑 연결 해제에 실패했습니다.');
              resolve(); // Still resolve to allow UI to update
            },
          }
        );
      });
    } catch (error) {
      console.error('지갑 연결 해제 실패:', error);
      toast.error('지갑 연결 해제에 실패했습니다.');
    }
  }, [disconnect]);

  return {
    isConnected,
    walletAddress,
    wallets,
    connectWallet,
    disconnectWallet,
    currentAccount,
  };
};
