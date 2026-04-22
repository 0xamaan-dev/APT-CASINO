const hre = require("hardhat");

async function main() {
  console.log("🎨 Manually minting NFT for past game...\n");

  const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;
  const GAME_LOGGER_ADDRESS = process.env.NEXT_PUBLIC_CREDITCOIN_GAME_LOGGER_ADDRESS;
  
  // The game we want to mint NFT for
  const LOG_ID = "0xf1d0dedaaf91667f548b3c8cb40b3748e4546abf3dabf0927712bec58c0d44c9";
  const PLAYER_ADDRESS = "0xcc78505FE8707a1D85229BA0E7177aE26cE0f17D";

  console.log("NFT Contract:", NFT_CONTRACT_ADDRESS);
  console.log("Game Logger:", GAME_LOGGER_ADDRESS);
  console.log("Log ID:", LOG_ID);
  console.log("Player:", PLAYER_ADDRESS);

  const [deployer] = await hre.ethers.getSigners();
  console.log("Minter:", deployer.address);

  // Get game log details
  const GAME_LOGGER_ABI = [
    'function getGameLog(bytes32 logId) external view returns (tuple(bytes32 logId, address player, uint8 gameType, uint256 betAmount, bytes resultData, uint256 payout, bytes32 entropyRequestId, string entropyTxHash, uint256 timestamp, uint256 blockNumber, string nftTxHash, uint256 nftTokenId, string nftImagePath))',
    'function updateNFTInfo(bytes32 logId, string memory nftTxHash, uint256 tokenId, string memory imagePath) external'
  ];

  const gameLogger = new hre.ethers.Contract(GAME_LOGGER_ADDRESS, GAME_LOGGER_ABI, deployer);
  const gameLog = await gameLogger.getGameLog(LOG_ID);

  console.log("\n📋 Game Details:");
  console.log("  Player:", gameLog.player);
  console.log("  Game Type:", gameLog.gameType);
  console.log("  Bet Amount:", hre.ethers.formatEther(gameLog.betAmount), "CTC");
  console.log("  Payout:", hre.ethers.formatEther(gameLog.payout), "CTC");
  console.log("  Timestamp:", new Date(Number(gameLog.timestamp) * 1000).toISOString());
  console.log("  NFT Token ID:", gameLog.nftTokenId.toString());

  if (gameLog.nftTokenId > 0) {
    console.log("\n⚠️  NFT already minted for this game (Token #" + gameLog.nftTokenId + ")");
    return;
  }

  // Mint NFT
  const NFT_ABI = [
    'function mintGameNFT(address recipient, string memory gameType, uint256 betAmount, string memory result, uint256 payout, uint256 timestamp, bytes32 logId) external returns (uint256)',
    'event NFTMinted(uint256 indexed tokenId, address indexed recipient, bytes32 indexed logId, string gameType)'
  ];

  const nftContract = new hre.ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, deployer);

  const GAME_TYPES = ['ROULETTE', 'MINES', 'WHEEL', 'PLINKO'];
  const gameTypeString = GAME_TYPES[Number(gameLog.gameType)];
  const resultString = JSON.stringify({
    gameType: gameTypeString,
    betAmount: gameLog.betAmount.toString(),
    payout: gameLog.payout.toString()
  });
  
  // Select image based on token ID for consistency
  const nftImages = ['/nft/nft.png', '/nft/nft1.png', '/nft/nft2.png', '/nft/nft3.png'];
  const imageIndex = Math.floor(Math.random() * nftImages.length);
  const nftImagePath = nftImages[imageIndex];

  console.log("\n🎨 Minting NFT...");
  console.log("  Recipient:", gameLog.player);
  console.log("  Game Type:", gameTypeString);
  console.log("  Image:", nftImagePath);

  const tx = await nftContract.mintGameNFT(
    gameLog.player,
    gameTypeString,
    gameLog.betAmount,
    resultString,
    gameLog.payout,
    gameLog.timestamp,
    LOG_ID
  );

  console.log("⏳ Transaction sent:", tx.hash);
  const receipt = await tx.wait();
  console.log("✅ NFT minted!");

  // Extract token ID from event
  const mintEvent = receipt.logs
    .map(log => {
      try {
        return nftContract.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find(event => event && event.name === 'NFTMinted');

  const tokenId = mintEvent ? mintEvent.args.tokenId.toString() : null;
  console.log("  Token ID:", tokenId);
  console.log("  Transaction:", receipt.hash);

  // Update game log with NFT info
  console.log("\n🔗 Updating game log with NFT info...");
  const updateTx = await gameLogger.updateNFTInfo(
    LOG_ID,
    receipt.hash,
    tokenId,
    nftImagePath
  );
  await updateTx.wait();
  console.log("✅ Game log updated!");

  console.log("\n🎉 Complete!");
  console.log("  View NFT on explorer:");
  console.log(`  https://creditcoin-testnet.blockscout.com/token/${NFT_CONTRACT_ADDRESS}/instance/${tokenId}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
