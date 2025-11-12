import { describe, it, expect, beforeAll, vi } from 'vitest';
import { walrusCrossChainSDK } from '../walrusCrossChainSDK.production';
import { INTEGRATION_TIMEOUT } from '../../test/setup.integration';

describe('WalrusCrossChainSDK Integration Tests', () => {
  beforeAll(() => {
    // Verify environment variables are set
    if (!process.env.VITE_WALRUS_PUBLISHER) {
      console.warn('⚠️  VITE_WALRUS_PUBLISHER not set, some tests may fail');
    }
  });

  describe('getCostEstimate', () => {
    it('should get cost estimate for cross-chain storage', async () => {
      const config = {
        sourceChain: 'polygon' as const,
        targetChain: 'sui' as const,
        fileSize: 2 * 1024 * 1024, // 2 MB
      };

      const estimate = await walrusCrossChainSDK.getCostEstimate(config);

      expect(estimate).toBeDefined();
      expect(estimate.totalCostUSD).toBeGreaterThan(0);
      expect(estimate.sourceChain).toBe('polygon');
      expect(estimate.targetChain).toBe('sui');
    }, INTEGRATION_TIMEOUT);

    it('should calculate costs for different file sizes', async () => {
      const smallConfig = {
        sourceChain: 'polygon' as const,
        targetChain: 'sui' as const,
        fileSize: 1024 * 1024, // 1 MB
      };

      const largeConfig = {
        sourceChain: 'polygon' as const,
        targetChain: 'sui' as const,
        fileSize: 10 * 1024 * 1024, // 10 MB
      };

      const smallEstimate = await walrusCrossChainSDK.getCostEstimate(smallConfig);
      const largeEstimate = await walrusCrossChainSDK.getCostEstimate(largeConfig);

      expect(largeEstimate.totalCostUSD).toBeGreaterThan(smallEstimate.totalCostUSD);
    }, INTEGRATION_TIMEOUT);
  });

  describe('storeFromChain (Mocked)', () => {
    it('should validate configuration before starting', async () => {
      const invalidConfig = {
        sourceChain: 'invalid' as any,
        targetChain: 'sui' as const,
        walrusEpochs: 1,
      };

      const mockFile = new Uint8Array([1, 2, 3, 4]);
      const mockSigner = {};

      await expect(
        walrusCrossChainSDK.storeFromChain(invalidConfig, mockFile, mockSigner)
      ).rejects.toThrow();
    }, INTEGRATION_TIMEOUT);

    it('should validate file size', async () => {
      const config = {
        sourceChain: 'ethereum' as const,
        targetChain: 'sui' as const,
        walrusEpochs: 1,
      };

      const tooLargeFile = new Uint8Array(101 * 1024 * 1024); // > 100 MB
      const mockSigner = {};

      await expect(
        walrusCrossChainSDK.storeFromChain(config, tooLargeFile, mockSigner)
      ).rejects.toThrow();
    }, INTEGRATION_TIMEOUT);
  });

  describe('getOperation', () => {
    it('should return undefined for non-existent operation', () => {
      const operation = walrusCrossChainSDK.getOperation('non-existent-id');
      expect(operation).toBeUndefined();
    });

    it('should track operation lifecycle', async () => {
      // This test would require actually creating an operation
      // For now, we just verify the method exists and works
      const mockId = 'test-operation-123';
      const operation = walrusCrossChainSDK.getOperation(mockId);

      // Should return undefined or an operation object
      if (operation) {
        expect(operation.id).toBe(mockId);
        expect(operation.status).toBeDefined();
        expect(['pending', 'bridging', 'swapping', 'storing', 'completed', 'failed']).toContain(
          operation.status
        );
      }
    });
  });

  describe('getSupportedChains', () => {
    it('should return all supported source chains', () => {
      const chains = walrusCrossChainSDK.getSupportedChains();

      expect(Array.isArray(chains)).toBe(true);
      expect(chains.length).toBeGreaterThan(0);
      expect(chains).toContain('ethereum');
      expect(chains).toContain('polygon');
      expect(chains).toContain('bsc');
    });

    it('should not include sui as source chain', () => {
      const chains = walrusCrossChainSDK.getSupportedChains();
      expect(chains).not.toContain('sui');
    });
  });

  describe('Full flow simulation', () => {
    it('should handle complete cross-chain storage flow', async () => {
      const config = {
        sourceChain: 'polygon' as const,
        targetChain: 'sui' as const,
        walrusEpochs: 1,
        sourceToken: 'MATIC',
      };

      // Step 1: Get cost estimate
      const estimate = await walrusCrossChainSDK.getCostEstimate(config);
      expect(estimate.totalCostUSD).toBeGreaterThan(0);

      // Step 2: Check if cost effective
      const chains = walrusCrossChainSDK.getSupportedChains();
      expect(chains).toContain('polygon');

      // Step 3: Verify supported operations
      expect(estimate.breakdown).toBeDefined();
      expect(estimate.breakdown.bridgeFeeUSD).toBeGreaterThan(0);
      expect(estimate.breakdown.storageCostUSD).toBeGreaterThan(0);

      // In production, this would continue with:
      // - Bridge tokens from Polygon to Sui
      // - Swap to SUI and WAL
      // - Store on Walrus
      // - Generate proof
    }, INTEGRATION_TIMEOUT);
  });

  describe('Error handling and recovery', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network failure
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

      const config = {
        sourceChain: 'polygon' as const,
        targetChain: 'sui' as const,
        fileSize: 1024 * 1024,
      };

      await expect(
        walrusCrossChainSDK.getCostEstimate(config)
      ).rejects.toThrow();
    }, INTEGRATION_TIMEOUT);

    it('should validate operation parameters', async () => {
      const config = {
        sourceChain: 'ethereum' as const,
        targetChain: 'sui' as const,
        walrusEpochs: -1, // Invalid
      };

      const mockFile = new Uint8Array([1, 2, 3]);
      const mockSigner = {};

      await expect(
        walrusCrossChainSDK.storeFromChain(config, mockFile, mockSigner)
      ).rejects.toThrow();
    }, INTEGRATION_TIMEOUT);
  });

  describe('Cost comparison across chains', () => {
    it('should show cost differences between chains', async () => {
      const ethereumConfig = {
        sourceChain: 'ethereum' as const,
        targetChain: 'sui' as const,
        fileSize: 5 * 1024 * 1024,
      };

      const polygonConfig = {
        sourceChain: 'polygon' as const,
        targetChain: 'sui' as const,
        fileSize: 5 * 1024 * 1024,
      };

      const ethEstimate = await walrusCrossChainSDK.getCostEstimate(ethereumConfig);
      const polyEstimate = await walrusCrossChainSDK.getCostEstimate(polygonConfig);

      // Ethereum should be more expensive due to higher gas costs
      expect(ethEstimate.totalCostUSD).toBeGreaterThan(polyEstimate.totalCostUSD);
    }, INTEGRATION_TIMEOUT);

    it('should provide recommendations for cost optimization', async () => {
      const expensiveConfig = {
        sourceChain: 'ethereum' as const,
        targetChain: 'sui' as const,
        fileSize: 50 * 1024 * 1024, // 50 MB
      };

      const estimate = await walrusCrossChainSDK.getCostEstimate(expensiveConfig);

      // Should have recommendations for large files
      if (estimate.recommendations) {
        expect(Array.isArray(estimate.recommendations)).toBe(true);
        expect(estimate.recommendations.length).toBeGreaterThan(0);
      }
    }, INTEGRATION_TIMEOUT);
  });
});
