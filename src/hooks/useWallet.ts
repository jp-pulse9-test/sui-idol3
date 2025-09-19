import { useCurrentWallet, useWallets } from '@mysten/dapp-kit';
import { useCallback } from 'react';
import { toast } from 'sonner';

export const useWallet = () => {
  const { currentWallet, connectionStatus, isConnected } = useCurrentWallet();
  const wallets = useWallets();

  const connectWallet = useCallback(async () => {
    try {
      if (wallets.length === 0) {
        toast.error('지갑이 설치되지 않았습니다. Sui 지갑을 설치해주세요.');
        return { success: false, error: 'No wallets available' };
      }

      const wallet = wallets[0]; // 첫 번째 지갑 사용
      await wallet.connect();
      
      toast.success('지갑이 성공적으로 연결되었습니다!');
      return { success: true, wallet: currentWallet };
    } catch (error) {
      console.error('지갑 연결 실패:', error);
      toast.error('지갑 연결에 실패했습니다.');
      return { success: false, error };
    }
  }, [wallets, currentWallet]);

  const disconnectWallet = useCallback(async () => {
    try {
      if (currentWallet) {
        await currentWallet.disconnect();
        toast.success('지갑 연결이 해제되었습니다.');
      }
    } catch (error) {
      console.error('지갑 연결 해제 실패:', error);
      toast.error('지갑 연결 해제에 실패했습니다.');
    }
  }, [currentWallet]);

  const getWalletAddress = useCallback(() => {
    return currentWallet?.accounts[0]?.address || null;
  }, [currentWallet]);

  return {
    currentWallet,
    connectionStatus,
    isConnected,
    wallets,
    connectWallet,
    disconnectWallet,
    getWalletAddress,
    walletAddress: getWalletAddress(),
  };
};
