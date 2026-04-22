const hre = require("hardhat");

async function main() {
  console.log("🔧 Updating NFT contract base URI...\n");

  const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;
  const NEW_BASE_URI = process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/nft/`
    : "https://aptcasino.com/api/nft/";

  console.log("NFT Contract:", NFT_CONTRACT_ADDRESS);
  console.log("New Base URI:", NEW_BASE_URI);

  const NFT_ABI = [
    'function setBaseURI(string memory baseURI) external',
    'function tokenURI(uint256 tokenId) external view returns (string)',
    'function owner() external view returns (address)'
  ];

  const [deployer] = await hre.ethers.getSigners();
  const nftContract = new hre.ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, deployer);

  // Check current owner
  const owner = await nftContract.owner();
  console.log("\nContract Owner:", owner);
  console.log("Deployer:", deployer.address);

  if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
    console.error("❌ Deployer is not the contract owner!");
    return;
  }

  // Check current tokenURI for token #17
  try {
    const currentURI = await nftContract.tokenURI(17);
    console.log("\nCurrent Token URI (Token #17):", currentURI);
  } catch (error) {
    console.log("\n⚠️  Could not fetch current URI:", error.message);
  }

  // Update base URI
  console.log("\n🔄 Updating base URI...");
  
  try {
    // Estimate gas first
    const gasEstimate = await nftContract.setBaseURI.estimateGas(NEW_BASE_URI);
    console.log("Gas estimate:", gasEstimate.toString());
    
    // Add 50% buffer to gas limit
    const gasLimit = gasEstimate * BigInt(150) / BigInt(100);
    console.log("Gas limit (with buffer):", gasLimit.toString());
    
    const tx = await nftContract.setBaseURI(NEW_BASE_URI, { gasLimit });
    console.log("Transaction sent:", tx.hash);
    
    const receipt = await tx.wait();
    
    if (receipt.status === 0) {
      console.error("❌ Transaction failed!");
      console.log("Gas used:", receipt.gasUsed.toString());
      return;
    }
    
    console.log("✅ Base URI updated!");
    console.log("Gas used:", receipt.gasUsed.toString());
  } catch (error) {
    console.error("❌ Failed to update base URI:", error.message);
    return;
  }

  // Verify new URI
  try {
    const newURI = await nftContract.tokenURI(17);
    console.log("\nNew Token URI (Token #17):", newURI);
    console.log("\n🌐 Test metadata endpoint:");
    console.log(`   ${NEW_BASE_URI}17`);
  } catch (error) {
    console.log("\n⚠️  Could not fetch new URI:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
