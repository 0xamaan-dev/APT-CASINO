const { ethers } = require("ethers");

// Mocking the behavior of our GET route
async function testMetadataApi(tokenId) {
    console.log(`Testing metadata for ID: ${tokenId}`);

    // Simulation of params handling
    const params = Promise.resolve({ tokenId: tokenId.toString() });
    const resolvedParams = await params;
    const tid = resolvedParams.tokenId;

    if (!tid || isNaN(tid)) {
        console.log("❌ Invalid token ID check failed");
        return;
    }

    console.log("✅ Valid token ID:", tid);

    const protocol = "http";
    const host = "localhost:3000";
    const baseUrl = "https://apt-casino-initia.vercel.app"; // Fallback (override via NEXT_PUBLIC_APP_URL)

    const safeBaseUrl = baseUrl.replace(/\/$/, '');
    const nftImagePath = "/nft/nft.png"; // Mock path
    const safeImagePath = nftImagePath.startsWith('/') ? nftImagePath : `/${nftImagePath}`;
    const imageUrl = `${safeBaseUrl}${safeImagePath}`;

    console.log("Constructed Image URL:", imageUrl);
    console.log("Is Absolute:", imageUrl.startsWith("http"));
}

testMetadataApi(1);
