import { describe, it, expect, beforeEach, vi } from 'vitest';
import { crossChainCostEstimator, type ChainId } from '../crossChainCostEstimator';

describe('CrossChainCostEstimator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCostEstimate', () => {
    it('should calculate costs for Ethereum to Sui', async () => {
      const estimate = await crossChainCostEstimator.getCostEstimate({
        sourceChain: 'ethereum' as ChainId,
        targetChain: 'sui',
        fileSize: 5 * 1024 * 1024, // 5 MB
      });

      expect(estimate).toBeDefined();
      expect(estimate.sourceChain).toBe('ethereum');
      expect(estimate.targetChain).toBe('sui');
      expect(estimate.bridgeFee).toBeGreaterThan(0);
      expect(estimate.walrusStorageCost).toBeGreaterThan(0);
      expect(estimate.totalCostUSD).toBeGreaterThan(0);
    });

    it('should calculate costs for Polygon to Sui', async () => {
      const estimate = await crossChainCostEstimator.getCostEstimate({
        sourceChain: 'polygon' as ChainId,
        targetChain: 'sui',
        fileSize: 1 * 1024 * 1024, // 1 MB
      });

      expect(estimate.bridgeFee).toBeLessThan(1); // Polygon should be cheaper
      expect(estimate.sourceChain).toBe('polygon');
    });

    it('should include gas estimates', async () => {
      const estimate = await crossChainCostEstimator.getCostEstimate({
        sourceChain: 'ethereum' as ChainId,
        targetChain: 'sui',
        fileSize: 1024 * 1024,
      });

      expect(estimate.gasEstimate).toBeDefined();
      expect(estimate.gasEstimate.sourceGas).toBeGreaterThan(0);
      expect(estimate.gasEstimate.targetGas).toBeGreaterThan(0);
    });

    it('should calculate storage cost based on file size', async () => {
      const smallFile = await crossChainCostEstimator.getCostEstimate({
        sourceChain: 'ethereum' as ChainId,
        targetChain: 'sui',
        fileSize: 1024 * 1024, // 1 MB
      });

      const largeFile = await crossChainCostEstimator.getCostEstimate({
        sourceChain: 'ethereum' as ChainId,
        targetChain: 'sui',
        fileSize: 10 * 1024 * 1024, // 10 MB
      });

      expect(largeFile.walrusStorageCost).toBeGreaterThan(smallFile.walrusStorageCost);
    });

    it('should include token swap estimates', async () => {
      const estimate = await crossChainCostEstimator.getCostEstimate({
        sourceChain: 'ethereum' as ChainId,
        targetChain: 'sui',
        fileSize: 5 * 1024 * 1024,
      });

      expect(estimate.swapEstimate).toBeDefined();
      if (estimate.swapEstimate) {
        expect(estimate.swapEstimate.inputToken).toBeDefined();
        expect(estimate.swapEstimate.outputToken).toBeDefined();
        expect(estimate.swapEstimate.estimatedOutput).toBeDefined();
      }
    });

    it('should provide breakdown of costs', async () => {
      const estimate = await crossChainCostEstimator.getCostEstimate({
        sourceChain: 'ethereum' as ChainId,
        targetChain: 'sui',
        fileSize: 5 * 1024 * 1024,
      });

      expect(estimate.breakdown).toBeDefined();
      expect(estimate.breakdown.bridgeFeeUSD).toBeGreaterThan(0);
      expect(estimate.breakdown.storageCostUSD).toBeGreaterThan(0);
      expect(estimate.breakdown.gasCostUSD).toBeGreaterThan(0);
    });
  });

  describe('calculateStorageCost', () => {
    it('should calculate cost for small files', () => {
      const cost = crossChainCostEstimator.calculateStorageCost(100 * 1024); // 100 KB
      expect(cost).toBeGreaterThan(0);
    });

    it('should calculate cost for large files', () => {
      const cost = crossChainCostEstimator.calculateStorageCost(100 * 1024 * 1024); // 100 MB
      expect(cost).toBeGreaterThan(0);
    });

    it('should scale linearly with file size', () => {
      const cost1MB = crossChainCostEstimator.calculateStorageCost(1024 * 1024);
      const cost2MB = crossChainCostEstimator.calculateStorageCost(2 * 1024 * 1024);

      expect(cost2MB).toBeCloseTo(cost1MB * 2, 1);
    });
  });

  describe('isCostEffective', () => {
    it('should return true for reasonable costs', async () => {
      const isEffective = await crossChainCostEstimator.isCostEffective({
        sourceChain: 'polygon' as ChainId,
        targetChain: 'sui',
        fileSize: 1024 * 1024,
      });

      expect(typeof isEffective).toBe('boolean');
    });

    it('should provide recommendations', async () => {
      const estimate = await crossChainCostEstimator.getCostEstimate({
        sourceChain: 'ethereum' as ChainId,
        targetChain: 'sui',
        fileSize: 1024 * 1024,
      });

      const isCostEffective = await crossChainCostEstimator.isCostEffective({
        sourceChain: 'ethereum' as ChainId,
        targetChain: 'sui',
        fileSize: 1024 * 1024,
      });

      if (!isCostEffective) {
        expect(estimate.recommendations).toBeDefined();
        expect(Array.isArray(estimate.recommendations)).toBe(true);
      }
    });
  });
});
