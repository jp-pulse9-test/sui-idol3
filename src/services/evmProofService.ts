/**
 * EVM Proof Service
 *
 * Interacts with deployed WalrusStorageProof.sol contract on EVM chains
 * to store cross-chain storage proofs
 */

import { ethers } from 'ethers';
import { toast } from 'sonner';

// Contract ABI (only the functions we need)
const WALRUS_PROOF_ABI = [
  "function submitProof(bytes32 blobId, uint256 storedEpoch, uint256 certifiedEpoch, uint256 fileSize, uint256 encodedSlivers, string memory sourceChain, bytes32 sourceTxHash, bytes memory vaaSignature) external",
  "function verifyProof(bytes32 blobId) external",
  "function getProof(bytes32 blobId) external view returns (uint256 storedEpoch, uint256 certifiedEpoch, uint256 fileSize, address submitter, bool verified)",
  "function isProofVerified(bytes32 blobId) external view returns (bool)",
  "event ProofSubmitted(bytes32 indexed blobId, address indexed submitter, uint256 fileSize, uint256 timestamp)",
  "event ProofVerified(bytes32 indexed blobId, address indexed verifier, uint256 timestamp)"
];

// Contract addresses for different chains
const CONTRACT_ADDRESSES: Record<string, string> = {
  sepolia: import.meta.env.VITE_WALRUS_PROOF_SEPOLIA || '0x92802d1a5d9BDc6Bb0097b1821297956AcF69274',
  // Add more chains as needed
};

export interface EVMProofData {
  blobId: string;
  storedEpoch: number;
  certifiedEpoch: number;
  fileSize: number;
  encodedSlivers: number;
  sourceChain: string;
  sourceTxHash: string;
  vaaSignature: Uint8Array;
}

class EVMProofService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;

  /**
   * Initialize connection to MetaMask (explicitly excluding Phantom)
   */
  async connect(): Promise<boolean> {
    try {
      // Find MetaMask provider (not Phantom)
      let ethereumProvider = this.getMetaMaskProvider();

      if (!ethereumProvider) {
        toast.error('MetaMask를 설치해주세요. (Phantom은 이더리움 체인에 사용할 수 없습니다)');
        return false;
      }

      this.provider = new ethers.BrowserProvider(ethereumProvider);

      // Request account access
      await ethereumProvider.request({ method: 'eth_requestAccounts' });

      this.signer = await this.provider.getSigner();

      const address = await this.signer.getAddress();
      console.log('✅ Connected to MetaMask:', address);

      return true;
    } catch (error) {
      console.error('Failed to connect to MetaMask:', error);
      toast.error('MetaMask 연결에 실패했습니다.');
      return false;
    }
  }

  /**
   * Get MetaMask provider explicitly (not Phantom or other wallets)
   */
  private getMetaMaskProvider(): any {
    if (typeof window.ethereum === 'undefined') {
      return null;
    }

    // If multiple providers exist (e.g., MetaMask + Phantom)
    if (window.ethereum.providers?.length) {
      // Find MetaMask specifically
      const metaMask = window.ethereum.providers.find((p: any) => p.isMetaMask && !p.isPhantom);
      if (metaMask) {
        console.log('✅ Found MetaMask in providers array');
        return metaMask;
      }
    }

    // Single provider - check if it's MetaMask (not Phantom)
    if (window.ethereum.isMetaMask && !window.ethereum.isPhantom) {
      console.log('✅ Found MetaMask as single provider');
      return window.ethereum;
    }

    console.warn('⚠️ MetaMask not found. Available:', {
      hasEthereum: !!window.ethereum,
      isMetaMask: window.ethereum?.isMetaMask,
      isPhantom: window.ethereum?.isPhantom,
      providersCount: window.ethereum?.providers?.length
    });

    return null;
  }

  /**
   * Switch to Sepolia testnet
   */
  async switchToSepolia(): Promise<boolean> {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia chainId
      });
      return true;
    } catch (error: any) {
      // Chain not added, try to add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xaa36a7',
              chainName: 'Sepolia Testnet',
              nativeCurrency: {
                name: 'Sepolia ETH',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              blockExplorerUrls: ['https://sepolia.etherscan.io']
            }],
          });
          return true;
        } catch (addError) {
          console.error('Failed to add Sepolia network:', addError);
          return false;
        }
      }
      console.error('Failed to switch to Sepolia:', error);
      return false;
    }
  }

  /**
   * Store proof on EVM blockchain
   */
  async storeProof(
    chainId: string,
    proofData: EVMProofData
  ): Promise<{ txHash: string; proofId: string } | null> {
    try {
      // Ensure connected
      if (!this.signer) {
        const connected = await this.connect();
        if (!connected) return null;
      }

      // Switch to correct network (for now, only Sepolia)
      if (chainId === 'sepolia') {
        const switched = await this.switchToSepolia();
        if (!switched) {
          toast.error('Please switch to Sepolia network');
          return null;
        }
      }

      const contractAddress = CONTRACT_ADDRESSES[chainId];
      if (!contractAddress) {
        toast.error(`Contract not deployed on ${chainId}`);
        return null;
      }

      toast.info('📝 Storing proof on Ethereum...');

      // Create contract instance
      const contract = new ethers.Contract(contractAddress, WALRUS_PROOF_ABI, this.signer);

      // Convert data to proper format
      const blobIdBytes32 = this.stringToBytes32(proofData.blobId);
      const sourceTxHashBytes32 = this.stringToBytes32(proofData.sourceTxHash);

      // Call submitProof function with manual gas limit
      let tx: any;
      try {
        // First, try to estimate gas
        const gasEstimate = await contract.submitProof.estimateGas(
          blobIdBytes32,
          proofData.storedEpoch,
          proofData.certifiedEpoch,
          proofData.fileSize,
          proofData.encodedSlivers,
          proofData.sourceChain,
          sourceTxHashBytes32,
          proofData.vaaSignature
        );

        console.log('⛽ Estimated gas:', gasEstimate.toString());

        // Add 20% buffer to gas estimate
        const gasLimit = (gasEstimate * 120n) / 100n;

        tx = await contract.submitProof(
          blobIdBytes32,
          proofData.storedEpoch,
          proofData.certifiedEpoch,
          proofData.fileSize,
          proofData.encodedSlivers,
          proofData.sourceChain,
          sourceTxHashBytes32,
          proofData.vaaSignature,
          { gasLimit }
        );
      } catch (gasError) {
        console.warn('⚠️ Gas estimation failed, using default gas limit:', gasError);

        // Fallback: use a fixed high gas limit
        tx = await contract.submitProof(
          blobIdBytes32,
          proofData.storedEpoch,
          proofData.certifiedEpoch,
          proofData.fileSize,
          proofData.encodedSlivers,
          proofData.sourceChain,
          sourceTxHashBytes32,
          proofData.vaaSignature,
          { gasLimit: 500000 } // Fixed gas limit as fallback
        );
      }

      toast.info('⏳ Waiting for transaction confirmation...');

      const receipt = await tx.wait();

      console.log('✅ Proof stored on chain!', receipt);

      // Extract blobId from event logs
      const proofSubmittedEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'ProofSubmitted';
        } catch {
          return false;
        }
      });

      let proofId = blobIdBytes32; // Use blobId as proofId
      if (proofSubmittedEvent) {
        const parsed = contract.interface.parseLog(proofSubmittedEvent);
        proofId = parsed?.args?.blobId || blobIdBytes32;
      }

      toast.success(`✅ Proof stored on ${chainId}!`);

      return {
        txHash: receipt.hash,
        proofId
      };
    } catch (error) {
      console.error('Failed to store proof on EVM:', error);
      toast.error('Failed to store proof on blockchain');
      return null;
    }
  }

  /**
   * Get current connected address
   */
  async getAddress(): Promise<string | null> {
    try {
      if (!this.signer) {
        const connected = await this.connect();
        if (!connected) return null;
      }
      return await this.signer.getAddress();
    } catch (error) {
      console.error('Failed to get address:', error);
      return null;
    }
  }

  /**
   * Helper: Convert string to bytes32
   */
  private stringToBytes32(str: string): string {
    // If it's already a hex string, use it
    if (str.startsWith('0x') && str.length === 66) {
      return str;
    }

    // Otherwise, hash it
    const hash = ethers.keccak256(ethers.toUtf8Bytes(str));
    return hash;
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return this.signer !== null;
  }
}

export const evmProofService = new EVMProofService();
