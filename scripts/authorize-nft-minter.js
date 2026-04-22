const { ethers } = require("hardhat");

const NFT_ADDRESS = "0x737165fE3834e07E0b053900BcE3C18Add9F2c7D";
const TREASURY_ADDRESS = "0x6E932AD4F0E99E0e49059149C035194cc352BE52";

const NFT_ABI = [
  "function authorizeMinter(address minter) external",
  "function authorizedMinters(address) external view returns (bool)",
  "function owner() external view returns (address)",
];

async function main() {
  console.log("🔐 Authorizing treasury as NFT minter on Initia...");

  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  const nft = new ethers.Contract(NFT_ADDRESS, NFT_ABI, deployer);

  const isAlreadyMinter = await nft.authorizedMinters(TREASURY_ADDRESS);
  if (isAlreadyMinter) {
    console.log("✅ Treasury is already authorized minter");
    return;
  }

  const tx = await nft.authorizeMinter(TREASURY_ADDRESS);
  console.log("Transaction:", tx.hash);
  await tx.wait();
  console.log("✅ Treasury authorized as minter:", TREASURY_ADDRESS);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
