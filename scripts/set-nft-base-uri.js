const { ethers } = require("hardhat");

const NFT_ADDRESS =
  process.env.NFT_CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;
const NEW_BASE_URI =
  process.env.NFT_BASE_URI ||
  (process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/api/nft/`
    : "http://localhost:3000/api/nft/");

const NFT_ABI = [
  "function setBaseURI(string memory baseURI) external",
  "function tokenURI(uint256 tokenId) external view returns (string)",
];

async function main() {
  if (!NFT_ADDRESS) {
    throw new Error("Set NFT_CONTRACT_ADDRESS or NEXT_PUBLIC_NFT_CONTRACT_ADDRESS");
  }
  console.log("🔗 Setting NFT base URI on Initia...");
  console.log("NFT Contract:", NFT_ADDRESS);
  console.log("New Base URI:", NEW_BASE_URI);

  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  const nft = new ethers.Contract(NFT_ADDRESS, NFT_ABI, deployer);

  const tx = await nft.setBaseURI(NEW_BASE_URI);
  console.log("Transaction:", tx.hash);
  await tx.wait();
  console.log("✅ Base URI updated to:", NEW_BASE_URI);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
