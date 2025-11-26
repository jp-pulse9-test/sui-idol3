const hre = require("hardhat");

/**
 * Authorize a minter address for PhotocardNFT contract
 *
 * Usage:
 * MINTER_ADDRESS=0x... PRIVATE_KEY=... npx hardhat run scripts/authorize-minter.cjs --network polygonAmoy
 */
async function main() {
  const minterAddress = process.env.MINTER_ADDRESS;
  const contractAddress = process.env.CONTRACT_ADDRESS || "0xD02Bb83840181210060eF1e0871eB92151111D4e";

  if (!minterAddress) {
    console.error("❌ Error: MINTER_ADDRESS environment variable is required");
    console.log("\nUsage:");
    console.log("MINTER_ADDRESS=0x... npx hardhat run scripts/authorize-minter.cjs --network polygonAmoy");
    process.exit(1);
  }

  console.log("🔑 Authorizing minter for PhotocardNFT contract...");
  console.log("Contract:", contractAddress);
  console.log("Minter address:", minterAddress);

  const [signer] = await hre.ethers.getSigners();
  console.log("Signing with:", signer.address);

  // Get contract instance
  const PhotocardNFT = await hre.ethers.getContractFactory("PhotocardNFT");
  const contract = PhotocardNFT.attach(contractAddress);

  // Check current authorization
  const isAuthorized = await contract.authorizedMinters(minterAddress);
  console.log("Current authorization status:", isAuthorized);

  if (isAuthorized) {
    console.log("✅ Address is already an authorized minter");
    return;
  }

  // Authorize the minter
  console.log("📝 Sending authorization transaction...");
  const tx = await contract.setAuthorizedMinter(minterAddress, true);
  console.log("Transaction hash:", tx.hash);

  console.log("⏳ Waiting for confirmation...");
  const receipt = await tx.wait();

  console.log("✅ Minter authorized!");
  console.log("Block number:", receipt.blockNumber);
  console.log("Gas used:", receipt.gasUsed.toString());

  // Verify authorization
  const isNowAuthorized = await contract.authorizedMinters(minterAddress);
  console.log("New authorization status:", isNowAuthorized);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
