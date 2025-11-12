// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title WalrusStorageProof
 * @dev Verifies and stores Walrus storage proofs on EVM chains
 */
contract WalrusStorageProof {
    // Wormhole Guardian verification (simplified)
    address public wormholeCore;

    struct StorageProof {
        bytes32 blobId;
        uint256 storedEpoch;
        uint256 certifiedEpoch;
        uint256 fileSize;
        uint256 encodedSlivers;
        string sourceChain;
        bytes32 sourceTxHash;
        bytes vaaSignature;
        address submitter;
        uint256 timestamp;
        bool verified;
    }

    // Mapping: blobId => StorageProof
    mapping(bytes32 => StorageProof) public proofs;

    // Mapping: user => blobIds[]
    mapping(address => bytes32[]) public userProofs;

    event ProofSubmitted(
        bytes32 indexed blobId,
        address indexed submitter,
        uint256 fileSize,
        uint256 timestamp
    );

    event ProofVerified(
        bytes32 indexed blobId,
        address indexed verifier,
        uint256 timestamp
    );

    constructor(address _wormholeCore) {
        wormholeCore = _wormholeCore;
    }

    /**
     * @dev Submit a storage proof from Walrus
     */
    function submitProof(
        bytes32 _blobId,
        uint256 _storedEpoch,
        uint256 _certifiedEpoch,
        uint256 _fileSize,
        uint256 _encodedSlivers,
        string memory _sourceChain,
        bytes32 _sourceTxHash,
        bytes memory _vaaSignature
    ) external {
        require(proofs[_blobId].blobId == bytes32(0), "Proof already exists");

        StorageProof memory proof = StorageProof({
            blobId: _blobId,
            storedEpoch: _storedEpoch,
            certifiedEpoch: _certifiedEpoch,
            fileSize: _fileSize,
            encodedSlivers: _encodedSlivers,
            sourceChain: _sourceChain,
            sourceTxHash: _sourceTxHash,
            vaaSignature: _vaaSignature,
            submitter: msg.sender,
            timestamp: block.timestamp,
            verified: false
        });

        proofs[_blobId] = proof;
        userProofs[msg.sender].push(_blobId);

        emit ProofSubmitted(_blobId, msg.sender, _fileSize, block.timestamp);
    }

    /**
     * @dev Verify a storage proof using Wormhole VAA
     */
    function verifyProof(bytes32 _blobId) external {
        StorageProof storage proof = proofs[_blobId];
        require(proof.blobId != bytes32(0), "Proof does not exist");
        require(!proof.verified, "Proof already verified");

        // In production, verify VAA signature against Wormhole Guardian set
        // For now, simple verification
        bool isValid = _verifyVAASignature(proof.vaaSignature);
        require(isValid, "Invalid VAA signature");

        proof.verified = true;

        emit ProofVerified(_blobId, msg.sender, block.timestamp);
    }

    /**
     * @dev Get proof details
     */
    function getProof(bytes32 _blobId) external view returns (
        uint256 storedEpoch,
        uint256 certifiedEpoch,
        uint256 fileSize,
        address submitter,
        bool verified
    ) {
        StorageProof memory proof = proofs[_blobId];
        return (
            proof.storedEpoch,
            proof.certifiedEpoch,
            proof.fileSize,
            proof.submitter,
            proof.verified
        );
    }

    /**
     * @dev Get all proofs for a user
     */
    function getUserProofs(address _user) external view returns (bytes32[] memory) {
        return userProofs[_user];
    }

    /**
     * @dev Check if proof exists and is verified
     */
    function isProofVerified(bytes32 _blobId) external view returns (bool) {
        return proofs[_blobId].verified;
    }

    /**
     * @dev Internal: Verify VAA signature (simplified)
     * In production, use Wormhole SDK for proper verification
     */
    function _verifyVAASignature(bytes memory _vaaSignature) internal view returns (bool) {
        // Simplified verification
        // In production:
        // 1. Parse VAA
        // 2. Verify Guardian signatures
        // 3. Check Guardian set
        // 4. Validate against Wormhole core

        return _vaaSignature.length > 0;
    }
}
