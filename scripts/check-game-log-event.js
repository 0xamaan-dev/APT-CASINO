const hre = require("hardhat");

async function main() {
  console.log("🔍 Checking GameResultLogged event...\n");

  const GAME_LOGGER_ADDRESS = process.env.NEXT_PUBLIC_CREDITCOIN_GAME_LOGGER_ADDRESS;
  const TX_HASH = "0x622b6aff25098fe8b9a4334fe456aeb3a632b1ad3312835937f1502a3d87d876";

  console.log("Game Logger Address:", GAME_LOGGER_ADDRESS);
  console.log("Transaction Hash:", TX_HASH);

  const provider = hre.ethers.provider;

  // Get transaction receipt
  const receipt = await provider.getTransactionReceipt(TX_HASH);
  
  if (!receipt) {
    console.error("❌ Transaction not found");
    return;
  }

  console.log("\n📋 Transaction Details:");
  console.log("  Block Number:", receipt.blockNumber);
  console.log("  Status:", receipt.status === 1 ? "✅ Success" : "❌ Failed");
  console.log("  Logs Count:", receipt.logs.length);

  // Game Logger ABI
  const GAME_LOGGER_ABI = [
    'event GameResultLogged(bytes32 indexed logId, address indexed player, uint8 gameType, uint256 betAmount, uint256 payout, bytes32 entropyRequestId, string entropyTxHash, uint256 timestamp)'
  ];

  const gameLogger = new hre.ethers.Contract(GAME_LOGGER_ADDRESS, GAME_LOGGER_ABI, provider);

  console.log("\n📝 Parsing logs...");
  
  for (let i = 0; i < receipt.logs.length; i++) {
    const log = receipt.logs[i];
    console.log(`\nLog ${i}:`);
    console.log("  Address:", log.address);
    console.log("  Topics:", log.topics);
    
    try {
      const parsedLog = gameLogger.interface.parseLog(log);
      if (parsedLog && parsedLog.name === 'GameResultLogged') {
        console.log("\n✅ Found GameResultLogged event!");
        console.log("  Log ID:", parsedLog.args.logId);
        console.log("  Player:", parsedLog.args.player);
        console.log("  Game Type:", parsedLog.args.gameType);
        console.log("  Bet Amount:", hre.ethers.formatEther(parsedLog.args.betAmount), "CTC");
        console.log("  Payout:", hre.ethers.formatEther(parsedLog.args.payout), "CTC");
        console.log("  Entropy Request ID:", parsedLog.args.entropyRequestId);
        console.log("  Entropy TX Hash:", parsedLog.args.entropyTxHash);
        console.log("  Timestamp:", new Date(Number(parsedLog.args.timestamp) * 1000).toISOString());
      }
    } catch (error) {
      console.log("  ⚠️ Could not parse log:", error.message);
    }
  }

  // Check if NFT was minted
  console.log("\n🎨 Checking for NFT mint...");
  const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;
  
  if (NFT_CONTRACT_ADDRESS) {
    const NFT_ABI = [
      'event NFTMinted(uint256 indexed tokenId, address indexed recipient, bytes32 indexed logId, string gameType)',
      'function balanceOf(address owner) external view returns (uint256)'
    ];
    
    const nftContract = new hre.ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);
    
    // Get player address from the event
    const parsedLog = receipt.logs
      .map(log => {
        try {
          return gameLogger.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find(log => log && log.name === 'GameResultLogged');
    
    if (parsedLog) {
      const playerAddress = parsedLog.args.player;
      const balance = await nftContract.balanceOf(playerAddress);
      console.log(`  Player ${playerAddress} has ${balance} NFTs`);
      
      if (balance === 0n) {
        console.log("  ❌ No NFT minted yet for this player");
      } else {
        console.log("  ✅ Player has NFTs");
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
