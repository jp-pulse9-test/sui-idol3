import { ethers } from 'ethers';

// PhotocardNFT contract ABI (only the functions we need)
const PHOTOCARD_NFT_ABI = [
  'function mintPhotocard(address recipient, string suiPhotocardId, string tokenURI) external returns (uint256)',
  'function isPhotocardMinted(string suiPhotocardId) external view returns (bool)',
  'function getEvmTokenId(string suiPhotocardId) external view returns (uint256)',
  'function totalSupply() external view returns (uint256)',
  'event PhotocardMinted(uint256 indexed tokenId, address indexed recipient, string suiPhotocardId, string tokenURI)'
];

export class EVMNftService {
  /**
   * Get network name for display
   */
  private getNetworkName(chainId: number): string {
    const names: Record<number, string> = {
      1: 'Ethereum Mainnet',
      11155111: 'Sepolia Testnet',
      137: 'Polygon Mainnet',
      80002: 'Polygon Amoy Testnet',
      56: 'BSC Mainnet',
      97: 'BSC Testnet',
      8453: 'Base',
      42161: 'Arbitrum One',
      10: 'Optimism',
    };
    return names[chainId] || `Chain ${chainId}`;
  }

  /**
   * Get PhotocardNFT contract address for the target chain
   */
  private getContractAddress(chainId: number): string | null {
    const addresses: Record<number, string> = {
      // Testnets
      11155111: import.meta.env.VITE_PHOTOCARD_NFT_SEPOLIA || '',
      80002: import.meta.env.VITE_PHOTOCARD_NFT_POLYGON_AMOY || '0xD02Bb83840181210060eF1e0871eB92151111D4e',
      97: import.meta.env.VITE_PHOTOCARD_NFT_BSC_TESTNET || '',

      // Mainnets
      1: import.meta.env.VITE_PHOTOCARD_NFT_ETHEREUM || '',
      137: import.meta.env.VITE_PHOTOCARD_NFT_POLYGON || '',
      56: import.meta.env.VITE_PHOTOCARD_NFT_BSC || '',
      8453: import.meta.env.VITE_PHOTOCARD_NFT_BASE || '',
      42161: import.meta.env.VITE_PHOTOCARD_NFT_ARBITRUM || '',
      10: import.meta.env.VITE_PHOTOCARD_NFT_OPTIMISM || '',
    };

    return addresses[chainId] || null;
  }

  /**
   * Check if MetaMask is installed
   */
  isMetaMaskInstalled(): boolean {
    return typeof window.ethereum !== 'undefined';
  }

  /**
   * Get MetaMask provider
   */
  private async getProvider(): Promise<ethers.BrowserProvider | null> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }

    return new ethers.BrowserProvider(window.ethereum);
  }

  /**
   * Get signer (connected wallet)
   */
  private async getSigner(): Promise<ethers.Signer> {
    const provider = await this.getProvider();
    if (!provider) {
      throw new Error('Provider not available');
    }

    const signer = await provider.getSigner();
    return signer;
  }

  /**
   * Get PhotocardNFT contract instance
   */
  private async getContract(chainId: number): Promise<ethers.Contract | null> {
    const contractAddress = this.getContractAddress(chainId);
    if (!contractAddress) {
      console.error(`No PhotocardNFT contract address for chain ID ${chainId}`);
      return null;
    }

    const signer = await this.getSigner();
    return new ethers.Contract(contractAddress, PHOTOCARD_NFT_ABI, signer);
  }

  /**
   * Switch to the target network
   */
  async switchNetwork(chainId: number): Promise<boolean> {
    if (!this.isMetaMaskInstalled()) {
      return false;
    }

    try {
      const hexChainId = `0x${chainId.toString(16)}`;
      console.log(`🔄 Switching to chain ID: ${chainId} (${hexChainId})`);

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }],
      });

      console.log('✅ Network switched successfully');
      return true;
    } catch (error: any) {
      console.error('❌ Failed to switch network:', error);

      // If network not added (error code 4902), try to add it
      if (error.code === 4902) {
        console.log('📝 Network not found, attempting to add it...');
        return await this.addNetwork(chainId);
      }

      // User rejected the request
      if (error.code === 4001) {
        console.log('❌ User rejected network switch');
        throw new Error('네트워크 전환을 거부하셨습니다. MetaMask에서 네트워크를 전환해주세요.');
      }

      return false;
    }
  }

  /**
   * Add a network to MetaMask
   */
  private async addNetwork(chainId: number): Promise<boolean> {
    const networkConfigs: Record<number, any> = {
      80002: {
        chainId: '0x13882',
        chainName: 'Polygon Amoy Testnet',
        nativeCurrency: {
          name: 'POL',
          symbol: 'POL',
          decimals: 18
        },
        rpcUrls: ['https://rpc-amoy.polygon.technology'],
        blockExplorerUrls: ['https://amoy.polygonscan.com']
      },
      11155111: {
        chainId: '0xaa36a7',
        chainName: 'Sepolia Testnet',
        nativeCurrency: {
          name: 'Sepolia ETH',
          symbol: 'ETH',
          decimals: 18
        },
        rpcUrls: ['https://sepolia.infura.io/v3/'],
        blockExplorerUrls: ['https://sepolia.etherscan.io']
      },
      137: {
        chainId: '0x89',
        chainName: 'Polygon Mainnet',
        nativeCurrency: {
          name: 'POL',
          symbol: 'POL',
          decimals: 18
        },
        rpcUrls: ['https://polygon-rpc.com'],
        blockExplorerUrls: ['https://polygonscan.com']
      }
    };

    const config = networkConfigs[chainId];
    if (!config) {
      console.error(`No network config found for chain ID ${chainId}`);
      throw new Error(`지원하지 않는 네트워크입니다 (Chain ID: ${chainId})`);
    }

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [config],
      });
      console.log('✅ Network added successfully');
      return true;
    } catch (error) {
      console.error('Failed to add network:', error);
      throw new Error('네트워크 추가에 실패했습니다. MetaMask 설정에서 수동으로 추가해주세요.');
    }
  }

  /**
   * Check if a photocard has already been minted on the target chain
   */
  async isPhotocardMinted(chainId: number, suiPhotocardId: string): Promise<boolean> {
    try {
      const contract = await this.getContract(chainId);
      if (!contract) {
        return false;
      }

      const isMinted = await contract.isPhotocardMinted(suiPhotocardId);
      return isMinted;
    } catch (error) {
      console.error('Failed to check if photocard is minted:', error);
      return false;
    }
  }

  /**
   * Mint photocard NFT on EVM chain
   *
   * @param chainId Target chain ID
   * @param suiPhotocardId Unique photocard ID from Sui
   * @param recipientAddress Recipient wallet address
   * @param metadataUri Metadata URI (IPFS/Walrus)
   * @returns Transaction hash if successful, null otherwise
   */
  async mintPhotocard(
    chainId: number,
    suiPhotocardId: string,
    recipientAddress: string,
    metadataUri: string
  ): Promise<string | null> {
    try {
      console.log('🚀 Starting mint process...');
      console.log('👛 Recipient wallet address:', recipientAddress);
      console.log('🔗 Target Chain ID:', chainId);
      console.log('📝 Sui Photocard ID:', suiPhotocardId);
      console.log('📄 Metadata URI:', metadataUri);

      // Check MetaMask installation
      if (!this.isMetaMaskInstalled()) {
        throw new Error('MetaMask가 설치되어 있지 않습니다.');
      }

      // Get current network
      const provider = await this.getProvider();
      if (!provider) {
        throw new Error('MetaMask provider를 가져올 수 없습니다.');
      }

      const network = await provider.getNetwork();
      const currentChainId = Number(network.chainId);

      console.log(`🔍 Current network: ${currentChainId}, Target: ${chainId}`);

      // Check if on correct network
      if (currentChainId !== chainId) {
        console.log(`⚠️ Wrong network! Current: ${currentChainId}, Need: ${chainId}`);

        const hexChainId = `0x${chainId.toString(16)}`;
        console.log(`🔄 Requesting network switch to ${hexChainId}...`);

        // Create promise to wait for network change
        const networkChanged = new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            window.ethereum.removeListener('chainChanged', onChainChanged);
            reject(new Error('TIMEOUT'));
          }, 10000); // 10 second timeout

          const onChainChanged = (newChainId: string) => {
            console.log(`🔔 Chain changed event received: ${newChainId}`);
            clearTimeout(timeout);
            window.ethereum.removeListener('chainChanged', onChainChanged);

            const newChainIdNum = parseInt(newChainId, 16);
            if (newChainIdNum === chainId) {
              console.log('✅ Network switched successfully!');
              resolve();
            } else {
              reject(new Error(`Wrong network: ${newChainIdNum}`));
            }
          };

          window.ethereum.on('chainChanged', onChainChanged);
        });

        try {
          // Request network switch
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: hexChainId }],
          });

          // Wait for chainChanged event
          await networkChanged;

        } catch (error: any) {
          console.error('Network switch error:', error);

          // Network not added
          if (error.code === 4902) {
            console.log('📝 Network not in MetaMask, adding...');
            await this.addNetwork(chainId);

            // Try switch again after adding
            try {
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: hexChainId }],
              });
              await networkChanged;
            } catch (retryError) {
              throw new Error(
                `네트워크 추가 후 전환 실패.\n` +
                `MetaMask에서 수동으로 "${this.getNetworkName(chainId)}"로 전환 후 다시 시도해주세요.`
              );
            }
          }
          // User rejected
          else if (error.code === 4001) {
            throw new Error('네트워크 전환을 거부하셨습니다.');
          }
          // Timeout or wrong network
          else if (error.message === 'TIMEOUT') {
            throw new Error(
              `네트워크 전환 시간 초과.\n` +
              `MetaMask에서 수동으로 "${this.getNetworkName(chainId)}"로 전환 후 다시 시도해주세요.`
            );
          }
          // Other errors
          else {
            throw new Error(
              `네트워크 전환 실패: ${error.message}\n` +
              `MetaMask에서 수동으로 "${this.getNetworkName(chainId)}"로 전환 후 다시 시도해주세요.`
            );
          }
        }
      }

      console.log('✅ Correct network confirmed');

      // Get contract address
      const contractAddress = this.getContractAddress(chainId);
      if (!contractAddress) {
        throw new Error(`Chain ID ${chainId}에 배포된 PhotocardNFT 컨트랙트가 없습니다.`);
      }

      console.log('📍 Contract address:', contractAddress);

      // Get signer
      const signer = await this.getSigner();
      console.log('✍️ Signer obtained');

      // Create contract instance
      const contract = new ethers.Contract(contractAddress, PHOTOCARD_NFT_ABI, signer);
      console.log('📜 Contract instance created');

      // Mint NFT
      console.log('🎨 Calling mintPhotocard function...');

      // Estimate gas first
      let gasLimit = 1000000; // Default fallback
      try {
        const gasEstimate = await contract.mintPhotocard.estimateGas(
          recipientAddress,
          suiPhotocardId,
          metadataUri
        );
        gasLimit = Number(gasEstimate) * 2; // Add 100% buffer
        console.log(`⛽ Estimated gas: ${gasEstimate}, using: ${gasLimit}`);
      } catch (gasError) {
        console.warn('⚠️ Gas estimation failed, using default:', gasLimit);
      }

      const tx = await contract.mintPhotocard(
        recipientAddress,
        suiPhotocardId,
        metadataUri,
        {
          gasLimit: gasLimit,
        }
      );

      console.log('✅ Transaction sent:', tx.hash);
      console.log('⏳ Waiting for confirmation...');

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      console.log('✅ Transaction confirmed!');
      console.log('Block:', receipt.blockNumber);
      console.log('Gas used:', receipt.gasUsed.toString());

      // Extract token ID from event
      const mintEvent = receipt.logs
        .map((log: any) => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((event: any) => event && event.name === 'PhotocardMinted');

      if (mintEvent) {
        console.log('🎉 Token ID:', mintEvent.args.tokenId.toString());
      }

      return tx.hash;
    } catch (error: any) {
      console.error('Failed to mint photocard:', error);

      // Parse error message
      if (error.message.includes('already minted')) {
        throw new Error('이미 이 체인에 민팅된 포토카드입니다.');
      } else if (error.message.includes('insufficient funds')) {
        throw new Error('가스비가 부족합니다. 지갑에 충분한 잔액이 있는지 확인해주세요.');
      } else if (error.code === 'ACTION_REJECTED') {
        throw new Error('사용자가 트랜잭션을 거부했습니다.');
      } else {
        throw new Error(`NFT 민팅 실패: ${error.message}`);
      }
    }
  }

  /**
   * Get total supply of PhotocardNFTs on a chain
   */
  async getTotalSupply(chainId: number): Promise<number> {
    try {
      const contract = await this.getContract(chainId);
      if (!contract) {
        return 0;
      }

      const totalSupply = await contract.totalSupply();
      return Number(totalSupply);
    } catch (error) {
      console.error('Failed to get total supply:', error);
      return 0;
    }
  }
}

export const evmNftService = new EVMNftService();
