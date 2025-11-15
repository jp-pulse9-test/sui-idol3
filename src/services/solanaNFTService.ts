import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';
import { toast } from 'sonner';
import { pinataService } from './pinataService';

export interface SolanaNFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

export interface SolanaMintResult {
  mintAddress: string;
  txSignature: string;
  metadataUri: string;
}

class SolanaNFTService {
  private connection: Connection;
  private metaplex: Metaplex | null = null;

  constructor() {
    // Use devnet for testing, change to mainnet-beta for production
    // Note: For real NFT minting, use mainnet-beta
    // Devnet has issues with Irys bundler that cause funding transaction failures

    const network = import.meta.env.VITE_SOLANA_NETWORK || 'devnet';
    console.log('🌐 Solana network:', network);

    this.connection = new Connection(
      clusterApiUrl(network as 'devnet' | 'testnet' | 'mainnet-beta'),
      {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 120000, // 2 minutes timeout
      }
    );
  }

  /**
   * Initialize Metaplex with user's wallet
   */
  async initializeMetaplex(wallet: any): Promise<void> {
    try {
      // Note: In browser, we use the Phantom wallet adapter
      // The wallet should have the publicKey and signTransaction methods
      this.metaplex = Metaplex.make(this.connection)
        .use({
          install(metaplex) {
            metaplex.identity().setDriver({
              publicKey: wallet.publicKey,
              signMessage: wallet.signMessage?.bind(wallet),
              signTransaction: wallet.signTransaction?.bind(wallet),
              signAllTransactions: wallet.signAllTransactions?.bind(wallet),
            });
          },
        });

      console.log('✅ Metaplex initialized with wallet:', wallet.publicKey.toString());
    } catch (error) {
      console.error('Failed to initialize Metaplex:', error);
      throw error;
    }
  }

  /**
   * Get Phantom wallet if available
   */
  async getPhantomWallet() {
    if (typeof window === 'undefined') {
      throw new Error('Window is not defined');
    }

    const phantom = (window as any).solana;

    if (!phantom?.isPhantom) {
      throw new Error('Phantom wallet not found');
    }

    if (!phantom.isConnected) {
      await phantom.connect();
    }

    return phantom;
  }

  /**
   * Upload metadata to IPFS via Pinata (more stable than Irys)
   */
  async uploadMetadata(metadata: SolanaNFTMetadata): Promise<string> {
    try {
      // Check if Pinata is configured
      if (!pinataService.isConfigured()) {
        toast.error(
          '❌ Pinata가 설정되지 않았습니다\n\n' +
          '💡 해결 방법:\n' +
          '1. https://app.pinata.cloud/ 에서 계정 생성\n' +
          '2. API Keys → New Key → JWT 생성\n' +
          '3. .env 파일에 VITE_PINATA_JWT=your-jwt 추가',
          { duration: 15000 }
        );
        throw new Error('Pinata not configured. Please add VITE_PINATA_JWT to .env file');
      }

      toast.info('📤 IPFS에 메타데이터 업로드 중... (Pinata)');

      // Upload to Pinata IPFS
      const ipfsUrl = await pinataService.uploadJSON(metadata, {
        name: `${metadata.name} - Metadata`,
        keyvalues: {
          type: 'nft-metadata',
          symbol: metadata.symbol,
          collection: 'Sui:Idol³'
        }
      });

      console.log('✅ Metadata uploaded to IPFS via Pinata:', ipfsUrl);
      toast.success('✅ 메타데이터 업로드 완료! (Pinata IPFS)');

      return ipfsUrl;
    } catch (error: any) {
      console.error('Pinata metadata upload failed:', error);

      if (error.message?.includes('Pinata not configured')) {
        // Error already shown above
      } else if (error.message?.includes('Pinata upload failed')) {
        toast.error(
          '❌ Pinata 업로드 실패\n\n' +
          '💡 해결 방법:\n' +
          '1. VITE_PINATA_JWT 토큰이 올바른지 확인\n' +
          '2. Pinata 계정에 충분한 스토리지가 있는지 확인\n' +
          '3. 네트워크 연결 상태 확인',
          { duration: 10000 }
        );
      } else {
        toast.error('❌ 메타데이터 업로드 실패\n💡 콘솔 로그를 확인하세요');
      }

      throw error;
    }
  }

  /**
   * Mint NFT on Solana (bridged from Sui)
   * @param photocardId - Original Sui photocard ID
   * @param suiTxHash - Original Sui transaction hash (optional)
   */
  async mintNFT(
    idolName: string,
    imageUrl: string,
    rarity: string,
    concept: string,
    photocardId?: string,
    suiTxHash?: string
  ): Promise<SolanaMintResult> {
    try {
      // Get Phantom wallet
      const wallet = await this.getPhantomWallet();

      // Check SOL balance first
      const balance = await this.connection.getBalance(wallet.publicKey);
      const balanceInSol = balance / 1_000_000_000;

      console.log('💰 Phantom wallet SOL balance:', balanceInSol);

      if (balanceInSol < 0.01) {
        const network = import.meta.env.VITE_SOLANA_NETWORK || 'devnet';
        const faucetUrl = network === 'devnet'
          ? 'https://faucet.solana.com/'
          : 'Buy SOL from exchange';

        throw new Error(
          `Insufficient SOL balance: ${balanceInSol.toFixed(4)} SOL\n` +
          `Minimum required: 0.01 SOL\n` +
          `Get SOL from: ${faucetUrl}`
        );
      }

      // Initialize Metaplex
      await this.initializeMetaplex(wallet);

      if (!this.metaplex) {
        throw new Error('Failed to initialize Metaplex');
      }

      toast.info('🌉 Sui 포토카드를 Solana NFT로 브릿지 중...');

      // Prepare metadata with Sui origin information
      const attributes: Array<{ trait_type: string; value: string }> = [
        {
          trait_type: 'Idol Name',
          value: idolName,
        },
        {
          trait_type: 'Rarity',
          value: rarity,
        },
        {
          trait_type: 'Concept',
          value: concept,
        },
        {
          trait_type: 'Collection',
          value: 'Sui:Idol³ Season 1',
        },
        {
          trait_type: 'Origin Chain',
          value: 'Sui Network',
        },
        {
          trait_type: 'Bridge Status',
          value: 'Bridged to Solana',
        },
      ];

      // Add Sui-specific attributes if available
      if (photocardId) {
        attributes.push({
          trait_type: 'Sui Photocard ID',
          value: photocardId,
        });
      }

      if (suiTxHash) {
        attributes.push({
          trait_type: 'Sui TX Hash',
          value: suiTxHash,
        });
      }

      const metadata: SolanaNFTMetadata = {
        name: `${idolName} - ${concept}`,
        symbol: 'SUIDOL',
        description: `Sui:Idol³ Photocard - ${idolName} (${rarity})\n\nThis NFT is bridged from Sui Network to Solana. Original photocard minted on Sui blockchain.`,
        image: imageUrl,
        attributes,
      };

      // Upload metadata
      const metadataUri = await this.uploadMetadata(metadata);

      toast.info('⚡ Solana에서 브릿지된 NFT 생성 중...');

      // Mint NFT
      const { nft, response } = await this.metaplex.nfts().create({
        uri: metadataUri,
        name: metadata.name,
        symbol: metadata.symbol,
        sellerFeeBasisPoints: 500, // 5% royalty
        creators: [
          {
            address: wallet.publicKey,
            share: 100,
          },
        ],
      });

      const result: SolanaMintResult = {
        mintAddress: nft.address.toString(),
        txSignature: response.signature,
        metadataUri,
      };

      console.log('✅ Solana NFT minted:', result);
      toast.success(`✅ Solana NFT 브릿지 완료!\n🔗 Mint: ${result.mintAddress.substring(0, 8)}...`);

      return result;
    } catch (error: any) {
      console.error('Solana NFT minting failed:', error);

      // Enhanced error messages
      if (error.message?.includes('User rejected')) {
        toast.error('❌ 사용자가 트랜잭션을 취소했습니다');
      } else if (error.message?.includes('Insufficient SOL balance')) {
        toast.error(error.message);
      } else if (error.message?.includes('insufficient funds')) {
        toast.error('❌ SOL 잔액이 부족합니다\n💡 Phantom 지갑에 최소 0.01 SOL이 필요합니다');
      } else if (error.message?.includes('failed to post funding tx') ||
                 error.message?.includes('Confirmed tx not found')) {
        const network = import.meta.env.VITE_SOLANA_NETWORK || 'devnet';

        if (network === 'devnet') {
          toast.error(
            '❌ Devnet Irys 스토리지 오류\n\n' +
            '💡 해결 방법:\n' +
            '1. Phantom 지갑에 충분한 devnet SOL 확보 (0.1+ SOL)\n' +
            '2. 5-10분 후 다시 시도\n' +
            '3. 또는 관리자에게 mainnet 전환 요청',
            { duration: 10000 }
          );
        } else {
          toast.error('❌ 메타데이터 업로드 실패\n💡 네트워크가 혼잡합니다. 잠시 후 다시 시도해주세요');
        }
      } else if (error.message?.includes('timeout')) {
        toast.error('❌ 트랜잭션 타임아웃\n💡 네트워크 연결을 확인하고 다시 시도해주세요');
      } else {
        toast.error('❌ Solana NFT 민팅 실패\n💡 콘솔 로그를 확인해주세요');
      }

      throw error;
    }
  }

  /**
   * Get NFT by mint address
   */
  async getNFT(mintAddress: string) {
    if (!this.metaplex) {
      const wallet = await this.getPhantomWallet();
      await this.initializeMetaplex(wallet);
    }

    if (!this.metaplex) {
      throw new Error('Failed to initialize Metaplex');
    }

    try {
      const nft = await this.metaplex.nfts().findByMint({
        mintAddress: new PublicKey(mintAddress),
      });

      return nft;
    } catch (error) {
      console.error('Failed to get NFT:', error);
      throw error;
    }
  }

  /**
   * Get user's NFTs
   */
  async getUserNFTs(walletAddress: string) {
    if (!this.metaplex) {
      const wallet = await this.getPhantomWallet();
      await this.initializeMetaplex(wallet);
    }

    if (!this.metaplex) {
      throw new Error('Failed to initialize Metaplex');
    }

    try {
      const nfts = await this.metaplex.nfts().findAllByOwner({
        owner: new PublicKey(walletAddress),
      });

      // Filter for Sui:Idol NFTs
      const suiIdolNFTs = nfts.filter(
        (nft) => nft.symbol === 'SUIDOL'
      );

      return suiIdolNFTs;
    } catch (error) {
      console.error('Failed to get user NFTs:', error);
      throw error;
    }
  }

  /**
   * Check wallet connection
   */
  async isWalletConnected(): Promise<boolean> {
    try {
      const phantom = (window as any).solana;
      return phantom?.isConnected || false;
    } catch {
      return false;
    }
  }

  /**
   * Get wallet address
   */
  async getWalletAddress(): Promise<string | null> {
    try {
      const phantom = (window as any).solana;
      if (phantom?.isConnected) {
        return phantom.publicKey.toString();
      }
      return null;
    } catch {
      return null;
    }
  }
}

export const solanaNFTService = new SolanaNFTService();
