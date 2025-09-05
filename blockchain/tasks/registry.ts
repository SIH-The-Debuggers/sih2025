import { task } from "hardhat/config";

task("registry:deploy", "Deploy TouristIDRegistry (constructor: initialOwner=deployer)")
  .setAction(async (_, hre) => {
    const [deployer] = await hre.ethers.getSigners();
    const provider = hre.ethers.provider;
    const bal = await provider.getBalance(deployer.address);
    const net = await provider.getNetwork();
    console.log("Network:", net.chainId.toString());
    console.log("Deployer:", deployer.address, "Balance ETH:", hre.ethers.formatEther(bal));
    if (bal === 0n) {
      console.error("ERROR: Deployer has 0 balance. Fund with Sepolia ETH first.");
      return;
    }
    const F = await hre.ethers.getContractFactory("TouristIDRegistry");
    const deployTx = await F.getDeployTransaction(deployer.address);
    // Show gas estimate
    const gas = await provider.estimateGas(deployTx as any).catch(()=>null);
    if (gas) console.log("Estimated Gas:", gas.toString());
    const contract = await F.deploy(deployer.address);
    const txHash = contract.deploymentTransaction()?.hash;
    console.log("Deploy tx hash:", txHash);
    console.log("Waiting for 1 confirmation...");
    await contract.waitForDeployment();
    const addr = await contract.getAddress();
    const code = await provider.getCode(addr);
    console.log("Deployed address:", addr, "Code size:", (code.length/2 -1), "bytes");
    console.log("Owner (initialOwner):", deployer.address);
    console.log("Add REGISTRY_ADDRESS=", addr, "to your .env");
  });

task("registry:register", "Register first anchor for caller")
  .addParam("registry", "Registry address")
  .addParam("hash", "Anchor hash (0x..32 bytes)")
  .addParam("did", "DID URI")
  .setAction(async (args, hre) => {
    const c = await hre.ethers.getContractAt("TouristIDRegistry", args.registry);
    const tx = await c.register(args.hash, args.did);
    console.log("tx:", tx.hash);
    await tx.wait();
    console.log("Registered.");
  });

task("registry:update", "Update anchor for caller")
  .addParam("registry", "Registry address")
  .addParam("hash", "New anchor hash")
  .addParam("did", "New DID URI")
  .setAction(async (args, hre) => {
    const c = await hre.ethers.getContractAt("TouristIDRegistry", args.registry);
    const tx = await c.update(args.hash, args.did);
    console.log("tx:", tx.hash);
    await tx.wait();
    console.log("Updated.");
  });

task("registry:get", "Get latest anchor for subject")
  .addParam("registry", "Registry address")
  .addParam("subject", "Subject address")
  .setAction(async (args, hre) => {
    const c = await hre.ethers.getContractAt("TouristIDRegistry", args.registry);
    const [anchorHash, didUri, updatedAt, version] = await c.getLatest(args.subject);
    console.log({ anchorHash, didUri, updatedAt: updatedAt.toString(), version: version.toString() });
  });
