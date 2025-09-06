// Detailed blockchain test to isolate the exact error
require('dotenv').config({ path: './backend/.env' });
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function testBlockchainTransaction() {
  console.log('🔍 Testing blockchain transaction step by step...\n');
  
  try {
    // Test 1: Check environment variables
    console.log('1. Environment Variables:');
    console.log('   SEPOLIA_RPC_URL:', process.env.SEPOLIA_RPC_URL ? '✅ Set' : '❌ Missing');
    console.log('   PRIVATE_KEY:', process.env.PRIVATE_KEY ? '✅ Set' : '❌ Missing');
    console.log('   REGISTRY_ADDRESS:', process.env.REGISTRY_ADDRESS || '❌ Missing');
    console.log('   ENABLE_CHAIN_ANCHOR:', process.env.ENABLE_CHAIN_ANCHOR);
    console.log('');

    // Test 2: Check wallet balance
    console.log('2. Checking wallet balance...');
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const balance = await provider.getBalance(wallet.address);
    console.log('   Wallet address:', wallet.address);
    console.log('   Balance:', ethers.formatEther(balance), 'ETH');
    
    if (balance == 0n) {
      console.log('   ⚠️  WARNING: Wallet has no ETH for gas fees!');
      console.log('   This is likely the cause of blockchain transaction failures.');
      console.log('   Please get test ETH from Sepolia faucet:');
      console.log('   - https://sepoliafaucet.com/');
      console.log('   - https://www.alchemy.com/faucets/ethereum-sepolia');
      return;
    }

    // Test 3: Check network
    console.log('3. Network info:');
    const network = await provider.getNetwork();
    console.log('   Network:', network.name);
    console.log('   Chain ID:', network.chainId.toString());

    // Test 4: Load contract artifact
    console.log('4. Loading contract artifact...');
    const artifactPath = path.join(__dirname, 'blockchain', 'artifacts', 'contracts', 'TouristIDRegistry.sol', 'TouristIDRegistry.json');
    if (!fs.existsSync(artifactPath)) {
      console.log('   ❌ Contract artifact not found at:', artifactPath);
      return;
    }
    
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf-8'));
    console.log('   ✅ Contract artifact loaded:', artifact.contractName);
    console.log('   ABI functions count:', artifact.abi ? artifact.abi.length : 'No ABI found');
    
    // Debug: Show first few ABI entries
    if (artifact.abi && artifact.abi.length > 0) {
      console.log('   First ABI entry:', JSON.stringify(artifact.abi[0], null, 2));
    }

    // Test 5: Initialize contract
    console.log('5. Initializing contract...');
    const contract = new ethers.Contract(process.env.REGISTRY_ADDRESS, artifact.abi, wallet);
    console.log('   ✅ Contract initialized at:', process.env.REGISTRY_ADDRESS);

    // Test 6: Check contract methods
    console.log('6. Checking available contract methods...');
    const contractInterface = contract.interface;
    
    // In ethers v6, functions are in fragments
    const functionFragments = contractInterface.fragments.filter(f => f.type === 'function');
    const methods = functionFragments.map(f => f.name);
    
    console.log('   Available methods:', methods.join(', '));
    console.log('   registerFor available:', methods.includes('registerFor') ? '✅' : '❌');
    console.log('   register available:', methods.includes('register') ? '✅' : '❌');
    console.log('   updateFor available:', methods.includes('updateFor') ? '✅' : '❌');
    console.log('   update available:', methods.includes('update') ? '✅' : '❌');

    // Test 7: Estimate gas for a transaction
    console.log('7. Testing gas estimation...');
    const testSubject = wallet.address; // Just the wallet address, no trip ID
    const testHash = '0x1234567890123456789012345678901234567890123456789012345678901234';
    const testDidUri = 'did:test:11155111:' + wallet.address.toLowerCase() + ':trip-test';

    try {
      let gasEstimate;
      if (methods.includes('registerFor')) {
        console.log('   Trying registerFor with subject:', testSubject);
        gasEstimate = await contract.registerFor.estimateGas(testSubject, testHash, testDidUri);
        console.log('   ✅ Gas estimate for registerFor:', gasEstimate.toString());
      } else if (methods.includes('register')) {
        console.log('   Trying register method');
        gasEstimate = await contract.register.estimateGas(testHash, testDidUri);
        console.log('   ✅ Gas estimate for register:', gasEstimate.toString());
      } else {
        console.log('   ❌ No suitable register method found in contract');
        return;
      }

      const gasPrice = await provider.getFeeData();
      const estimatedCost = gasEstimate * gasPrice.gasPrice;
      console.log('   Estimated transaction cost:', ethers.formatEther(estimatedCost), 'ETH');
      
      if (balance < estimatedCost) {
        console.log('   ⚠️  WARNING: Insufficient balance for transaction!');
        console.log('   Need:', ethers.formatEther(estimatedCost), 'ETH');
        console.log('   Have:', ethers.formatEther(balance), 'ETH');
      } else {
        console.log('   ✅ Sufficient balance for transaction');
        console.log('   🎉 BLOCKCHAIN TRANSACTIONS SHOULD WORK!');
      }

    } catch (gasError) {
      console.log('   ❌ Gas estimation failed:', gasError.message);
      console.log('   Error code:', gasError.code);
      if (gasError.message.includes('ALREADY_REGISTERED')) {
        console.log('   📝 This means the test subject is already registered - normal behavior');
        console.log('   🎉 BLOCKCHAIN TRANSACTIONS SHOULD WORK FOR NEW SUBJECTS!');
      } else if (gasError.message.includes('insufficient funds')) {
        console.log('   💰 Insufficient funds for gas');
      } else if (gasError.code === 'UNCONFIGURED_NAME') {
        console.log('   🔧 Address format issue - this is the problem with blockchain transactions');
      } else {
        console.log('   🔍 Other contract method error or network issue');
      }
    }

  } catch (error) {
    console.log('❌ Blockchain test failed:', error.message);
    console.log('Error code:', error.code);
    if (error.stack) {
      console.log('Stack trace:', error.stack);
    }
  }
}

testBlockchainTransaction();
