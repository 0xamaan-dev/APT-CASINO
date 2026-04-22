const hre = require("hardhat");

async function main() {
  console.log("🔍 Checking NFT contract authorization...\n");

  const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;
  const TREASURY_ADDRESS = process.env.CREDITCOIN_TREASURY_ADDRESS;

  console.log("NFT Contract:", NFT_CONTRACT_ADDRESS);
  console.log("Treasury:", TREASURY_ADDRESS);

  const NFT_ABI = [
    'function authorizedMinters(address) external view returns (bool)',
    'function owner() external view returns (address)',
    'function authorizeMinter(address minter) external'
  ];

  const [deployer] = await hre.ethers.getSigners();
  const nftContract = new hre.ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, deployer);

  // Check owner
  const owner = await nftContract.owner();
  console.log("\n📋 Contract Info:");
  console.log("  Owner:", owner);
  console.log("  Deployer:", deployer.address);
  console.log("  Is deployer owner?", owner.toLowerCase() === deployer.address.toLowerCase());

  // Check if treasury is authorized
  const isAuthorized = await nftContract.authorizedMinters(TREASURY_ADDRESS);
  console.log("\n🔐 Authorization Status:");
  console.log("  Treasury authorized?", isAuthorized);

  if (!isAuthorized) {
    console.log("\n⚠️  Treasury is NOT authorized to mint!");
    console.log("   Authorizing now...");
    
    const tx = await nftContract.authorizeMinter(TREASURY_ADDRESS);
    await tx.wait();
    
    console.log("✅ Treasury authorized!");
    
    // Verify
    const isNowAuthorized = await nftContract.authorizedMinters(TREASURY_ADDRESS);
    console.log("   Verification:", isNowAuthorized ? "✅ Success" : "❌ Failed");
  } else {
    console.log("✅ Treasury is already authorized to mint NFTs");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
