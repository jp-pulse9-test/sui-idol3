import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { crossChainService } from '../services/crossChainService';
import { SupportedChain, CrossChainMintingData, CrossChainTransaction } from '../types/crosschain';

export const useCrossChain = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<CrossChainTransaction[]>([]);

  const mintToChain = useCallback(async (mintingData: CrossChainMintingData): Promise<string | null> => {
    setIsLoading(true);
    try {
      const txHash = await crossChainService.mintToChain(mintingData);
      
      // 트랜잭션 목록 업데이트
      const updatedTransactions = await crossChainService.getAllTransactions();
      setTransactions(updatedTransactions);
      
      return txHash;
    } catch (error) {
      console.error('Cross-chain minting failed:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const estimateGasFee = useCallback(async (targetChain: SupportedChain) => {
    try {
      return await crossChainService.estimateGasFee(targetChain);
    } catch (error) {
      console.error('Gas fee estimation failed:', error);
      toast.error('가스비 추정에 실패했습니다.');
      return null;
    }
  }, []);

  const refreshTransactions = useCallback(async () => {
    try {
      const updatedTransactions = await crossChainService.getAllTransactions();
      setTransactions(updatedTransactions);
    } catch (error) {
      console.error('Failed to refresh transactions:', error);
    }
  }, []);

  return {
    mintToChain,
    estimateGasFee,
    refreshTransactions,
    isLoading,
    transactions
  };
};