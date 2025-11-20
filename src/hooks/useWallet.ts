import { useConnectWallet, useDisconnectWallet, useCurrentAccount, useWallets, useSuiClientQuery } from '@mysten/dapp-kit';
import { useCallback } from 'react';
import { toast } from 'sonner';

export const useWallet = () => {
  const { mutate: connect } = useConnectWallet();
  const { mutate: disconnect } = useDisconnectWallet();
  const currentAccount = useCurrentAccount();
  const wallets = useWallets();

  const isConnected = !!currentAccount;
  const walletAddress = currentAccount?.address || null;

  // Fetch SUI balance
  const { data: balanceData, refetch: refetchBalance, isLoading, isError, error } = useSuiClientQuery(
    'getBalance',
    {
      owner: walletAddress || '',
    },
    {
      enabled: !!walletAddress,
      refetchInterval: 10000, // Refetch every 10 seconds
    }
  );

  // Convert balance from MIST to SUI (1 SUI = 1,000,000,000 MIST)
  const balance = balanceData?.totalBalance
    ? (Number(balanceData.totalBalance) / 1_000_000_000).toFixed(4)
    : '0.0000';

  // Debug logging
  console.log('🔍 Wallet Debug:', {
    walletAddress,
    isLoading,
    isError,
    error,
    balanceData,
    totalBalance: balanceData?.totalBalance,
    totalBalanceNumber: balanceData?.totalBalance ? Number(balanceData.totalBalance) : 0,
    calculatedBalance: balanceData?.totalBalance ? Number(balanceData.totalBalance) / 1_000_000_000 : 0,
    finalBalance: balance,
    walletsCount: wallets.length,
    wallets: wallets.map(w => ({
      name: w.name,
      chains: w.chains,
      features: w.features
    }))
  });

  const connectWallet = useCallback(async () => {
    try {
      if (wallets.length === 0) {
        toast.error('지갑이 설치되지 않았습니다. Sui 지갑을 설치해주세요.');
        return { success: false, error: 'No wallets available' };
      }

      // 첫 번째 사용 가능한 지갑 사용
      const wallet = wallets[0];
      
      return new Promise<{ success: boolean; error?: any }>((resolve) => {
        connect(
          { wallet },
          {
            onSuccess: () => {
              toast.success('지갑이 성공적으로 연결되었습니다!');
              resolve({ success: true });
            },
            onError: (error) => {
              console.error('지갑 연결 실패:', error);
              toast.error('지갑 연결에 실패했습니다.');
              resolve({ success: false, error });
            },
          }
        );
      });
    } catch (error) {
      console.error('지갑 연결 실패:', error);
      toast.error('지갑 연결에 실패했습니다.');
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
    balance,
    refetchBalance,
  };
};
