const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Chain Legends Contracts to Etherlink...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  try {
    // Deploy using the deployer contract for atomic deployment
    console.log("\n📝 Deploying ChainLegendsDeployer...");
    const ChainLegendsDeployer = await ethers.getContractFactory("ChainLegendsDeployer");
    const deployerContract = await ChainLegendsDeployer.deploy();
    await deployerContract.deployed();
    
    console.log("✅ ChainLegendsDeployer deployed to:", deployerContract.address);
    
    // Get deployed contract addresses
    const deployedContracts = await deployerContract.getDeployedContracts();
    
    console.log("\n🎉 All contracts deployed successfully!");
    console.log("📋 Contract Addresses:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🏗️  Deployer Contract:  ", deployerContract.address);
    console.log("👤 Fighter NFT:         ", deployedContracts.fighterContract);
    console.log("🪙 LEGEND Token:        ", deployedContracts.legendToken);
    console.log("⚔️  Battle Arena:        ", deployedContracts.battleArena);
    console.log("🏆 Tournament:          ", deployedContracts.tournament);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    // Save deployment info to file
    const deploymentInfo = {
      network: "etherlink-testnet",
      chainId: 128123,
      deployer: deployer.address,
      deployedAt: new Date().toISOString(),
      contracts: {
        deployer: deployerContract.address,
        fighterNFT: deployedContracts.fighterContract,
        legendToken: deployedContracts.legendToken,
        battleArena: deployedContracts.battleArena,
        tournament: deployedContracts.tournament
      },
      transactions: {
        deployerTx: deployerContract.deployTransaction.hash
      }
    };
    
    const fs = require('fs');
    fs.writeFileSync(
      'deployment-info.json', 
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("\n💾 Deployment info saved to deployment-info.json");
    
    // Instructions for frontend integration
    console.log("\n🔧 Frontend Integration:");
    console.log("Update your /lib/contracts.ts file with these addresses:");
    console.log(`
export const CONTRACT_ADDRESSES = {
  FIGHTER_NFT: '${deployedContracts.fighterContract}',
  BATTLE_ARENA: '${deployedContracts.battleArena}',
  GAME_TOKEN: '${deployedContracts.legendToken}',
  TOURNAMENT: '${deployedContracts.tournament}',
} as const
    `);
    
    console.log("\n🎮 Next Steps:");
    console.log("1. Update CONTRACT_ADDRESSES in your frontend");
    console.log("2. Test minting fighters on the blockchain");
    console.log("3. Create your first blockchain battle!");
    console.log("4. Set up tournaments with real prizes");
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
