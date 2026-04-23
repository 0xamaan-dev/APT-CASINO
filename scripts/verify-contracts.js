const hre = require("hardhat");

async function main() {
  console.log("Starting contract verification on CreditCoin Testnet...\n");

  // Contract addresses from deployment
  const NFT_CONTRACT_ADDRESS = "0x0B61D7b981062b0dd5D95F8B6455Eca0a2C1d8C7";
  const GAME_LOGGER_ADDRESS = "0x29636e175Af3C60c216E1e2998403D4f8EfEa7b1";
  
  // Constructor arguments
  const NFT_BASE_URI = "https://aptcasino.com/nft/";

  try {
    // Verify APTCasinoNFT
    console.log("Verifying APTCasinoNFT at:", NFT_CONTRACT_ADDRESS);
    console.log("Constructor args:", [NFT_BASE_URI]);
    
    await hre.run("verify:verify", {
      address: NFT_CONTRACT_ADDRESS,
      constructorArguments: [NFT_BASE_URI],
      contract: "contracts/APTCasinoNFT.sol:APTCasinoNFT"
    });
    
    console.log("✅ APTCasinoNFT verified successfully!\n");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ APTCasinoNFT already verified\n");
    } else {
      console.error("❌ Error verifying APTCasinoNFT:", error.message, "\n");
    }
  }

  try {
    // Verify CreditCoinGameLogger (no constructor arguments)
    console.log("Verifying CreditCoinGameLogger at:", GAME_LOGGER_ADDRESS);
    console.log("Constructor args: []");
    
    await hre.run("verify:verify", {
      address: GAME_LOGGER_ADDRESS,
      constructorArguments: [],
      contract: "contracts/CreditCoinGameLogger.sol:CreditCoinGameLogger"
    });
    
    console.log("✅ CreditCoinGameLogger verified successfully!\n");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ CreditCoinGameLogger already verified\n");
    } else {
      console.error("❌ Error verifying CreditCoinGameLogger:", error.message, "\n");
    }
  }

  console.log("\n=== Verification Complete ===");
  console.log("\nView contracts on explorer:");
  console.log(`NFT Contract: https://creditcoin-testnet.blockscout.com/address/${NFT_CONTRACT_ADDRESS}`);
  console.log(`Game Logger: https://creditcoin-testnet.blockscout.com/address/${GAME_LOGGER_ADDRESS}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
