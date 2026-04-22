const { ethers } = require("ethers");
require("dotenv").config();

async function checkTokenURI() {
    const rpcUrl = "https://rpc.cc3-testnet.creditcoin.network";
    const nftAddress = process.env.NFT_CONTRACT_ADDRESS || "0x0B61D7b981062b0dd5D95F8B6455Eca0a2C1d8C7";

    console.log("Checking NFT at:", nftAddress);
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const abi = ["function tokenURI(uint256 tokenId) external view returns (string)", "function totalSupply() external view returns (uint256)"];
    const contract = new ethers.Contract(nftAddress, abi, provider);

    try {
        const supply = await contract.totalSupply();
        console.log("Total Supply:", supply.toString());

        if (supply > 0) {
            const uri = await contract.tokenURI(1);
            console.log("Token URI for #1:", uri);

            // Try to fetch the URI
            try {
                const response = await fetch(uri);
                console.log("Metadata Status:", response.status);
                if (response.ok) {
                    const json = await response.json();
                    console.log("Metadata JSON:", JSON.stringify(json, null, 2));
                } else {
                    const text = await response.text();
                    console.log("Metadata Error Body:", text.substring(0, 200));
                }
            } catch (e) {
                console.error("Failed to fetch metadata URL:", e.message);
            }
        } else {
            console.log("No tokens minted yet.");
        }
    } catch (err) {
        console.error("Error:", err.message);
    }
}

checkTokenURI();
