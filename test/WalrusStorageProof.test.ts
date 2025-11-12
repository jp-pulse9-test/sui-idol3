import { expect } from "chai";
import { ethers } from "hardhat";
import { WalrusStorageProof } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("WalrusStorageProof", function () {
  let contract: WalrusStorageProof;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  const MOCK_WORMHOLE_CORE = "0x4a8bc80Ed5a4067f1CCf107057b8270E0cC11A78"; // Sepolia

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const WalrusStorageProof = await ethers.getContractFactory("WalrusStorageProof");
    contract = await WalrusStorageProof.deploy(MOCK_WORMHOLE_CORE);
    await contract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should set the correct Wormhole Core address", async function () {
      expect(await contract.wormholeCore()).to.equal(MOCK_WORMHOLE_CORE);
    });
  });

  describe("Proof Submission", function () {
    it("should submit a storage proof", async function () {
      const blobId = ethers.id("test-blob-1");
      const storedEpoch = 1000;
      const certifiedEpoch = 1001;
      const fileSize = 5242880; // 5 MB
      const encodedSlivers = 128;
      const sourceChain = "sui";
      const sourceTxHash = ethers.id("sui-tx-hash");
      const vaaSignature = ethers.toUtf8Bytes("mock-vaa-signature");

      const tx = await contract.submitProof(
        blobId,
        storedEpoch,
        certifiedEpoch,
        fileSize,
        encodedSlivers,
        sourceChain,
        sourceTxHash,
        vaaSignature
      );

      await expect(tx)
        .to.emit(contract, "ProofSubmitted")
        .withArgs(blobId, owner.address, fileSize, await ethers.provider.getBlock("latest").then(b => b!.timestamp));
    });

    it("should store proof details correctly", async function () {
      const blobId = ethers.id("test-blob-2");
      const storedEpoch = 2000;
      const certifiedEpoch = 2001;
      const fileSize = 1048576; // 1 MB
      const encodedSlivers = 64;
      const sourceChain = "sui";
      const sourceTxHash = ethers.id("sui-tx-hash-2");
      const vaaSignature = ethers.toUtf8Bytes("mock-signature");

      await contract.submitProof(
        blobId,
        storedEpoch,
        certifiedEpoch,
        fileSize,
        encodedSlivers,
        sourceChain,
        sourceTxHash,
        vaaSignature
      );

      const proof = await contract.getProof(blobId);

      expect(proof.storedEpoch).to.equal(storedEpoch);
      expect(proof.certifiedEpoch).to.equal(certifiedEpoch);
      expect(proof.fileSize).to.equal(fileSize);
      expect(proof.submitter).to.equal(owner.address);
      expect(proof.verified).to.be.false;
    });

    it("should reject duplicate proof submission", async function () {
      const blobId = ethers.id("test-blob-3");
      const storedEpoch = 3000;
      const certifiedEpoch = 3001;
      const fileSize = 2097152;
      const encodedSlivers = 96;
      const sourceChain = "sui";
      const sourceTxHash = ethers.id("sui-tx-hash-3");
      const vaaSignature = ethers.toUtf8Bytes("signature");

      await contract.submitProof(
        blobId,
        storedEpoch,
        certifiedEpoch,
        fileSize,
        encodedSlivers,
        sourceChain,
        sourceTxHash,
        vaaSignature
      );

      await expect(
        contract.submitProof(
          blobId,
          storedEpoch,
          certifiedEpoch,
          fileSize,
          encodedSlivers,
          sourceChain,
          sourceTxHash,
          vaaSignature
        )
      ).to.be.revertedWith("Proof already exists");
    });

    it("should track user proofs", async function () {
      const blobId1 = ethers.id("user-blob-1");
      const blobId2 = ethers.id("user-blob-2");
      const vaaSignature = ethers.toUtf8Bytes("sig");

      await contract.connect(user1).submitProof(
        blobId1, 1000, 1001, 1024, 32, "sui",
        ethers.id("tx1"), vaaSignature
      );

      await contract.connect(user1).submitProof(
        blobId2, 2000, 2001, 2048, 64, "sui",
        ethers.id("tx2"), vaaSignature
      );

      const userProofs = await contract.getUserProofs(user1.address);
      expect(userProofs.length).to.equal(2);
      expect(userProofs[0]).to.equal(blobId1);
      expect(userProofs[1]).to.equal(blobId2);
    });
  });

  describe("Proof Verification", function () {
    let testBlobId: string;

    beforeEach(async function () {
      testBlobId = ethers.id("verify-test-blob");
      await contract.submitProof(
        testBlobId,
        5000,
        5001,
        10485760,
        256,
        "sui",
        ethers.id("verify-tx"),
        ethers.toUtf8Bytes("test-signature-data")
      );
    });

    it("should verify a proof", async function () {
      const tx = await contract.verifyProof(testBlobId);

      await expect(tx)
        .to.emit(contract, "ProofVerified")
        .withArgs(testBlobId, owner.address, await ethers.provider.getBlock("latest").then(b => b!.timestamp));
    });

    it("should mark proof as verified", async function () {
      await contract.verifyProof(testBlobId);

      const isVerified = await contract.isProofVerified(testBlobId);
      expect(isVerified).to.be.true;
    });

    it("should reject verification of non-existent proof", async function () {
      const nonExistentBlobId = ethers.id("non-existent");

      await expect(
        contract.verifyProof(nonExistentBlobId)
      ).to.be.revertedWith("Proof does not exist");
    });

    it("should reject double verification", async function () {
      await contract.verifyProof(testBlobId);

      await expect(
        contract.verifyProof(testBlobId)
      ).to.be.revertedWith("Proof already verified");
    });
  });

  describe("Proof Queries", function () {
    it("should return false for non-existent proof verification", async function () {
      const nonExistentBlobId = ethers.id("query-non-existent");
      const isVerified = await contract.isProofVerified(nonExistentBlobId);

      expect(isVerified).to.be.false;
    });

    it("should return empty array for user with no proofs", async function () {
      const userProofs = await contract.getUserProofs(user2.address);
      expect(userProofs.length).to.equal(0);
    });

    it("should get correct proof details", async function () {
      const blobId = ethers.id("detail-test");
      const storedEpoch = 7000;
      const certifiedEpoch = 7001;
      const fileSize = 3145728;

      await contract.connect(user1).submitProof(
        blobId, storedEpoch, certifiedEpoch, fileSize, 128,
        "sui", ethers.id("detail-tx"), ethers.toUtf8Bytes("sig")
      );

      const proof = await contract.getProof(blobId);

      expect(proof.storedEpoch).to.equal(storedEpoch);
      expect(proof.certifiedEpoch).to.equal(certifiedEpoch);
      expect(proof.fileSize).to.equal(fileSize);
      expect(proof.submitter).to.equal(user1.address);
      expect(proof.verified).to.be.false;
    });
  });

  describe("Cross-Chain Integration", function () {
    it("should handle proofs from different source chains", async function () {
      const chains = ["sui", "ethereum", "polygon", "bsc"];
      const blobIds: string[] = [];

      for (let i = 0; i < chains.length; i++) {
        const blobId = ethers.id(`chain-${chains[i]}-blob`);
        blobIds.push(blobId);

        await contract.submitProof(
          blobId, 1000 + i, 1001 + i, 1024 * (i + 1), 32,
          chains[i], ethers.id(`tx-${i}`), ethers.toUtf8Bytes("sig")
        );
      }

      // Verify all proofs were submitted
      for (const blobId of blobIds) {
        const proof = await contract.getProof(blobId);
        expect(proof.fileSize).to.be.gt(0);
      }
    });
  });
});
