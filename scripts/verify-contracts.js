const hre = require("hardhat");

/** Initia EVM testnet `evm-1` — see README / `.env.example`. */
const NFT_CONTRACT_ADDRESS = "0x737165fE3834e07E0b053900BcE3C18Add9F2c7D";
const GAME_LOGGER_ADDRESS = "0xcB559740E47eed913fDa1fFCecAd0D694dfA6271";

const INITIA_SCAN = "https://scan.testnet.initia.xyz/evm-1";

async function main() {
  console.log("Starting contract verification on Initia EVM testnet (evm-1)...\n");

  const NFT_BASE_URI =
    process.env.NFT_BASE_URI || "https://apt-casino-initia.vercel.app/api/nft/";

  try {
    console.log("Verifying APTCasinoNFT at:", NFT_CONTRACT_ADDRESS);
    console.log("Constructor args:", [NFT_BASE_URI]);

    await hre.run("verify:verify", {
      address: NFT_CONTRACT_ADDRESS,
      constructorArguments: [NFT_BASE_URI],
      contract: "contracts/APTCasinoNFT.sol:APTCasinoNFT",
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
    console.log("Verifying InitiaGameLogger at:", GAME_LOGGER_ADDRESS);
    console.log("Constructor args: []");

    await hre.run("verify:verify", {
      address: GAME_LOGGER_ADDRESS,
      constructorArguments: [],
      contract: "contracts/InitiaGameLogger.sol:InitiaGameLogger",
    });

    console.log("✅ InitiaGameLogger verified successfully!\n");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ InitiaGameLogger already verified\n");
    } else {
      console.error("❌ Error verifying InitiaGameLogger:", error.message, "\n");
    }
  }

  console.log("\n=== Verification Complete ===");
  console.log("\nView contracts on Initia Scan:");
  console.log(`NFT collection: ${INITIA_SCAN}/nft-collections/${NFT_CONTRACT_ADDRESS}`);
  console.log(`Game logger: ${INITIA_SCAN}/evm-contracts/${GAME_LOGGER_ADDRESS}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
