import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { useEffect, useState, useCallback } from 'react';

// SUI 테스트넷 클라이언트
const FULLNODE_URL = getFullnodeUrl('testnet');
const suiClient = new SuiClient({ url: FULLNODE_URL });

export interface CoinBalance {
  coinType: string;
  totalBalance: bigint;
  lockedBalance: Record<string, bigint>;
}

export interface CoinMetadata {
  decimals: number;
  name: string;
  symbol: string;
  description: string;
  iconUrl: string | null;
}

class SuiBalanceService {
  private client: SuiClient;

  constructor() {
    this.client = suiClient;
  }

  // SUI 잔액 조회
  async getSuiBalance(address: string): Promise<bigint> {
    try {
      const balance = await this.client.getBalance({ 
        owner: address, 
        coinType: '0x2::sui::SUI' 
      });
      return BigInt(balance.totalBalance);
    } catch (error) {
      console.error('Failed to get SUI balance:', error);
      throw new Error('SUI 잔액을 가져오는 데 실패했습니다.');
    }
  }

  // 모든 코인 잔액 조회
  async getAllBalances(address: string): Promise<CoinBalance[]> {
    try {
      const balances = await this.client.getAllBalances({ owner: address });
      return balances.map(b => ({
        coinType: b.coinType,
        totalBalance: BigInt(b.totalBalance),
        lockedBalance: b.lockedBalance ? 
          Object.fromEntries(
            Object.entries(b.lockedBalance).map(([k, v]) => [k, BigInt(v)])
          ) : {},
      }));
    } catch (error) {
      console.error('Failed to get all balances:', error);
      throw new Error('모든 잔액을 가져오는 데 실패했습니다.');
    }
  }

  // 코인 메타데이터 조회
  async getCoinMetadata(coinType: string): Promise<CoinMetadata | null> {
    try {
      const metadata = await this.client.getCoinMetadata({ coinType });
      if (metadata) {
        return {
          decimals: metadata.decimals,
          name: metadata.name,
          symbol: metadata.symbol,
          description: metadata.description,
          iconUrl: metadata.iconUrl || null
        };
      }
      return null;
    } catch (error) {
      console.error(`Failed to get metadata for ${coinType}:`, error);
      return null;
    }
  }

  // 특정 코인 잔액 조회
  async getCoinBalance(address: string, coinType: string): Promise<bigint> {
    try {
      const balance = await this.client.getBalance({ 
        owner: address, 
        coinType 
      });
      return BigInt(balance.totalBalance);
    } catch (error) {
      console.error(`Failed to get balance for ${coinType}:`, error);
      throw new Error(`${coinType} 잔액을 가져오는 데 실패했습니다.`);
    }
  }

  // 코인 객체 조회
  async getCoinObjects(address: string, coinType: string): Promise<any[]> {
    try {
      const coins = await this.client.getCoins({ 
        owner: address, 
        coinType 
      });
      return coins.data;
    } catch (error) {
      console.error(`Failed to get coin objects for ${coinType}:`, error);
      throw new Error(`${coinType} 코인 객체를 가져오는 데 실패했습니다.`);
    }
  }

  // 가스 비용 추정
  async estimateGasCost(transactionBlock: any): Promise<bigint> {
    try {
      // 실제 가스 추정을 위해서는 dryRunTransactionBlock을 사용해야 함
      console.warn('Gas cost estimation is a placeholder. Use suiClient.dryRunTransactionBlock for accurate results.');
      return BigInt(1000000); // 플레이스홀더 가스 비용
    } catch (error) {
      console.error('Failed to estimate gas cost:', error);
      throw new Error('가스 비용을 추정하는 데 실패했습니다.');
    }
  }

  // 네트워크 정보 조회
  async getNetworkInfo(): Promise<{
    epoch: string;
    epochDurationMs: string;
    referenceGasPrice: string;
    network: string;
  }> {
    try {
      const systemState = await this.client.getLatestSuiSystemState();
      const referenceGasPrice = await this.client.getReferenceGasPrice();
      return {
        epoch: systemState.epoch,
        epochDurationMs: systemState.epochDurationMs,
        referenceGasPrice: referenceGasPrice.toString(),
        network: 'testnet',
      };
    } catch (error) {
      console.error('Failed to get network info:', error);
      throw new Error('네트워크 정보를 가져오는 데 실패했습니다.');
    }
  }
}

// 서비스 인스턴스
export const suiBalanceService = new SuiBalanceService();

// React Hook
export const useSuiBalance = (initialAddress?: string) => {
  const [balance, setBalance] = useState<bigint | null>(null);
  const [allBalances, setAllBalances] = useState<CoinBalance[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const dappKitAccount = useCurrentAccount();
  const dappKitClient = useSuiClient();

  const currentAddress = initialAddress || dappKitAccount?.address;

  // SUI 잔액 조회
  const fetchSuiBalance = useCallback(async (address: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const suiBal = await suiBalanceService.getSuiBalance(address);
      setBalance(suiBal);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'SUI 잔액을 가져오는 데 실패했습니다.');
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 모든 잔액 조회
  const fetchAllBalances = useCallback(async (address: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const allBals = await suiBalanceService.getAllBalances(address);
      setAllBalances(allBals);
    } catch (err) {
      setError(err instanceof Error ? err.message : '모든 잔액을 가져오는 데 실패했습니다.');
      setAllBalances(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 잔액 새로고침
  const fetchBalance = useCallback(async (address: string) => {
    await fetchSuiBalance(address);
    await fetchAllBalances(address);
  }, [fetchSuiBalance, fetchAllBalances]);

  // 주소가 변경될 때마다 잔액 조회
  useEffect(() => {
    if (currentAddress) {
      fetchBalance(currentAddress);
    } else {
      setBalance(null);
      setAllBalances(null);
    }
  }, [currentAddress, fetchBalance]);

  return {
    balance,
    allBalances,
    isLoading,
    error,
    fetchBalance,
    fetchSuiBalance,
    fetchAllBalances,
    getCoinMetadata: suiBalanceService.getCoinMetadata,
    getCoinBalance: suiBalanceService.getCoinBalance,
    getCoinObjects: suiBalanceService.getCoinObjects,
    estimateGasCost: suiBalanceService.estimateGasCost,
    getNetworkInfo: suiBalanceService.getNetworkInfo,
    currentAddress,
  };
};
