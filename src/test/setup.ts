import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock environment variables
process.env.VITE_SUI_NETWORK = 'testnet';
process.env.VITE_WALRUS_PUBLISHER = 'https://publisher.walrus-testnet.walrus.space';
process.env.VITE_WALRUS_AGGREGATOR = 'https://aggregator.walrus-testnet.walrus.space';

// Mock global fetch if needed
global.fetch = vi.fn();

// Add custom matchers if needed
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});
