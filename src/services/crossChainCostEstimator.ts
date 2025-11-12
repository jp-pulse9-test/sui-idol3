/**
 * Cross-Chain Cost Estimator for Walrus Operations
 *
 * Provides deterministic cost quoting for:
 * - WAL/SUI tokens needed for storage
 * - Bridge fees and slippage
 * - Gas costs on both source and target chains
 * - Total cost in user's native token
 */

import { SupportedChain } from '../types/crosschain';
import { priceOracleService } from './priceOracleService';

export interface WalrusStorageCost {
  walTokens: string;
  suiTokens: string;
  epochs: number;
  storageSizeKB: number;
}

export interface CrossChainCostEstimate {
  // Walrus storage costs
  walrusStorage: WalrusStorageCost;

  // Bridge costs
  bridgeFee: string;
  bridgeFeeUSD: string;

  // Gas costs
  sourceChainGas: string;
  suiGas: string;

  // Slippage and exchange
  exchangeRate: string;
  slippageTolerance: string;
  estimatedSlippage: string;

  // Totals
  totalSourceTokenNeeded: string;
  totalUSD: string;

  // User budget
  withinBudget: boolean;
  budgetCeiling?: string;
}

export interface CostQuoteRequest {
  sourceChain: SupportedChain;
  storageSizeKB: number;
  storageEpochs: number;
  deletable: boolean;
  userBudget?: string; // Optional budget ceiling
}

class CrossChainCostEstimator {
  // Token prices cache (fetched from price oracle)
  private tokenPrices: Record<string, number> = {};

  // Storage cost per KB per epoch
  private readonly STORAGE_COST_PER_KB_PER_EPOCH = {
    WAL: 0.00001,
    SUI: 0.000001,
  };

  /**
   * Get comprehensive cost estimate for cross-chain Walrus operation
   */
  async getCostEstimate(request: CostQuoteRequest): Promise<CrossChainCostEstimate> {
    // Fetch latest token prices from oracle
    await this.updateTokenPricesFromOracle();
    // 1. Calculate Walrus storage costs
    const walrusStorage = this.calculateWalrusStorageCost(
      request.storageSizeKB,
      request.storageEpochs,
      request.deletable
    );

    // 2. Calculate bridge fees
    const bridgeFee = this.calculateBridgeFee(request.sourceChain);
    const bridgeFeeUSD = (parseFloat(bridgeFee) * this.tokenPrices[request.sourceChain.symbol]).toFixed(2);

    // 3. Calculate gas costs
    const sourceChainGas = await this.estimateSourceChainGas(request.sourceChain);
    const suiGas = this.estimateSuiGas();

    // 4. Calculate exchange rate and slippage
    const exchangeRate = this.getExchangeRate(request.sourceChain.symbol, 'SUI');
    const slippageTolerance = '0.5'; // 0.5%
    const estimatedSlippage = this.estimateSlippage(request.sourceChain.symbol);

    // 5. Calculate total cost
    const totalWalCostUSD = parseFloat(walrusStorage.walTokens) * this.tokenPrices.WAL;
    const totalSuiCostUSD = parseFloat(walrusStorage.suiTokens) * this.tokenPrices.SUI;
    const totalGasCostUSD = parseFloat(bridgeFeeUSD) +
                            (parseFloat(sourceChainGas) * this.tokenPrices[request.sourceChain.symbol]) +
                            (parseFloat(suiGas) * this.tokenPrices.SUI);

    const totalUSD = (totalWalCostUSD + totalSuiCostUSD + totalGasCostUSD).toFixed(2);

    // Convert to source token
    const totalSourceTokenNeeded = (
      parseFloat(totalUSD) / this.tokenPrices[request.sourceChain.symbol]
    ).toFixed(6);

    // Check budget
    const withinBudget = request.userBudget
      ? parseFloat(totalSourceTokenNeeded) <= parseFloat(request.userBudget)
      : true;

    return {
      walrusStorage,
      bridgeFee,
      bridgeFeeUSD,
      sourceChainGas,
      suiGas,
      exchangeRate,
      slippageTolerance,
      estimatedSlippage,
      totalSourceTokenNeeded,
      totalUSD,
      withinBudget,
      budgetCeiling: request.userBudget,
    };
  }

  /**
   * Calculate Walrus storage cost
   */
  private calculateWalrusStorageCost(
    sizeKB: number,
    epochs: number,
    deletable: boolean
  ): WalrusStorageCost {
    const baseWalCost = sizeKB * epochs * this.STORAGE_COST_PER_KB_PER_EPOCH.WAL;
    const baseSuiCost = sizeKB * epochs * this.STORAGE_COST_PER_KB_PER_EPOCH.SUI;

    // Permanent storage (non-deletable) costs more
    const walCostMultiplier = deletable ? 1 : 1.5;
    const suiCostMultiplier = deletable ? 1 : 1.5;

    return {
      walTokens: (baseWalCost * walCostMultiplier).toFixed(6),
      suiTokens: (baseSuiCost * suiCostMultiplier).toFixed(6),
      epochs,
      storageSizeKB: sizeKB,
    };
  }

  /**
   * Calculate bridge fee
   */
  private calculateBridgeFee(sourceChain: SupportedChain): string {
    const bridgeFeePercent = {
      ethereum: 0.001, // 0.1%
      solana: 0.0005,  // 0.05%
      polygon: 0.0005,
      bsc: 0.0008,
      base: 0.0006,
    };

    const feePercent = bridgeFeePercent[sourceChain.id as keyof typeof bridgeFeePercent] || 0.001;
    return feePercent.toFixed(6);
  }

  /**
   * Estimate source chain gas
   */
  private async estimateSourceChainGas(sourceChain: SupportedChain): Promise<string> {
    // Simulate gas estimation (in production, query RPC)
    const gasEstimates = {
      ethereum: '0.003',
      solana: '0.00005',
      polygon: '0.001',
      bsc: '0.0015',
      base: '0.0008',
    };

    return gasEstimates[sourceChain.id as keyof typeof gasEstimates] || '0.001';
  }

  /**
   * Estimate Sui gas
   */
  private estimateSuiGas(): string {
    return '0.001'; // SUI gas is typically low
  }

  /**
   * Get exchange rate between two tokens
   */
  private getExchangeRate(fromToken: string, toToken: string): string {
    const fromPrice = this.tokenPrices[fromToken] || 1;
    const toPrice = this.tokenPrices[toToken] || 1;

    return (fromPrice / toPrice).toFixed(6);
  }

  /**
   * Estimate slippage for swap
   */
  private estimateSlippage(token: string): string {
    // Simulate slippage based on liquidity
    const slippageEstimates: Record<string, string> = {
      ETH: '0.1',    // 0.1% (high liquidity)
      SOL: '0.2',    // 0.2%
      MATIC: '0.3',  // 0.3%
      BNB: '0.2',    // 0.2%
    };

    return slippageEstimates[token] || '0.5';
  }

  /**
   * Update token prices from price oracle
   */
  private async updateTokenPricesFromOracle() {
    try {
      const symbols = ['SUI', 'WAL', 'ETH', 'SOL', 'MATIC', 'BNB', 'USDC'];
      const prices = await priceOracleService.getPrices(symbols);

      prices.forEach(price => {
        this.tokenPrices[price.symbol] = price.priceUSD;
      });

      console.log('✅ Token prices updated from oracle:', this.tokenPrices);
    } catch (error) {
      console.warn('⚠️ Failed to update prices from oracle, using cached values:', error);

      // Fallback to default prices if oracle fails
      if (Object.keys(this.tokenPrices).length === 0) {
        this.tokenPrices = {
          SUI: 1.5,
          WAL: 0.8,
          ETH: 2000,
          SOL: 100,
          MATIC: 0.8,
          BNB: 300,
          USDC: 1.0,
        };
      }
    }
  }

  /**
   * Manually update token prices (for testing)
   */
  updateTokenPrices(prices: Partial<Record<string, number>>) {
    this.tokenPrices = { ...this.tokenPrices, ...prices };
  }

  /**
   * Get current token price
   */
  getTokenPrice(token: string): number {
    return this.tokenPrices[token] || 0;
  }
}

export const crossChainCostEstimator = new CrossChainCostEstimator();
