import { toast } from 'sonner';

export interface PinataMetadata {
  name: string;
  keyvalues?: Record<string, string>;
}

export interface PinataUploadResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

class PinataService {
  private apiKey: string;
  private apiSecret: string;
  private jwt: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_PINATA_API_KEY || '';
    this.apiSecret = import.meta.env.VITE_PINATA_API_SECRET || '';
    this.jwt = import.meta.env.VITE_PINATA_JWT || '';
  }

  /**
   * Check if Pinata is configured
   */
  isConfigured(): boolean {
    return !!(this.jwt || (this.apiKey && this.apiSecret));
  }

  /**
   * Upload JSON metadata to IPFS via Pinata
   */
  async uploadJSON(data: any, pinataMetadata?: PinataMetadata): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Pinata API keys not configured');
    }

    try {
      const body = {
        pinataContent: data,
        pinataMetadata: pinataMetadata || {
          name: `nft-metadata-${Date.now()}`
        }
      };

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Use JWT if available (recommended), otherwise use API key/secret
      if (this.jwt) {
        headers['Authorization'] = `Bearer ${this.jwt}`;
      } else {
        headers['pinata_api_key'] = this.apiKey;
        headers['pinata_secret_api_key'] = this.apiSecret;
      }

      console.log('📤 Uploading to Pinata IPFS...');

      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();

        // Parse error for better messaging
        let errorMessage = `Pinata upload failed: ${response.status} ${errorText}`;

        if (response.status === 403) {
          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.error?.reason === 'NO_SCOPES_FOUND') {
              errorMessage = 'Pinata API key does not have required permissions.\n\n' +
                'Please create a new API key with these scopes:\n' +
                '✓ pinFileToIPFS\n' +
                '✓ pinJSONToIPFS\n\n' +
                'Visit: https://app.pinata.cloud/developers/api-keys';
            }
          } catch (e) {
            // Keep default error message
          }
        }

        throw new Error(errorMessage);
      }

      const result: PinataUploadResponse = await response.json();
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;

      console.log('✅ Pinata upload successful:', {
        hash: result.IpfsHash,
        url: ipfsUrl
      });

      return ipfsUrl;
    } catch (error: any) {
      console.error('Pinata upload error:', error);
      throw error;
    }
  }

  /**
   * Upload file to IPFS via Pinata
   */
  async uploadFile(file: File, pinataMetadata?: PinataMetadata): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Pinata API keys not configured');
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      if (pinataMetadata) {
        formData.append('pinataMetadata', JSON.stringify(pinataMetadata));
      }

      const headers: HeadersInit = {};

      if (this.jwt) {
        headers['Authorization'] = `Bearer ${this.jwt}`;
      } else {
        headers['pinata_api_key'] = this.apiKey;
        headers['pinata_secret_api_key'] = this.apiSecret;
      }

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers,
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pinata file upload failed: ${response.status} ${errorText}`);
      }

      const result: PinataUploadResponse = await response.json();
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;

      console.log('✅ File uploaded to Pinata:', ipfsUrl);

      return ipfsUrl;
    } catch (error: any) {
      console.error('Pinata file upload error:', error);
      throw error;
    }
  }

  /**
   * Test Pinata connection
   */
  async testConnection(): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      const headers: HeadersInit = {};

      if (this.jwt) {
        headers['Authorization'] = `Bearer ${this.jwt}`;
      } else {
        headers['pinata_api_key'] = this.apiKey;
        headers['pinata_secret_api_key'] = this.apiSecret;
      }

      const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
        method: 'GET',
        headers
      });

      return response.ok;
    } catch (error) {
      console.error('Pinata test connection failed:', error);
      return false;
    }
  }
}

export const pinataService = new PinataService();
