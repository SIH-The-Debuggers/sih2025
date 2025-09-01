import { ethers } from "hardhat";
import { TouristIDRegistry } from "../typechain-types";

async function main() {
  console.log("🚀 Deploying TouristIDRegistry contract...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  console.log(
    "💰 Account balance:",
    (await deployer.provider.getBalance(deployer.address)).toString()
  );

  // Deploy the contract
  const TouristIDRegistryFactory =
    await ethers.getContractFactory("TouristIDRegistry");
  const touristRegistry: TouristIDRegistry =
    await TouristIDRegistryFactory.deploy();

  await touristRegistry.waitForDeployment();
  const contractAddress = await touristRegistry.getAddress();

  console.log("✅ TouristIDRegistry deployed to:", contractAddress);

  // Verify deployment by calling a view function
  const totalRegistered = await touristRegistry.getTotalRegistered();
  console.log("🔍 Total registered subjects:", totalRegistered.toString());

  // Save deployment info
  const deploymentInfo = {
    contractAddress,
    network: (await ethers.provider.getNetwork()).name,
    deployer: deployer.address,
    blockNumber: await ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
  };

  console.log("\n📋 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Export for use in other scripts
  return {
    touristRegistry,
    contractAddress,
    deployer,
  };
}

// Execute if run directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Deployment failed:", error);
      process.exit(1);
    });
}

export default main;
