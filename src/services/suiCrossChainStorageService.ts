/**
 * Sui Cross-Chain Storage Service
 *
 * Interacts with the deployed CrossChainStorage.move contract on Sui
 * to store and verify cross-chain storage proofs
 */

import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';

const PACKAGE_ID = import.meta.env.VITE_SUI_PACKAGE_ID;
const PROOF_REGISTRY = import.meta.env.VITE_SUI_PROOF_REGISTRY;
const SUI_RPC_URL = import.meta.env.VITE_SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443';

export interface StorageProofData {
  blobId: string;
  storedEpoch: number;
  certifiedEpoch: number;
  fileSize: number;
  encodedSlivers: number;
  sourceChain: string;
  sourceTxHash: string;
  vaaSignature: Uint8Array;
}

export interface ProofInfo {
  blobId: string;
  storedEpoch: number;
  certifiedEpoch: number;
  fileSize: number;
  owner: string;
}

class SuiCrossChainStorageService {
  private client: SuiClient;

  constructor() {
    this.client = new SuiClient({ url: SUI_RPC_URL });
  }

  /**
   * Create a storage proof on Sui blockchain
   */
  async createProof(
    proofData: StorageProofData,
    signAndExecuteTransaction: any
  ): Promise<{ digest: string; proofObjectId?: string }> {
    if (!PACKAGE_ID || !PROOF_REGISTRY) {
      throw new Error('Sui contract not deployed. Please check environment variables.');
    }

    console.log('📝 Creating storage proof on Sui...');
    console.log('Package ID:', PACKAGE_ID);
    console.log('Proof Registry:', PROOF_REGISTRY);

    const tx = new Transaction();

    // Call create_proof function
    tx.moveCall({
      target: `${PACKAGE_ID}::cross_chain_storage::create_proof`,
      arguments: [
        tx.pure.string(proofData.blobId),
        tx.pure.u64(proofData.storedEpoch),
        tx.pure.u64(proofData.certifiedEpoch),
        tx.pure.u64(proofData.fileSize),
        tx.pure.u64(proofData.encodedSlivers),
        tx.pure.string(proofData.sourceChain),
        tx.pure.string(proofData.sourceTxHash),
        tx.pure.vector('u8', Array.from(proofData.vaaSignature)),
        tx.object(PROOF_REGISTRY),
      ],
    });

    try {
      // Use mutateAsync to get a promise back
      const result = await signAndExecuteTransaction({
        transaction: tx,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      console.log('✅ Storage proof created successfully!');
      console.log('Transaction digest:', result.digest);

      // Find the created StorageProof object
      const createdObjects = result.objectChanges?.filter(
        (change: any) => change.type === 'created'
      );

      const proofObject = createdObjects?.find((obj: any) =>
        obj.objectType?.includes('StorageProof')
      );

      return {
        digest: result.digest,
        proofObjectId: proofObject?.objectId,
      };
    } catch (error) {
      console.error('❌ Failed to create storage proof:', error);
      throw error;
    }
  }

  /**
   * Verify a storage proof
   */
  async verifyProof(
    proofObjectId: string,
    signer: any
  ): Promise<{ digest: string }> {
    if (!PACKAGE_ID) {
      throw new Error('Sui contract not deployed. Please check environment variables.');
    }

    console.log('🔍 Verifying storage proof...');

    const tx = new Transaction();

    tx.moveCall({
      target: `${PACKAGE_ID}::cross_chain_storage::verify_proof`,
      arguments: [tx.object(proofObjectId)],
    });

    try {
      const result = await signer.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        options: {
          showEffects: true,
        },
      });

      console.log('✅ Storage proof verified!');
      console.log('Transaction digest:', result.digest);

      return { digest: result.digest };
    } catch (error) {
      console.error('❌ Failed to verify storage proof:', error);
      throw error;
    }
  }

  /**
   * Get proof information
   */
  async getProofInfo(proofObjectId: string): Promise<ProofInfo | null> {
    try {
      const object = await this.client.getObject({
        id: proofObjectId,
        options: { showContent: true },
      });

      if (!object.data || !object.data.content || object.data.content.dataType !== 'moveObject') {
        return null;
      }

      const fields = (object.data.content as any).fields;

      return {
        blobId: fields.blob_id,
        storedEpoch: parseInt(fields.stored_epoch),
        certifiedEpoch: parseInt(fields.certified_epoch),
        fileSize: parseInt(fields.file_size),
        owner: fields.owner,
      };
    } catch (error) {
      console.error('Failed to get proof info:', error);
      return null;
    }
  }

  /**
   * Check if proof exists for a blob ID
   */
  async proofExists(blobId: string): Promise<boolean> {
    if (!PACKAGE_ID || !PROOF_REGISTRY) {
      return false;
    }

    try {
      const tx = new Transaction();

      tx.moveCall({
        target: `${PACKAGE_ID}::cross_chain_storage::proof_exists`,
        arguments: [
          tx.object(PROOF_REGISTRY),
          tx.pure.string(blobId),
        ],
      });

      // This would need devInspect to call a view function
      // For now, we'll return false as this requires more setup
      return false;
    } catch (error) {
      console.error('Failed to check proof existence:', error);
      return false;
    }
  }

  /**
   * Get user's proofs (requires querying events)
   */
  async getUserProofs(userAddress: string): Promise<string[]> {
    try {
      // Query ProofCreated events
      const events = await this.client.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::cross_chain_storage::ProofCreated`,
        },
        limit: 100,
      });

      const userProofs = events.data
        .filter((event: any) => event.parsedJson?.owner === userAddress)
        .map((event: any) => event.parsedJson?.blob_id)
        .filter(Boolean);

      return userProofs;
    } catch (error) {
      console.error('Failed to get user proofs:', error);
      return [];
    }
  }
}

export const suiCrossChainStorageService = new SuiCrossChainStorageService();
