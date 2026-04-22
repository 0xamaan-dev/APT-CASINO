const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Upgrading CreditCoinGameLogger with player address parameter...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "CTC\n");

  // Deploy new version of the contract
  console.log("📝 Deploying new CreditCoinGameLogger...");
  const CreditCoinGameLogger = await hre.ethers.getContractFactory("CreditCoinGameLogger");
  const gameLogger = await CreditCoinGameLogger.deploy();
  await gameLogger.waitForDeployment();

  const gameLoggerAddress = await gameLogger.getAddress();
  console.log("✅ New CreditCoinGameLogger deployed to:", gameLoggerAddress);

  // Authorize treasury as logger
  console.log("\n🔐 Authorizing treasury as logger...");
  const treasuryAddress = deployer.address;
  const authTx = await gameLogger.addAuthorizedLogger(treasuryAddress);
  await authTx.wait();
  console.log("✅ Treasury authorized:", treasuryAddress);

  // Test the new contract with player parameter
  console.log("\n🧪 Testing new contract with player parameter...");
  const testPlayer = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1".toLowerCase(); // Example player address
  const testBetAmount = hre.ethers.parseEther("0.1");
  const testPayoutAmount = hre.ethers.parseEther("0.2");
  const testResultData = hre.ethers.toUtf8Bytes("test_result");
  const testEntropyRequestId = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("test_entropy_" + Date.now()));
  const testEntropyTxHash = "0x" + "a".repeat(64);

  const logTx = await gameLogger.logGameResult(
    testPlayer, // NEW: Player address parameter
    0, // GameType.ROULETTE
    testBetAmount,
    testResultData,
    testPayoutAmount,
    testEntropyRequestId,
    testEntropyTxHash
  );

  const receipt = await logTx.wait();
  console.log("✅ Test game logged successfully");
  console.log("   Transaction hash:", receipt.hash);

  // Extract logId from event
  const event = receipt.logs
    .map(log => {
      try {
        return gameLogger.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find(e => e && e.name === 'GameResultLogged');

  if (event) {
    const logId = event.args.logId;
    const player = event.args.player;
    console.log("   Log ID:", logId);
    console.log("   Player:", player);
    console.log("   ✅ Player address correctly recorded:", player === testPlayer);
  }

  // Save deployment info
  const deploymentInfo = {
    network: "creditcoin-testnet",
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    contracts: {
      gameLogger: {
        address: gameLoggerAddress,
        transactionHash: gameLogger.deploymentTransaction().hash,
        blockNumber: receipt.blockNumber,
        version: "v2-with-player-param",
        changes: [
          "Added player address parameter to logGameResult function",
          "Player address now correctly recorded instead of msg.sender",
          "NFTs will now be minted to actual player addresses"
        ]
      }
    }
  };

  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `creditcoin-logger-player-upgrade-${Date.now()}.json`;
  const filepath = path.join(deploymentsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Deployment info saved to:", filename);

  console.log("\n" + "=".repeat(60));
  console.log("🎉 UPGRADE COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n📋 NEXT STEPS:");
  console.log("1. Update .env file with new contract address:");
  console.log(`   NEXT_PUBLIC_CREDITCOIN_GAME_LOGGER_ADDRESS=${gameLoggerAddress}`);
  console.log(`   CREDITCOIN_GAME_LOGGER_ADDRESS=${gameLoggerAddress}`);
  console.log("\n2. Verify the contract:");
  console.log(`   npx hardhat verify --network creditcoin-testnet ${gameLoggerAddress}`);
  console.log("\n3. Update all services to pass player address parameter");
  console.log("\n4. Test NFT minting to player addresses");
  console.log("\n🔗 View on explorer:");
  console.log(`   https://creditcoin-testnet.blockscout.com/address/${gameLoggerAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
