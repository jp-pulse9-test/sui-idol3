const hre = require("hardhat");

/**
 * Deploy PhotocardNFT contract to EVM chains
 */
async function main() {
  console.log("🚀 Deploying PhotocardNFT contract...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Deploy PhotocardNFT
  const PhotocardNFT = await hre.ethers.getContractFactory("PhotocardNFT");
  const nftContract = await PhotocardNFT.deploy(deployer.address);

  await nftContract.waitForDeployment();

  const nftAddress = await nftContract.getAddress();
  console.log("✅ PhotocardNFT deployed to:", nftAddress);

  // Get network info
  const network = await hre.ethers.provider.getNetwork();

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    nftContract: nftAddress,
    owner: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  console.log("\n📝 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  console.log("\n📄 Add to your .env:");
  console.log(`VITE_PHOTOCARD_NFT_${network.name.toUpperCase()}=${nftAddress}`);

  // Verify contract (if API key is available)
  if (process.env.ETHERSCAN_API_KEY || process.env.POLYGONSCAN_API_KEY) {
    console.log("\n⏳ Waiting for block confirmations...");
    const tx = nftContract.deploymentTransaction();
    if (tx) {
      await tx.wait(5);
    }

    console.log("🔍 Verifying contract on block explorer...");
    try {
      await hre.run("verify:verify", {
        address: nftAddress,
        constructorArguments: [deployer.address],
      });
      console.log("✅ Contract verified!");
    } catch (error) {
      console.log("❌ Verification failed:", error.message);
    }
  }

  console.log("\n🎯 Next steps:");
  console.log("1. Update .env with the contract address");
  console.log("2. Authorize minter addresses using setAuthorizedMinter()");
  console.log("3. Test minting with mintPhotocard() function");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
