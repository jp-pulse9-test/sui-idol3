import { expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import * as dotenv from 'dotenv';

// Load environment variables from .env.testnet for integration tests
dotenv.config({ path: '.env.testnet' });

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Setup before all tests
beforeAll(async () => {
  console.log('🧪 Starting integration tests...');
  console.log('Network:', process.env.VITE_SUI_NETWORK);

  // Verify required environment variables
  const requiredEnvVars = [
    'VITE_SUI_NETWORK',
    'VITE_WALRUS_PUBLISHER',
    'VITE_WALRUS_AGGREGATOR',
  ];

  const missing = requiredEnvVars.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.warn('⚠️  Missing environment variables:', missing.join(', '));
  }
});

// Cleanup after all tests
afterAll(async () => {
  console.log('✅ Integration tests completed');
});

// Mock timers for tests that need it
global.setTimeout = vi.fn((fn, delay) => {
  if (typeof fn === 'function') fn();
  return 0 as any;
}) as any;

// Extend timeout for long-running operations
const INTEGRATION_TIMEOUT = 60000; // 60 seconds

export { INTEGRATION_TIMEOUT };
