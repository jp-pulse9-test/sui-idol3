import { SuiClient } from '@mysten/sui/client';
import { toast } from 'sonner';

// SUI 잔액 서비스
export interface SuiBalance {
  sui: {
    balance: string;
    formatted: string;
    decimals: number;
  };
  tokens: Array<{
    coinType: string;
    balance: string;
    formatted: string;
    decimals: number;
    symbol?: string;
    name?: string;
  }>;
  totalValue: string;
}

export interface CoinMetadata {
  decimals: number;
  name: string;
  symbol: string;
  description: string;
  iconUrl?: string;
}

class SuiBalanceService {
  private client: SuiClient;
  private readonly SUI_COIN_TYPE = '0x2::sui::SUI';
  private readonly SUI_DECIMALS = 9;

  constructor() {
    this.client = new SuiClient({
      url: 'https://fullnode.testnet.sui.io:443',
    });
  }

  // 주소로 SUI 잔액 가져오기
  async getSuiBalance(address: string): Promise<string> {
    try {
      console.log('SUI 잔액 조회 시작:', address);
      
      const balance = await this.client.getBalance({
        owner: address,
        coinType: this.SUI_COIN_TYPE,
      });

      console.log('SUI 잔액 조회 완료:', balance);
      return balance.totalBalance;
    } catch (error) {
      console.error('SUI 잔액 조회 실패:', error);
      throw new Error('SUI 잔액을 가져올 수 없습니다.');
    }
  }

  // 주소로 모든 코인 잔액 가져오기
  async getAllBalances(address: string): Promise<SuiBalance> {
    try {
      console.log('모든 잔액 조회 시작:', address);
      
      // SUI 잔액 가져오기
      const suiBalance = await this.getSuiBalance(address);
      
      // 모든 코인 잔액 가져오기
      const allBalances = await this.client.getAllBalances({
        owner: address,
      });

      console.log('모든 잔액 조회 완료:', allBalances);

      // SUI 잔액 포맷팅
      const formattedSuiBalance = this.formatBalance(suiBalance, this.SUI_DECIMALS);

      // 다른 토큰들 처리
      const tokens = await Promise.all(
        allBalances
          .filter(balance => balance.coinType !== this.SUI_COIN_TYPE)
          .map(async (balance) => {
            try {
              const metadata = await this.getCoinMetadata(balance.coinType);
              return {
                coinType: balance.coinType,
                balance: balance.totalBalance,
                formatted: this.formatBalance(balance.totalBalance, metadata.decimals),
                decimals: metadata.decimals,
                symbol: metadata.symbol,
                name: metadata.name,
              };
            } catch (error) {
              console.warn('토큰 메타데이터 조회 실패:', balance.coinType, error);
              return {
                coinType: balance.coinType,
                balance: balance.totalBalance,
                formatted: balance.totalBalance,
                decimals: 0,
                symbol: 'UNKNOWN',
                name: 'Unknown Token',
              };
            }
          })
      );

      // 총 가치 계산 (SUI 기준)
      const totalValue = this.calculateTotalValue(formattedSuiBalance, tokens);

      return {
        sui: {
          balance: suiBalance,
          formatted: formattedSuiBalance,
          decimals: this.SUI_DECIMALS,
        },
        tokens,
        totalValue,
      };
    } catch (error) {
      console.error('모든 잔액 조회 실패:', error);
      throw new Error('잔액을 가져올 수 없습니다.');
    }
  }

  // 코인 메타데이터 가져오기
  async getCoinMetadata(coinType: string): Promise<CoinMetadata> {
    try {
      console.log('코인 메타데이터 조회:', coinType);
      
      const metadata = await this.client.getCoinMetadata({
        coinType,
      });

      if (!metadata) {
        throw new Error('메타데이터를 찾을 수 없습니다.');
      }

      console.log('코인 메타데이터 조회 완료:', metadata);
      return {
        decimals: metadata.decimals,
        name: metadata.name,
        symbol: metadata.symbol,
        description: metadata.description,
        iconUrl: metadata.iconUrl,
      };
    } catch (error) {
      console.error('코인 메타데이터 조회 실패:', coinType, error);
      // 기본값 반환
      return {
        decimals: 9,
        name: 'Unknown Token',
        symbol: 'UNKNOWN',
        description: 'Unknown token',
      };
    }
  }

  // 잔액 포맷팅
  private formatBalance(balance: string, decimals: number): string {
    const balanceNumber = parseInt(balance);
    const formatted = balanceNumber / Math.pow(10, decimals);
    return formatted.toFixed(4);
  }

  // 총 가치 계산 (간단한 구현)
  private calculateTotalValue(suiBalance: string, tokens: any[]): string {
    const suiValue = parseFloat(suiBalance);
    // 실제로는 각 토큰의 USD 가격을 가져와서 계산해야 하지만,
    // 여기서는 SUI 잔액만 반환
    return suiValue.toFixed(4);
  }

  // 특정 코인 타입의 잔액 가져오기
  async getCoinBalance(address: string, coinType: string): Promise<string> {
    try {
      console.log('특정 코인 잔액 조회:', { address, coinType });
      
      const balance = await this.client.getBalance({
        owner: address,
        coinType,
      });

      console.log('특정 코인 잔액 조회 완료:', balance);
      return balance.totalBalance;
    } catch (error) {
      console.error('특정 코인 잔액 조회 실패:', error);
      throw new Error('코인 잔액을 가져올 수 없습니다.');
    }
  }

  // 코인 객체들 가져오기
  async getCoinObjects(address: string, coinType?: string) {
    try {
      console.log('코인 객체 조회:', { address, coinType });
      
      const objects = await this.client.getCoins({
        owner: address,
        coinType: coinType || this.SUI_COIN_TYPE,
      });

      console.log('코인 객체 조회 완료:', objects);
      return objects;
    } catch (error) {
      console.error('코인 객체 조회 실패:', error);
      throw new Error('코인 객체를 가져올 수 없습니다.');
    }
  }

  // 가스 비용 추정
  async estimateGasCost(transaction: any): Promise<string> {
    try {
      console.log('가스 비용 추정 시작');
      
      const result = await this.client.dryRunTransactionBlock({
        transactionBlock: transaction,
      });

      console.log('가스 비용 추정 완료:', result);
      
      if (result.effects?.gasUsed) {
        const gasUsed = result.effects.gasUsed;
        const totalGas = parseInt(gasUsed.computationCost) + 
                        parseInt(gasUsed.storageCost) - 
                        parseInt(gasUsed.storageRebate);
        return totalGas.toString();
      }
      
      return '0';
    } catch (error) {
      console.error('가스 비용 추정 실패:', error);
      throw new Error('가스 비용을 추정할 수 없습니다.');
    }
  }

  // 네트워크 정보 가져오기
  async getNetworkInfo() {
    try {
      console.log('네트워크 정보 조회 시작');
      
      const [systemState, referenceGasPrice] = await Promise.all([
        this.client.getLatestSuiSystemState(),
        this.client.getReferenceGasPrice(),
      ]);

      console.log('네트워크 정보 조회 완료:', { systemState, referenceGasPrice });

      return {
        epoch: systemState.epoch,
        epochDurationMs: systemState.epochDurationMs,
        epochStartTimestampMs: systemState.epochStartTimestampMs,
        referenceGasPrice,
        network: 'testnet',
      };
    } catch (error) {
      console.error('네트워크 정보 조회 실패:', error);
      throw new Error('네트워크 정보를 가져올 수 없습니다.');
    }
  }
}

// 싱글톤 인스턴스
export const suiBalanceService = new SuiBalanceService();

// React Hook
export const useSuiBalance = () => {
  const [balance, setBalance] = React.useState<SuiBalance | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchBalance = async (address: string) => {
    if (!address) {
      setError('주소가 필요합니다.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const balanceData = await suiBalanceService.getAllBalances(address);
      setBalance(balanceData);
      toast.success('잔액을 성공적으로 가져왔습니다!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '잔액을 가져올 수 없습니다.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuiBalance = async (address: string) => {
    if (!address) {
      setError('주소가 필요합니다.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const suiBalance = await suiBalanceService.getSuiBalance(address);
      const formattedBalance = suiBalanceService['formatBalance'](suiBalance, 9);
      
      setBalance({
        sui: {
          balance: suiBalance,
          formatted: formattedBalance,
          decimals: 9,
        },
        tokens: [],
        totalValue: formattedBalance,
      });
      
      toast.success('SUI 잔액을 성공적으로 가져왔습니다!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'SUI 잔액을 가져올 수 없습니다.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearBalance = () => {
    setBalance(null);
    setError(null);
  };

  return {
    balance,
    isLoading,
    error,
    fetchBalance,
    fetchSuiBalance,
    clearBalance,
  };
};

// React import 추가
import React from 'react';
