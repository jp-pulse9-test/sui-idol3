# Walrus Cross-Chain Integration

Complete cross-chain integration layer for Walrus decentralized storage, enabling users from any blockchain to store and retrieve data seamlessly.

## 📋 Overview

This integration provides:
- **Chain Agnostic Storage**: Upload files from Ethereum, Solana, Polygon, BSC, Arbitrum, Optimism, and Base
- **Automatic Bridging**: Seamless token transfers via Wormhole
- **Auto-Swapping**: Convert any token to SUI/WAL for Walrus operations
- **Cost Estimation**: Deterministic pricing before execution
- **Proof Generation**: Verifiable receipts for origin chain contracts

---

## 🏗️ Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Origin Chain (ETH/SOL/etc)              │
│  ┌──────────────┐    ┌──────────────┐    ┌─────────────┐  │
│  │  User Wallet │───▶│   dApp UI    │───▶│  TX Submit  │  │
│  └──────────────┘    └──────────────┘    └──────┬──────┘  │
└──────────────────────────────────────────────────┼──────────┘
                                                   │
                                          ┌────────▼────────┐
                                          │ Wormhole Bridge │
                                          └────────┬────────┘
                                                   │
┌──────────────────────────────────────────────────┼──────────┐
│                      Sui Network                  │          │
│  ┌───────────────┐    ┌──────────────┐    ┌─────▼──────┐  │
│  │  Token Swap   │◀───│ Bridge Relay │───▶│  Sui Wallet │  │
│  │ (Cetus/Turbos)│    └──────────────┘    └─────┬──────┘  │
│  └───────┬───────┘                               │          │
│          │                                       │          │
│  ┌───────▼───────┐                       ┌──────▼──────┐  │
│  │  SUI/WAL Ready│                       │   Walrus    │  │
│  └───────┬───────┘                       │   Storage   │  │
│          │                               │   Contract  │  │
│          └───────────────────────────────▶└─────┬──────┘  │
└────────────────────────────────────────────────┼──────────┘
                                                 │
                                          ┌──────▼──────┐
                                          │ Blob Storage│
                                          │  (Walrus)   │
                                          └──────┬──────┘
                                                 │
                                          ┌──────▼──────┐
                                          │ Receipt/VAA │
                                          │   Generation│
                                          └──────┬──────┘
                                                 │
┌────────────────────────────────────────────────┼──────────┐
│                  Origin Chain (Return)          │          │
│  ┌──────────────┐    ┌──────────────┐    ┌────▼──────┐  │
│  │  Verification│◀───│ Bridge Back  │◀───│   Proof    │  │
│  │   Contract   │    └──────────────┘    └───────────┘  │
│  └──────────────┘                                         │
└──────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# The following packages are included:
# - @mysten/walrus
# - @mysten/sui
# - wormhole SDK (simulated)
```

### Basic Usage

```typescript
import { walrusCrossChainSDK } from '@/services/walrusCrossChainSDK';
import { SUPPORTED_CHAINS } from '@/types/crosschain';

// 1. Select source chain
const sourceChain = SUPPORTED_CHAINS.find(c => c.id === 'ethereum');

// 2. Get cost estimate
const estimate = await walrusCrossChainSDK.getCostEstimate({
  sourceChain,
  sourceAddress: userWalletAddress,
  fileSizeKB: 100, // 100 KB file
  storageEpochs: 10, // ~80 days
  deletable: false,
  userBudget: '0.05', // Max 0.05 ETH
});

console.log(`Total cost: ${estimate.totalSourceTokenNeeded} ETH`);
console.log(`Equivalent: $${estimate.totalUSD} USD`);

// 3. Upload file
const fileData = await file.arrayBuffer();

const operation = await walrusCrossChainSDK.storeFromChain(
  {
    sourceChain,
    sourceAddress: userWalletAddress,
    fileSizeKB: 100,
    storageEpochs: 10,
    deletable: false,
  },
  new Uint8Array(fileData)
);

// 4. Monitor progress
console.log(`Status: ${operation.status}`);
console.log(`Current step: ${operation.currentStep}`);

// 5. Get blob ID when completed
if (operation.status === 'completed') {
  console.log(`Blob ID: ${operation.blobId}`);
  console.log(`Proof:`, operation.proof);
}
```

### Using the UI Component

```tsx
import { WalrusCrossChainUploader } from '@/components/WalrusCrossChainUploader';

function MyApp() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = (blobId: string) => {
    console.log('File uploaded! Blob ID:', blobId);
    setIsOpen(false);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Upload to Walrus
      </button>

      <WalrusCrossChainUploader
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
```

---

## 🔧 Services

### 1. Wormhole Bridge Service

Handles cross-chain token transfers via Wormhole protocol.

```typescript
import { wormholeBridgeService } from '@/services/wormholeBridgeService';

// Bridge tokens to Sui
const receipt = await wormholeBridgeService.bridgeToSui({
  sourceChain: 'ethereum',
  targetChain: 'sui',
  sourceAddress: '0x...',
  targetAddress: 'sui_address',
  amount: '0.1',
});

// Get bridge quote
const quote = await wormholeBridgeService.getQuote(config);
console.log(`Bridge fee: ${quote.bridgeFee}`);
console.log(`Estimated time: ${quote.estimatedTime}ms`);

// Verify proof
const isValid = await wormholeBridgeService.verifyProof(receipt);
```

**Features**:
- Wormhole VAA (Verified Action Approval) generation
- Multi-chain support (Ethereum, Solana, Polygon, BSC, etc.)
- Automatic retry and error handling
- Receipt tracking and verification

---

### 2. Token Swap Service

Automatic token swapping on Sui DEXes.

```typescript
import { tokenSwapService } from '@/services/tokenSwapService';

// Get swap quote
const quote = await tokenSwapService.getSwapQuote(
  'USDC',      // Input token
  'SUI',       // Output token
  '100',       // Input amount
  0.5          // Slippage tolerance (0.5%)
);

console.log(`Estimated output: ${quote.estimatedOutput} SUI`);
console.log(`Minimum output: ${quote.minimumOutput} SUI`);
console.log(`Route: ${quote.route.join(' → ')}`);
console.log(`DEXes: ${quote.dexes.join(', ')}`);

// Execute swap
const result = await tokenSwapService.executeSwap(
  'USDC',
  'SUI',
  '100',
  quote.minimumOutput,
  userAddress
);

// Auto-swap for Walrus operations
const { suiSwap, walSwap } = await tokenSwapService.autoSwapForWalrus(
  'ETH',     // Bridged token
  '0.1',     // Amount
  '0.05',    // Required SUI
  '0.04'     // Required WAL
);
```

**Supported DEXes**:
- Cetus
- Turbos
- Aftermath
- DeepBook

**Features**:
- Multi-hop routing for best prices
- Slippage protection
- Price impact calculation
- Automatic route optimization

---

### 3. Cost Estimator Service

Deterministic cost estimation before execution.

```typescript
import { crossChainCostEstimator } from '@/services/crossChainCostEstimator';

const estimate = await crossChainCostEstimator.getCostEstimate({
  sourceChain: ethereumChain,
  storageSizeKB: 500,
  storageEpochs: 20,
  deletable: false,
  userBudget: '0.1', // Optional budget ceiling
});

// Detailed cost breakdown
console.log('Walrus Storage:');
console.log(`  WAL: ${estimate.walrusStorage.walTokens}`);
console.log(`  SUI: ${estimate.walrusStorage.suiTokens}`);

console.log('Bridge & Gas:');
console.log(`  Bridge fee: $${estimate.bridgeFeeUSD}`);
console.log(`  Source gas: ${estimate.sourceChainGas} ETH`);
console.log(`  Sui gas: ${estimate.suiGas} SUI`);

console.log('Totals:');
console.log(`  Total: ${estimate.totalSourceTokenNeeded} ETH`);
console.log(`  USD: $${estimate.totalUSD}`);
console.log(`  Within budget: ${estimate.withinBudget}`);
```

**Cost Components**:
1. **Storage Costs**: WAL + SUI tokens for Walrus
2. **Bridge Fees**: Wormhole bridge charges
3. **Gas Costs**: Source chain + Sui network fees
4. **Slippage**: Estimated DEX slippage
5. **Exchange Rates**: Current token prices

---

### 4. Walrus Cross-Chain SDK

Complete unified SDK for cross-chain operations.

```typescript
import { walrusCrossChainSDK } from '@/services/walrusCrossChainSDK';

// Full cross-chain upload
const operation = await walrusCrossChainSDK.storeFromChain(
  config,
  fileData
);

// Track operation status
const currentOp = walrusCrossChainSDK.getOperation(operation.id);

// Get all operations
const allOps = walrusCrossChainSDK.getAllOperations();

// Verify proof on origin chain
const isVerified = await walrusCrossChainSDK.verifyProofOnOriginChain(
  operation.id,
  'ethereum'
);
```

**Operation Flow**:
1. **Quoting**: Calculate costs
2. **Bridging**: Transfer tokens via Wormhole
3. **Swapping**: Convert to SUI/WAL
4. **Storing**: Upload to Walrus
5. **Proof**: Generate verification proof

---

## 📊 Supported Chains

| Chain | Symbol | Wormhole ID | Status |
|-------|--------|-------------|--------|
| Ethereum | ETH | 2 | ✅ Supported |
| Solana | SOL | 1 | ✅ Supported |
| Polygon | MATIC | 5 | ✅ Supported |
| BSC | BNB | 4 | ✅ Supported |
| Base | ETH | 30 | ✅ Supported |
| Arbitrum | ETH | 23 | ✅ Supported |
| Optimism | ETH | 24 | ✅ Supported |

---

## 💰 Cost Breakdown Example

For a **100 KB file** stored for **10 epochs** (~80 days) from **Ethereum**:

```
Storage Costs:
  WAL Tokens:       0.001000 WAL  ($0.0008)
  SUI Tokens:       0.000100 SUI  ($0.00015)

Bridge Costs:
  Wormhole Fee:     0.0001 ETH    ($0.20)

Gas Costs:
  Ethereum Gas:     0.003 ETH     ($6.00)
  Sui Gas:          0.001 SUI     ($0.0015)

Exchange:
  ETH → SUI:        1 ETH = 1333 SUI
  Slippage:         0.1%

Total:              0.0032 ETH    ($6.40)
```

---

## 🔐 Security Features

### 1. Proof Verification

Every Walrus operation generates a verifiable proof:

```typescript
interface WalrusStorageProof {
  blobId: string;
  storedEpoch: number;
  certifiedEpoch: number;
  size: number;
  encodedSlivers: number;
  vaaSignature: Uint8Array;  // Wormhole VAA signature
}
```

### 2. Budget Protection

Set maximum spending limits:

```typescript
const estimate = await getCostEstimate({
  ...config,
  userBudget: '0.05', // Will reject if cost > 0.05 ETH
});

if (!estimate.withinBudget) {
  throw new Error('Cost exceeds budget');
}
```

### 3. Slippage Protection

Automatic slippage checks on swaps:

```typescript
const quote = await getSwapQuote('ETH', 'SUI', '1.0', 0.5);

// Swap will fail if output < minimumOutput
await executeSwap('ETH', 'SUI', '1.0', quote.minimumOutput);
```

---

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### Test Scenarios

1. **Cost Estimation**: Verify accurate cost calculations
2. **Bridge Simulation**: Test Wormhole bridge flow
3. **Token Swaps**: Test multi-hop routing
4. **End-to-End**: Full cross-chain upload

---

## 📖 API Reference

### Walrus Cross-Chain SDK

#### `storeFromChain(config, fileData)`

Execute complete cross-chain storage operation.

**Parameters**:
- `config`: `WalrusCrossChainConfig`
- `fileData`: `Uint8Array`

**Returns**: `Promise<WalrusCrossChainOperation>`

#### `getCostEstimate(config)`

Get cost estimate before execution.

**Parameters**:
- `config`: `WalrusCrossChainConfig`

**Returns**: `Promise<CrossChainCostEstimate>`

#### `getOperation(operationId)`

Get operation status by ID.

**Parameters**:
- `operationId`: `string`

**Returns**: `WalrusCrossChainOperation | null`

---

## 🎯 Roadmap

- [x] Wormhole bridge integration
- [x] Token swap service
- [x] Cost estimator
- [x] Unified SDK
- [x] UI components
- [ ] Solana program deployment
- [ ] EVM smart contracts
- [ ] Relayer service
- [ ] Mainnet deployment
- [ ] Audit completion

---

## 📞 Support

- **Documentation**: [Walrus Docs](https://docs.walrus.site)
- **Wormhole Docs**: [Wormhole Portal](https://wormhole.com/docs/)
- **GitHub**: [Sui-Idol3 Repository](https://github.com/your-org/sui-idol3)
- **Discord**: [Join Community](#)

---

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ by the Sui:Idol³ Team**
