# Production Deployment Guide

Complete guide for deploying Walrus Cross-Chain Integration to production.

## 📋 Prerequisites

### Required Packages

```bash
# Install production dependencies
npm install --save \
  @wormhole-foundation/sdk \
  @wormhole-foundation/sdk-evm \
  @wormhole-foundation/sdk-solana \
  @wormhole-foundation/sdk-sui \
  @certusone/wormhole-sdk \
  @cetusprotocol/cetus-sui-clmm-sdk \
  @mysten/walrus \
  @mysten/sui \
  ethers \
  @solana/web3.js
```

### Environment Variables

Create `.env.production` file:

```bash
# Network Configuration
VITE_NETWORK=mainnet
VITE_SUI_RPC_URL=https://fullnode.mainnet.sui.io

# Wormhole Configuration
VITE_WORMHOLE_GUARDIAN_RPC=https://wormhole-v2-mainnet-api.certus.one
VITE_WORMHOLE_NETWORK=mainnet

# Chain RPCs
VITE_ETHEREUM_RPC=https://mainnet.infura.io/v3/YOUR_KEY
VITE_SOLANA_RPC=https://api.mainnet-beta.solana.com
VITE_POLYGON_RPC=https://polygon-rpc.com
VITE_BSC_RPC=https://bsc-dataseed1.binance.org
VITE_BASE_RPC=https://mainnet.base.org
VITE_ARBITRUM_RPC=https://arb1.arbitrum.io/rpc
VITE_OPTIMISM_RPC=https://mainnet.optimism.io

# Price Oracle APIs
VITE_COINGECKO_API_KEY=your_coingecko_api_key
VITE_PYTH_NETWORK_URL=https://hermes.pyth.network

# Walrus Configuration
VITE_WALRUS_PUBLISHER_URL=https://publisher.walrus.site
VITE_WALRUS_AGGREGATOR_URL=https://aggregator.walrus.site

# Contract Addresses (Deploy these first)
VITE_WORMHOLE_TOKEN_BRIDGE_ETH=0x...
VITE_WORMHOLE_TOKEN_BRIDGE_SOL=...
VITE_WORMHOLE_TOKEN_BRIDGE_SUI=0x...
VITE_CETUS_ROUTER=0x2::cetus::router
VITE_TURBOS_ROUTER=0x91bfbc386a41afcfd9b2533058d7e915a1d3829089cc268ff4333d54d6339ca1::pool
VITE_DEEPBOOK_ADDRESS=0x000000000000000000000000000000000000000000000000000000000000dee9
VITE_WAL_TOKEN_ADDRESS=0x... # Deploy WAL token
```

---

## 🚀 Deployment Steps

### Step 1: Update Service Imports

Replace simulation services with production versions:

**In `src/services/index.ts`:**

```typescript
// Production exports
export { wormholeBridgeService } from './wormholeBridgeService.production';
export { tokenSwapService } from './tokenSwapService.production';
export { walrusCrossChainSDK } from './walrusCrossChainSDK.production';
export { priceOracleService } from './priceOracleService';
export { crossChainCostEstimator } from './crossChainCostEstimator';
```

### Step 2: Deploy Smart Contracts

#### Sui Contracts

```bash
cd move

# Build the Move package
sui move build

# Deploy to Sui mainnet
sui client publish --gas-budget 100000000

# Save the package ID
export PACKAGE_ID=0x...
```

#### Ethereum/EVM Contracts

Deploy Wormhole integration contracts to each EVM chain:

```solidity
// contracts/WalrusStorageProof.sol
contract WalrusStorageProof {
    struct Proof {
        bytes32 blobId;
        uint256 storedEpoch;
        uint256 certifiedEpoch;
        uint256 size;
        bytes vaaSignature;
    }

    mapping(bytes32 => Proof) public proofs;

    function verifyStorageProof(
        bytes32 blobId,
        bytes memory vaaSignature
    ) external {
        // Verify Wormhole VAA signature
        // Store proof
    }

    function getProof(bytes32 blobId) external view returns (Proof memory) {
        return proofs[blobId];
    }
}
```

Deploy:

```bash
npx hardhat deploy --network ethereum
npx hardhat deploy --network polygon
npx hardhat deploy --network bsc
npx hardhat deploy --network base
npx hardhat deploy --network arbitrum
npx hardhat deploy --network optimism
```

#### Solana Program

```bash
cd solana-program

# Build
anchor build

# Deploy
anchor deploy --provider.cluster mainnet
```

### Step 3: Initialize Wormhole Integration

**Update `wormholeBridgeService.production.ts`:**

```typescript
import { wormhole } from '@wormhole-foundation/sdk';
import { EvmPlatform } from '@wormhole-foundation/sdk-evm';
import { SolanaPlatform } from '@wormhole-foundation/sdk-solana';
import { SuiPlatform } from '@wormhole-foundation/sdk-sui';

async initialize() {
  const wh = await wormhole('mainnet', [
    EvmPlatform,
    SolanaPlatform,
    SuiPlatform,
  ]);

  this.wormholeInstance = wh;
  console.log('✅ Wormhole initialized');
}
```

### Step 4: Configure DEX Integration

**Update `tokenSwapService.production.ts`:**

Uncomment production code:

```typescript
import { CetusClmmSDK } from '@cetusprotocol/cetus-sui-clmm-sdk';
import { TurbosSDK } from 'turbos-clmm-sdk';

// Initialize SDKs
this.cetusSDK = new CetusClmmSDK({
  network: 'mainnet',
  client: this.suiClient,
});

this.turbosSDK = new TurbosSDK('mainnet', this.suiClient);
```

### Step 5: Update UI Components

**Replace imports in components:**

```typescript
// Before (simulation)
import { walrusCrossChainSDK } from '@/services/walrusCrossChainSDK';

// After (production)
import { walrusCrossChainSDK } from '@/services/walrusCrossChainSDK.production';
```

### Step 6: Build for Production

```bash
# Build with production environment
npm run build

# Verify build output
ls -lh dist/

# Test build locally
npm run preview
```

### Step 7: Deploy to Hosting

#### Option A: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Option B: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

#### Option C: AWS S3 + CloudFront

```bash
# Upload to S3
aws s3 sync dist/ s3://your-bucket-name

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

---

## 🔐 Security Checklist

- [ ] All API keys stored in environment variables
- [ ] Rate limiting configured for price oracle calls
- [ ] Smart contract audited by professional firm
- [ ] Private keys never exposed in code
- [ ] CORS properly configured
- [ ] Input validation on all user inputs
- [ ] Slippage protection enabled
- [ ] Budget limits enforced
- [ ] Transaction monitoring in place
- [ ] Error reporting configured (Sentry, etc.)

---

## 🧪 Testing

### Integration Tests

```bash
# Run full integration test suite
npm run test:integration

# Test specific chains
npm run test:integration -- --chain=ethereum
npm run test:integration -- --chain=solana
```

### Manual Testing Checklist

1. **Bridge Testing**
   - [ ] Ethereum → Sui bridge
   - [ ] Solana → Sui bridge
   - [ ] Polygon → Sui bridge
   - [ ] VAA retrieval and redemption

2. **Swap Testing**
   - [ ] ETH → SUI swap
   - [ ] SUI → WAL swap
   - [ ] Multi-hop routing
   - [ ] Slippage protection

3. **Walrus Storage**
   - [ ] File upload (various sizes)
   - [ ] Blob ID retrieval
   - [ ] File download
   - [ ] Proof generation

4. **Cost Estimation**
   - [ ] Price oracle accuracy
   - [ ] Budget enforcement
   - [ ] Gas estimation

5. **Error Handling**
   - [ ] Network failures
   - [ ] Insufficient funds
   - [ ] Slippage exceeded
   - [ ] Timeout scenarios

---

## 📊 Monitoring

### Metrics to Track

1. **Bridge Operations**
   - Success rate
   - Average completion time
   - Failed transactions
   - VAA retrieval time

2. **Swap Operations**
   - Executed volume
   - Slippage observed
   - Failed swaps
   - Best DEX performance

3. **Walrus Storage**
   - Files stored
   - Average file size
   - Storage costs
   - Blob ID retrieval failures

4. **Costs**
   - Total bridge fees
   - Total swap fees
   - Total storage costs
   - Gas costs per chain

### Monitoring Setup

```typescript
// Setup error tracking
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: 'production',
  tracesSampleRate: 1.0,
});

// Setup analytics
import Analytics from 'analytics';

const analytics = Analytics({
  app: 'walrus-cross-chain',
  plugins: [
    // Your analytics plugins
  ],
});
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. VAA Not Found

```
Error: VAA not found after 60 attempts
```

**Solution:**
- Increase timeout
- Check Guardian network status
- Verify source transaction confirmed

#### 2. Swap Slippage Exceeded

```
Error: Slippage tolerance exceeded
```

**Solution:**
- Increase slippage tolerance
- Use different DEX
- Split into smaller swaps

#### 3. Walrus Upload Failed

```
Error: Failed to upload to Walrus storage nodes
```

**Solution:**
- Check WAL/SUI balance
- Verify wallet connection
- Retry with exponential backoff

#### 4. Price Oracle Timeout

```
Error: Failed to fetch price from all sources
```

**Solution:**
- Use cached prices
- Implement fallback oracle
- Increase timeout

---

## 📞 Support Resources

- **Wormhole Docs**: https://docs.wormhole.com
- **Walrus Docs**: https://docs.walrus.site
- **Sui Docs**: https://docs.sui.io
- **Cetus Docs**: https://cetus-1.gitbook.io/cetus-docs
- **Discord**: Join our community support channel

---

## 📄 License & Legal

- Ensure compliance with all applicable regulations
- Review terms of service for all integrated services
- Implement proper user disclosures
- Set up privacy policy
- Configure GDPR compliance if serving EU users

---

## 🎯 Post-Deployment

### Week 1
- [ ] Monitor error rates
- [ ] Collect user feedback
- [ ] Optimize gas costs
- [ ] Fine-tune slippage parameters

### Week 2-4
- [ ] Analyze usage patterns
- [ ] Identify bottlenecks
- [ ] Plan optimizations
- [ ] Prepare for scale

### Ongoing
- [ ] Weekly security reviews
- [ ] Monthly cost analysis
- [ ] Quarterly audits
- [ ] Continuous optimization

---

**Deployment Date**: _____________

**Deployed By**: _____________

**Version**: _____________

**Status**: ⬜ Planning ⬜ Testing ⬜ Staging ⬜ Production
