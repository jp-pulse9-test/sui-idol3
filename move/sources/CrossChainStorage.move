/// Cross-Chain Walrus Storage Module
/// Handles cross-chain storage proofs and verification
module sui_idol::cross_chain_storage {
    use std::string::String;
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use sui::table::{Self, Table};

    /// Storage proof structure
    public struct StorageProof has key, store {
        id: UID,
        blob_id: String,
        stored_epoch: u64,
        certified_epoch: u64,
        file_size: u64,
        encoded_slivers: u64,
        source_chain: String,
        source_tx_hash: String,
        vaa_signature: vector<u8>,
        owner: address,
        created_at: u64,
    }

    /// Storage proof registry
    public struct ProofRegistry has key {
        id: UID,
        proofs: Table<String, address>, // blob_id -> proof object ID
    }

    /// Event: Storage proof created
    public struct ProofCreated has copy, drop {
        blob_id: String,
        source_chain: String,
        owner: address,
        file_size: u64,
    }

    /// Event: Proof verified
    public struct ProofVerified has copy, drop {
        blob_id: String,
        verifier: address,
        timestamp: u64,
    }

    /// Initialize the proof registry
    fun init(ctx: &mut TxContext) {
        let registry = ProofRegistry {
            id: object::new(ctx),
            proofs: table::new(ctx),
        };
        transfer::share_object(registry);
    }

    /// Create storage proof
    public entry fun create_proof(
        blob_id: String,
        stored_epoch: u64,
        certified_epoch: u64,
        file_size: u64,
        encoded_slivers: u64,
        source_chain: String,
        source_tx_hash: String,
        vaa_signature: vector<u8>,
        registry: &mut ProofRegistry,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);

        let proof = StorageProof {
            id: object::new(ctx),
            blob_id,
            stored_epoch,
            certified_epoch,
            file_size,
            encoded_slivers,
            source_chain,
            source_tx_hash,
            vaa_signature,
            owner: sender,
            created_at: tx_context::epoch_timestamp_ms(ctx),
        };

        // Register proof
        table::add(&mut registry.proofs, blob_id, sender);

        // Emit event
        event::emit(ProofCreated {
            blob_id,
            source_chain,
            owner: sender,
            file_size,
        });

        // Transfer proof to creator
        transfer::transfer(proof, sender);
    }

    /// Verify storage proof (simple version)
    public entry fun verify_proof(
        proof: &StorageProof,
        ctx: &mut TxContext
    ) {
        let verifier = tx_context::sender(ctx);

        // In production, verify VAA signature here
        // For now, just emit event

        event::emit(ProofVerified {
            blob_id: proof.blob_id,
            verifier,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });
    }

    /// Get proof info
    public fun get_proof_info(proof: &StorageProof): (
        String,
        u64,
        u64,
        u64,
        address
    ) {
        (
            proof.blob_id,
            proof.stored_epoch,
            proof.certified_epoch,
            proof.file_size,
            proof.owner
        )
    }

    /// Check if proof exists for blob_id
    public fun proof_exists(
        registry: &ProofRegistry,
        blob_id: String
    ): bool {
        table::contains(&registry.proofs, blob_id)
    }

    /// Get proof owner
    public fun get_proof_owner(
        registry: &ProofRegistry,
        blob_id: String
    ): address {
        *table::borrow(&registry.proofs, blob_id)
    }
}
