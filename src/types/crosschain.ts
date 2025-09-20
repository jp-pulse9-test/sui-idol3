export interface SupportedChain {
  id: string;
  name: string;
  symbol: string;
  rpcUrl: string;
  explorerUrl: string;
  chainId: number;
  icon: string;
  isTestnet?: boolean;
}

export interface CrossChainMintingData {
  photocardId: string;
  idolName: string;
  imageUrl: string;
  rarity: string;
  concept: string;
  targetChain: SupportedChain;
  recipientAddress: string;
}

export interface CrossChainTransaction {
  id: string;
  photocardId: string;
  sourceChain: string;
  targetChain: string;
  txHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
}

export const SUPPORTED_CHAINS: SupportedChain[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    explorerUrl: 'https://etherscan.io',
    chainId: 1,
    icon: '🔵'
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    rpcUrl: 'https://polygon-rpc.com/',
    explorerUrl: 'https://polygonscan.com',
    chainId: 137,
    icon: '🟣'
  },
  {
    id: 'bsc',
    name: 'BSC',
    symbol: 'BNB',
    rpcUrl: 'https://bsc-dataseed1.binance.org/',
    explorerUrl: 'https://bscscan.com',
    chainId: 56,
    icon: '🟡'
  },
  {
    id: 'base',
    name: 'Base',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    chainId: 8453,
    icon: '🔵'
  }
];