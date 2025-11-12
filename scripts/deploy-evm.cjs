const hre = require("hardhat");

/**
 * Deploy WalrusStorageProof contract to EVM chains
 */
async function main() {
  console.log("🚀 Deploying WalrusStorageProof contract...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Get Wormhole Core address for the network
  const network = await hre.ethers.provider.getNetwork();
  const wormholeCoreAddresses = {
    // Testnets
    "11155111": "0x4a8bc80Ed5a4067f1CCf107057b8270E0cC11A78", // Sepolia
    "80001": "0x0CBE91CF822c73C2315FB05100C2F714765d5c20", // Mumbai
    "97": "0x68605AD7b15c732a30b1BbC62BE8F2A509D74b4D", // BSC Testnet

    // Mainnets
    "1": "0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B", // Ethereum
    "137": "0x7A4B5a56256163F07b2C80A7cA55aBE66c4ec4d7", // Polygon
    "56": "0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B", // BSC
    "8453": "0xbebdb6C8ddC678FfA9f8748f85C815C556Dd8ac6", // Base
    "42161": "0xa5f208e072434bC67592E4C49C1B991BA79BCA46", // Arbitrum
    "10": "0xEe91C335eab126dF5fDB3797EA9d6aD93aeC9722", // Optimism
  };

  const wormholeCore = wormholeCoreAddresses[network.chainId.toString()];

  if (!wormholeCore) {
    throw new Error(`Wormhole Core address not found for chain ID ${network.chainId}`);
  }

  console.log("Using Wormhole Core:", wormholeCore);

  // Deploy contract
  const WalrusStorageProof = await hre.ethers.getContractFactory("WalrusStorageProof");
  const contract = await WalrusStorageProof.deploy(wormholeCore);

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ WalrusStorageProof deployed to:", address);

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    contractAddress: address,
    wormholeCore,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  console.log("\n📝 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  console.log("\n📄 Add to your .env:");
  console.log(`VITE_WALRUS_PROOF_${network.name.toUpperCase()}=${address}`);

  // Verify contract (if on supported network)
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("\n⏳ Waiting for block confirmations...");
    const tx = contract.deploymentTransaction();
    if (tx) {
      await tx.wait(5);
    }

    console.log("🔍 Verifying contract on block explorer...");
    try {
      await hre.run("verify:verify", {
        address,
        constructorArguments: [wormholeCore],
      });
      console.log("✅ Contract verified!");
    } catch (error) {
      console.log("❌ Verification failed:", error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
