const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
  console.log("🚀 Deploying Contracts to Initia EVM Testnet...");
  console.log("=".repeat(60));

  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    throw new Error("No signers available. Check your INITIA_TREASURY_PRIVATE_KEY or TREASURY_PRIVATE_KEY.");
  }

  const deployer = signers[0];
  console.log("Deploying with account:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "INIT");

  const minBalance = ethers.parseEther("0.1");
  if (balance < minBalance) {
    console.log("⚠️  WARNING: Low INIT balance! Recommended: at least 0.1 INIT");
    console.log("   Current:", ethers.formatEther(balance), "INIT");
    console.log("   Get testnet INIT from: https://app.testnet.initia.xyz/faucet");
  }

  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId.toString());
  console.log("=".repeat(60));

  if (network.chainId !== 2124225178762456n) {
    console.log("⚠️  Warning: Not on Initia EVM Testnet (expected chain ID 2124225178762456)");
    console.log("Current chain ID:", network.chainId.toString());
    console.log("Proceeding anyway...");
  }

  const deploymentResults = {
    network: "initia-testnet",
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    contracts: {},
  };

  // Deploy InitiaGameLogger
  console.log("\n📦 Deploying InitiaGameLogger...");
  const InitiaGameLogger = await ethers.getContractFactory("InitiaGameLogger");
  const gameLogger = await InitiaGameLogger.deploy();
  await gameLogger.waitForDeployment();
  const gameLoggerAddress = await gameLogger.getAddress();
  console.log("✅ InitiaGameLogger deployed to:", gameLoggerAddress);

  const deploymentTx = gameLogger.deploymentTransaction();
  const deploymentReceipt = deploymentTx ? await deploymentTx.wait() : null;

  deploymentResults.contracts.gameLogger = {
    address: gameLoggerAddress,
    transactionHash: deploymentTx?.hash,
    blockNumber: deploymentReceipt?.blockNumber,
  };

  // Verify deployment
  console.log("\n🧪 Verifying InitiaGameLogger...");
  try {
    const stats = await gameLogger.getStats();
    console.log("Stats:", {
      totalGames: stats.totalGames.toString(),
      totalBets: ethers.formatEther(stats.totalBets),
      totalPayouts: ethers.formatEther(stats.totalPayouts),
    });

    const isAuthorized = await gameLogger.isAuthorizedLogger(deployer.address);
    console.log("Deployer is authorized logger:", isAuthorized);
    console.log("✅ Verification passed");
  } catch (error) {
    console.log("❌ Verification failed:", error.message);
  }

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("\nNetwork Information:");
  console.log("  Network: Initia EVM Testnet");
  console.log("  Chain ID: 2124225178762456");
  console.log("  Deployer:", deployer.address);
  console.log("  Explorer: https://explorer-evm-1.anvil.asia-southeast.initia.xyz");
  console.log("\nDeployed Contracts:");
  console.log("  InitiaGameLogger:", gameLoggerAddress);
  console.log("\nNext Steps:");
  console.log("  1. Update .env with:");
  console.log(`     NEXT_PUBLIC_INITIA_GAME_LOGGER_ADDRESS=${gameLoggerAddress}`);
  console.log(`     NEXT_PUBLIC_CREDITCOIN_GAME_LOGGER_ADDRESS=${gameLoggerAddress}`);
  console.log("  2. View on explorer:");
  console.log(`     https://explorer-evm-1.anvil.asia-southeast.initia.xyz/address/${gameLoggerAddress}`);
  console.log("  3. Authorize treasury address to log games");
  console.log("=".repeat(60));

  // Save deployment info
  const deploymentsDir = './deployments';
  if (!fs.existsSync(deploymentsDir)) fs.mkdirSync(deploymentsDir);

  const filename = `${deploymentsDir}/initia-contracts-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(deploymentResults, null, 2));
  console.log("\n💾 Deployment info saved to:", filename);

  const envUpdate = `
# Initia EVM Testnet Contract Addresses (deployed ${new Date().toISOString()})
NEXT_PUBLIC_INITIA_GAME_LOGGER_ADDRESS=${gameLoggerAddress}
NEXT_PUBLIC_CREDITCOIN_GAME_LOGGER_ADDRESS=${gameLoggerAddress}
`;
  fs.writeFileSync(`${deploymentsDir}/initia-env-update.txt`, envUpdate.trim());
  console.log("📝 Environment variable updates saved to:", `${deploymentsDir}/initia-env-update.txt`);

  console.log("\n🎉 Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
