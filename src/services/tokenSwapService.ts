/**
 * Token Swap Service for Cross-Chain Walrus Operations
 *
 * Handles automatic token swapping via DEXes:
 * - Bridge token → SUI
 * - SUI → WAL
 * - Multi-hop swaps for optimal rates
 * - Slippage protection
 */

import { toast } from 'sonner';

export interface SwapQuote {
  inputToken: string;
  outputToken: string;
  inputAmount: string;
  estimatedOutput: string;
  minimumOutput: string;
  priceImpact: string;
  route: string[];
  dexes: string[];
  slippage: string;
}

export interface SwapResult {
  success: boolean;
  txHash?: string;
  inputAmount: string;
  outputAmount: string;
  inputToken: string;
  outputToken: string;
  error?: string;
}

export interface DEXRoute {
  dex: string;
  inputToken: string;
  outputToken: string;
  estimatedOutput: string;
}

class TokenSwapService {
  // Supported DEXes on Sui
  private readonly SUPPORTED_DEXES = [
    'Cetus',
    'Turbos',
    'Aftermath',
    'DeepBook',
  ];

  // Mock liquidity pools
  private liquidityPools: Map<string, { token0: string; token1: string; liquidity: number }> = new Map([
    ['SUI-WAL', { token0: 'SUI', token1: 'WAL', liquidity: 1000000 }],
    ['SUI-USDC', { token0: 'SUI', token1: 'USDC', liquidity: 5000000 }],
    ['USDC-WAL', { token0: 'USDC', token1: 'WAL', liquidity: 500000 }],
  ]);

  /**
   * Get swap quote for token exchange
   */
  async getSwapQuote(
    inputToken: string,
    outputToken: string,
    inputAmount: string,
    slippageTolerance: number = 0.5
  ): Promise<SwapQuote> {
    try {
      // Find best route
      const route = this.findBestRoute(inputToken, outputToken);

      if (route.length === 0) {
        throw new Error(`No route found from ${inputToken} to ${outputToken}`);
      }

      // Calculate estimated output
      const estimatedOutput = this.calculateEstimatedOutput(
        inputToken,
        outputToken,
        inputAmount,
        route
      );

      // Calculate minimum output with slippage
      const minimumOutput = (
        parseFloat(estimatedOutput) * (1 - slippageTolerance / 100)
      ).toFixed(6);

      // Calculate price impact
      const priceImpact = this.calculatePriceImpact(
        inputToken,
        outputToken,
        inputAmount
      );

      return {
        inputToken,
        outputToken,
        inputAmount,
        estimatedOutput,
        minimumOutput,
        priceImpact,
        route,
        dexes: route.length === 2 ? ['Cetus'] : ['Cetus', 'Turbos'], // Multi-hop
        slippage: slippageTolerance.toString(),
      };
    } catch (error) {
      console.error('❌ Failed to get swap quote:', error);
      throw error;
    }
  }

  /**
   * Execute token swap
   */
  async executeSwap(
    inputToken: string,
    outputToken: string,
    inputAmount: string,
    minOutputAmount: string,
    userAddress: string
  ): Promise<SwapResult> {
    try {
      toast.info(`🔄 Swapping ${inputAmount} ${inputToken} to ${outputToken}...`);

      // Simulate swap transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      const quote = await this.getSwapQuote(inputToken, outputToken, inputAmount);

      // Check slippage
      if (parseFloat(quote.estimatedOutput) < parseFloat(minOutputAmount)) {
        throw new Error('Slippage tolerance exceeded');
      }

      const txHash = this.generateMockTxHash();
      const outputAmount = quote.estimatedOutput;

      toast.success(`✅ Swapped ${inputAmount} ${inputToken} → ${outputAmount} ${outputToken}`);

      return {
        success: true,
        txHash,
        inputAmount,
        outputAmount,
        inputToken,
        outputToken,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Swap failed';
      console.error('❌ Swap execution failed:', error);
      toast.error(`Swap failed: ${errorMessage}`);

      return {
        success: false,
        inputAmount,
        outputAmount: '0',
        inputToken,
        outputToken,
        error: errorMessage,
      };
    }
  }

  /**
   * Auto-swap bridged tokens to SUI and WAL for Walrus operations
   */
  async autoSwapForWalrus(
    bridgedToken: string,
    bridgedAmount: string,
    requiredSui: string,
    requiredWal: string
  ): Promise<{
    suiSwap: SwapResult;
    walSwap: SwapResult;
  }> {
    try {
      toast.info('🔄 Auto-swapping tokens for Walrus operation...');

      // Step 1: Calculate swap amounts
      const totalRequired = parseFloat(requiredSui) + parseFloat(requiredWal);
      const suiPortion = parseFloat(requiredSui) / totalRequired;
      const walPortion = parseFloat(requiredWal) / totalRequired;

      const amountForSui = (parseFloat(bridgedAmount) * suiPortion).toFixed(6);
      const amountForWal = (parseFloat(bridgedAmount) * walPortion).toFixed(6);

      // Step 2: Swap to SUI
      const suiSwap = await this.executeSwap(
        bridgedToken,
        'SUI',
        amountForSui,
        requiredSui,
        'user_address'
      );

      if (!suiSwap.success) {
        throw new Error('SUI swap failed');
      }

      // Step 3: Swap to WAL
      const walSwap = await this.executeSwap(
        bridgedToken,
        'WAL',
        amountForWal,
        requiredWal,
        'user_address'
      );

      if (!walSwap.success) {
        throw new Error('WAL swap failed');
      }

      toast.success('✅ Auto-swap completed! Ready for Walrus operation.');

      return { suiSwap, walSwap };
    } catch (error) {
      console.error('❌ Auto-swap failed:', error);
      throw error;
    }
  }

  /**
   * Find best route for token swap
   */
  private findBestRoute(inputToken: string, outputToken: string): string[] {
    // Direct route
    if (this.hasDirectPool(inputToken, outputToken)) {
      return [inputToken, outputToken];
    }

    // Multi-hop via SUI
    if (inputToken !== 'SUI' && outputToken !== 'SUI') {
      if (
        this.hasDirectPool(inputToken, 'SUI') &&
        this.hasDirectPool('SUI', outputToken)
      ) {
        return [inputToken, 'SUI', outputToken];
      }
    }

    // Multi-hop via USDC
    if (inputToken !== 'USDC' && outputToken !== 'USDC') {
      if (
        this.hasDirectPool(inputToken, 'USDC') &&
        this.hasDirectPool('USDC', outputToken)
      ) {
        return [inputToken, 'USDC', outputToken];
      }
    }

    return [];
  }

  /**
   * Check if direct pool exists
   */
  private hasDirectPool(token0: string, token1: string): boolean {
    return (
      this.liquidityPools.has(`${token0}-${token1}`) ||
      this.liquidityPools.has(`${token1}-${token0}`)
    );
  }

  /**
   * Calculate estimated output
   */
  private calculateEstimatedOutput(
    inputToken: string,
    outputToken: string,
    inputAmount: string,
    route: string[]
  ): string {
    // Simplified calculation (in production, use actual DEX math)
    const exchangeRates: Record<string, number> = {
      'SUI-WAL': 1.875,  // 1 SUI = 1.875 WAL
      'SUI-USDC': 1.5,   // 1 SUI = 1.5 USDC
      'USDC-WAL': 1.25,  // 1 USDC = 1.25 WAL
    };

    let amount = parseFloat(inputAmount);

    for (let i = 0; i < route.length - 1; i++) {
      const pair = `${route[i]}-${route[i + 1]}`;
      const reversePair = `${route[i + 1]}-${route[i]}`;

      const rate = exchangeRates[pair] || (1 / (exchangeRates[reversePair] || 1));

      amount = amount * rate;
    }

    // Apply 0.3% fee per swap
    const fees = route.length - 1;
    amount = amount * Math.pow(0.997, fees);

    return amount.toFixed(6);
  }

  /**
   * Calculate price impact
   */
  private calculatePriceImpact(
    inputToken: string,
    outputToken: string,
    inputAmount: string
  ): string {
    // Simulate price impact based on liquidity
    const amount = parseFloat(inputAmount);
    const poolKey = `${inputToken}-${outputToken}`;
    const reversePoolKey = `${outputToken}-${inputToken}`;

    const pool = this.liquidityPools.get(poolKey) || this.liquidityPools.get(reversePoolKey);

    if (!pool) {
      return '0.1'; // Default 0.1%
    }

    // Simple formula: impact = (amount / liquidity) * 100
    const impact = (amount / pool.liquidity) * 100;

    return Math.min(impact, 5).toFixed(2); // Cap at 5%
  }

  private generateMockTxHash(): string {
    return '0x' + Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }
}

export const tokenSwapService = new TokenSwapService();
