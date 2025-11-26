/**
 * Metadata Service for generating NFT metadata URIs
 *
 * This service creates ERC-721 compliant metadata for photocard NFTs
 * and uploads them to Walrus decentralized storage
 */

interface PhotocardMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  external_url?: string;
  background_color?: string;
}

export class MetadataService {
  private readonly walrusPublisher: string;
  private readonly walrusAggregator: string;

  constructor() {
    this.walrusPublisher = import.meta.env.VITE_WALRUS_PUBLISHER || 'https://publisher.walrus-testnet.walrus.space';
    this.walrusAggregator = import.meta.env.VITE_WALRUS_AGGREGATOR || 'https://aggregator.walrus-testnet.walrus.space';
  }

  /**
   * Generate ERC-721 compliant metadata for a photocard
   */
  generateMetadata(
    idolName: string,
    imageUrl: string,
    rarity: string,
    concept: string,
    photocardId: string
  ): PhotocardMetadata {
    return {
      name: `${idolName} - ${concept}`,
      description: `AIdol photocard featuring ${idolName} in the ${concept} concept.`,
      image: imageUrl,
      attributes: [
        {
          trait_type: 'Idol',
          value: idolName
        },
        {
          trait_type: 'Rarity',
          value: rarity
        },
        {
          trait_type: 'Concept',
          value: concept
        },
        {
          trait_type: 'Sui Photocard ID',
          value: photocardId
        },
        {
          trait_type: 'Chain',
          value: 'Cross-Chain (Sui → EVM)'
        }
      ],
      external_url: 'https://sui-idol.com', // Update with actual URL
      background_color: '1a1a2e'
    };
  }

  /**
   * Upload metadata to Walrus storage
   *
   * @param metadata ERC-721 metadata object
   * @returns Walrus blob ID or HTTPS URL
   */
  async uploadMetadata(metadata: PhotocardMetadata): Promise<string> {
    try {
      const metadataJson = JSON.stringify(metadata, null, 2);

      console.log('📤 Uploading metadata to Walrus...');
      console.log('Metadata:', metadata);

      // Upload to Walrus using correct API format
      const epochs = import.meta.env.VITE_WALRUS_EPOCHS || '1';
      const response = await fetch(`${this.walrusPublisher}/v1/store?epochs=${epochs}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: metadataJson,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Walrus upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Walrus upload result:', result);

      // Extract blob ID
      let blobId: string;
      if (result.newlyCreated?.blobObject?.blobId) {
        blobId = result.newlyCreated.blobObject.blobId;
      } else if (result.alreadyCertified?.blobId) {
        blobId = result.alreadyCertified.blobId;
      } else {
        throw new Error('Failed to extract blob ID from Walrus response');
      }

      // Return aggregator URL (this is the tokenURI)
      const tokenUri = `${this.walrusAggregator}/v1/${blobId}`;
      console.log('🔗 Metadata URI:', tokenUri);

      return tokenUri;
    } catch (error) {
      console.error('Failed to upload metadata to Walrus:', error);

      // Fallback: Return a data URI (not recommended for production)
      // Use UTF-8 safe Base64 encoding
      const metadataJson = JSON.stringify(metadata);

      // Convert to UTF-8 bytes, then to Base64
      const encoder = new TextEncoder();
      const bytes = encoder.encode(metadataJson);
      const base64 = btoa(String.fromCharCode(...bytes));
      const dataUri = `data:application/json;base64,${base64}`;

      console.warn('⚠️ Using fallback data URI instead of Walrus');
      console.warn('Fallback URI length:', dataUri.length);

      return dataUri;
    }
  }

  /**
   * Generate and upload metadata in one step
   *
   * @returns Token URI for ERC-721 contract
   */
  async generateAndUploadMetadata(
    idolName: string,
    imageUrl: string,
    rarity: string,
    concept: string,
    photocardId: string
  ): Promise<string> {
    const metadata = this.generateMetadata(idolName, imageUrl, rarity, concept, photocardId);
    const tokenUri = await this.uploadMetadata(metadata);
    return tokenUri;
  }

  /**
   * Fetch metadata from URI
   */
  async fetchMetadata(uri: string): Promise<PhotocardMetadata | null> {
    try {
      // Handle data URIs
      if (uri.startsWith('data:application/json;base64,')) {
        const base64 = uri.split(',')[1];

        // Decode Base64 to UTF-8 string safely
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const decoder = new TextDecoder();
        const json = decoder.decode(bytes);

        return JSON.parse(json);
      }

      // Fetch from HTTP(S)
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.status}`);
      }

      const metadata = await response.json();
      return metadata;
    } catch (error) {
      console.error('Failed to fetch metadata:', error);
      return null;
    }
  }
}

export const metadataService = new MetadataService();
