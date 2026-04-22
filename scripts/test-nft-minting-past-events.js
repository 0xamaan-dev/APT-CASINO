const hre = require("hardhat");
const { NFTMintingService } = require("../src/services/NFTMintingService");

async function main() {
  console.log("🧪 Testing NFT Minting Service with past events...\n");

  const GAME_LOGGER_ADDRESS = process.env.NEXT_PUBLIC_CREDITCOIN_GAME_LOGGER_ADDRESS;
  const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;
  const TREASURY_PRIVATE_KEY = process.env.CREDITCOIN_TREASURY_PRIVATE_KEY;

  console.log("Game Logger:", GAME_LOGGER_ADDRESS);
  console.log("NFT Contract:", NFT_CONTRACT_ADDRESS);

  // Setup provider and wallet
  const provider = hre.ethers.provider;
  const treasuryWallet = new hre.ethers.Wallet(TREASURY_PRIVATE_KEY, provider);

  console.log("Treasury:", treasuryWallet.address);

  // Create minting service
  const mintingService = new NFTMintingService(
    provider,
    NFT_CONTRACT_ADDRESS,
    treasuryWallet
  );

  // Game Logger ABI
  const GAME_LOGGER_ABI = [
    'event GameResultLogged(bytes32 indexed logId, address indexed player, uint8 gameType, uint256 betAmount, uint256 payout, bytes32 entropyRequestId, string entropyTxHash, uint256 timestamp)',
    'function updateNFTInfo(bytes32 logId, string memory nftTxHash, uint256 tokenId, string memory imagePath) external',
    'function getGameLog(bytes32 logId) external view returns (tuple(bytes32 logId, address player, uint8 gameType, uint256 betAmount, bytes resultData, uint256 payout, bytes32 entropyRequestId, string entropyTxHash, uint256 timestamp, uint256 blockNumber, string nftTxHash, uint256 nftTokenId, string nftImagePath))'
  ];

  const gameLoggerContract = new hre.ethers.Contract(
    GAME_LOGGER_ADDRESS,
    GAME_LOGGER_ABI,
    treasuryWallet
  );

  // Start listening (this will process past events)
  console.log("\n🎧 Starting event listener with past event processing...");
  await mintingService.startListening(gameLoggerContract, true, null);

  // Wait for minting to complete
  console.log("\n⏳ Waiting for minting to complete (10 seconds)...");
  await new Promise(resolve => setTimeout(resolve, 10000));

  console.log("\n✅ Test complete!");
  
  // Close service
  await mintingService.close();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
