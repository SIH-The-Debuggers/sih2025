import { ethers } from "hardhat"; // via hardhat-toolbox (Ethers v6 wrapper)

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  const Factory = await ethers.getContractFactory("TouristIDRegistry");
  const contract = await Factory.deploy(deployer.address);
  await contract.waitForDeployment();
  console.log("TouristIDRegistry:", await contract.getAddress());
}

main().catch(e => { console.error(e); process.exit(1); });
