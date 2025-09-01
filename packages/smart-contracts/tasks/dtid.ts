import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("register-dtid", "Register a Digital Tourist ID hash on-chain")
  .addParam("contract", "The TouristIDRegistry contract address")
  .addParam("hash", "The anchor hash to register (0x...)")
  .addParam("did", "The DID URI for the tourist")
  .addOptionalParam("subject", "The subject address (defaults to signer)")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;

    console.log("🔗 Registering DTID on-chain...");
    console.log("📍 Network:", (await ethers.provider.getNetwork()).name);
    console.log("📄 Contract:", taskArgs.contract);
    console.log("🔒 Hash:", taskArgs.hash);
    console.log("🆔 DID URI:", taskArgs.did);

    // Get signer
    const [signer] = await ethers.getSigners();
    const subjectAddress = taskArgs.subject || signer.address;

    console.log("👤 Subject:", subjectAddress);
    console.log("📝 Signer:", signer.address);

    // Connect to contract
    const TouristIDRegistry =
      await ethers.getContractFactory("TouristIDRegistry");
    const registry = TouristIDRegistry.attach(taskArgs.contract).connect(
      signer
    );

    try {
      // Check if hash is already registered
      const [existingSubject, isValid] = await registry.verifyHash(
        taskArgs.hash
      );
      if (isValid) {
        console.log("⚠️  Hash already registered to:", existingSubject);
        return;
      }

      // Register the hash
      console.log("📤 Submitting transaction...");
      const tx = await registry.register(taskArgs.hash, taskArgs.did);

      console.log("⏳ Transaction hash:", tx.hash);
      console.log("⏳ Waiting for confirmation...");

      const receipt = await tx.wait();
      console.log("✅ Transaction confirmed in block:", receipt?.blockNumber);

      // Verify registration
      const [newSubject, newIsValid] = await registry.verifyHash(taskArgs.hash);
      if (newIsValid && newSubject === subjectAddress) {
        console.log("🎉 DTID successfully registered!");

        // Get the full record
        const [anchorHash, didUri, timestamp, isActive] =
          await registry.getLatest(subjectAddress);
        console.log("\n📋 Registration Details:");
        console.log("  Subject:", subjectAddress);
        console.log("  Anchor Hash:", anchorHash);
        console.log("  DID URI:", didUri);
        console.log(
          "  Timestamp:",
          new Date(Number(timestamp) * 1000).toISOString()
        );
        console.log("  Active:", isActive);
      } else {
        console.log("❌ Registration verification failed");
      }
    } catch (error: any) {
      console.error("❌ Registration failed:", error.message);
      throw error;
    }
  });

task("verify-dtid", "Verify a Digital Tourist ID hash")
  .addParam("contract", "The TouristIDRegistry contract address")
  .addParam("hash", "The anchor hash to verify (0x...)")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;

    console.log("🔍 Verifying DTID hash...");
    console.log("📄 Contract:", taskArgs.contract);
    console.log("🔒 Hash:", taskArgs.hash);

    // Connect to contract
    const TouristIDRegistry =
      await ethers.getContractFactory("TouristIDRegistry");
    const registry = TouristIDRegistry.attach(taskArgs.contract);

    try {
      const [subject, isValid] = await registry.verifyHash(taskArgs.hash);

      if (isValid) {
        console.log("✅ Hash is valid!");
        console.log("👤 Subject:", subject);

        // Get full record details
        const [anchorHash, didUri, timestamp, isActive] =
          await registry.getLatest(subject);
        console.log("\n📋 Record Details:");
        console.log("  Anchor Hash:", anchorHash);
        console.log("  DID URI:", didUri);
        console.log(
          "  Registered:",
          new Date(Number(timestamp) * 1000).toISOString()
        );
        console.log("  Active:", isActive);
      } else {
        console.log("❌ Hash not found or inactive");
      }
    } catch (error: any) {
      console.error("❌ Verification failed:", error.message);
      throw error;
    }
  });

task("dtid-stats", "Get TouristIDRegistry statistics")
  .addParam("contract", "The TouristIDRegistry contract address")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;

    console.log("📊 Getting DTID Registry statistics...");
    console.log("📄 Contract:", taskArgs.contract);

    // Connect to contract
    const TouristIDRegistry =
      await ethers.getContractFactory("TouristIDRegistry");
    const registry = TouristIDRegistry.attach(taskArgs.contract);

    try {
      const totalRegistered = await registry.getTotalRegistered();
      console.log("📈 Total registered subjects:", totalRegistered.toString());

      if (totalRegistered > 0) {
        console.log("\n👥 Recent registrations:");
        const maxDisplay = Math.min(Number(totalRegistered), 5);

        for (let i = 0; i < maxDisplay; i++) {
          const subject = await registry.getRegisteredSubject(BigInt(i));
          const [anchorHash, didUri, timestamp, isActive] =
            await registry.getLatest(subject);

          console.log(`  ${i + 1}. ${subject}`);
          console.log(`     Hash: ${anchorHash}`);
          console.log(`     DID: ${didUri}`);
          console.log(
            `     Date: ${new Date(Number(timestamp) * 1000).toISOString()}`
          );
          console.log(`     Active: ${isActive}`);
          console.log("");
        }

        if (totalRegistered > 5) {
          console.log(`     ... and ${Number(totalRegistered) - 5} more`);
        }
      }
    } catch (error: any) {
      console.error("❌ Failed to get statistics:", error.message);
      throw error;
    }
  });
