import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const Access = await ethers.getContractFactory("AccessManager");
  const access = await Access.deploy(deployer.address);
  await access.deployed();
  console.log("AccessManager:", access.address);

  const Identity = await ethers.getContractFactory("DigitalIdentity");
  const identity = await Identity.deploy(access.address);
  await identity.deployed();
  console.log("DigitalIdentity:", identity.address);

  const Geo = await ethers.getContractFactory("GeoFenceRegistry");
  const geo = await Geo.deploy(access.address);
  await geo.deployed();
  console.log("GeoFenceRegistry:", geo.address);

  const Inc = await ethers.getContractFactory("IncidentManager");
  const incidents = await Inc.deploy(access.address);
  await incidents.deployed();
  console.log("IncidentManager:", incidents.address);

  const Rep = await ethers.getContractFactory("ReputationOracle");
  const rep = await Rep.deploy(access.address);
  await rep.deployed();
  console.log("ReputationOracle:", rep.address);

  const Hub = await ethers.getContractFactory("TouristSafetyHub");
  const hub = await Hub.deploy(access.address, incidents.address, geo.address, identity.address);
  await hub.deployed();
  console.log("TouristSafetyHub:", hub.address);

  console.log("Deployment complete.");
}

main().catch((e) => { console.error(e); process.exit(1); });
