import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import initiaTestnetConfig from '@/config/initiaTestnetConfig';
import { getInitiaGameLoggerAddress, getInitiaNftContractAddress } from '@/config/contracts';

/**
 * NFT Metadata API - ERC-721 compliant metadata endpoint
 * Base URL: {NEXT_PUBLIC_APP_URL}/api/nft/{tokenId}
 * Production example: https://apt-casino-initia-chi.vercel.app/api/nft/{tokenId}
 * Set NEXT_PUBLIC_APP_URL on Vercel (and NFT_BASE_URI) for canonical on-chain metadata links.
 */

const NFT_CONTRACT_ADDRESS = getInitiaNftContractAddress();
const GAME_LOGGER_ADDRESS = getInitiaGameLoggerAddress();
const INITIA_RPC_URL = initiaTestnetConfig.rpcUrls.default.http[0];

const NFT_ABI = [
  'function getTokenMetadata(uint256 tokenId) external view returns (tuple(string gameType, uint256 betAmount, string result, uint256 payout, uint256 timestamp, bytes32 logId))',
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'function tokenURI(uint256 tokenId) external view returns (string)',
];

const GAME_LOGGER_ABI = [
  'function getGameLog(bytes32 logId) external view returns (tuple(bytes32 logId, address player, uint8 gameType, uint256 betAmount, bytes resultData, uint256 payout, bytes32 entropyRequestId, string entropyTxHash, uint256 timestamp, uint256 blockNumber, string nftTxHash, uint256 nftTokenId, string nftImagePath))',
];

const GAME_COLORS = {
  ROULETTE: '#FF6B6B',
  MINES: '#4ECDC4',
  WHEEL: '#FFE66D',
  PLINKO: '#A8E6CF',
};

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { tokenId } = resolvedParams;

    if (!tokenId || isNaN(tokenId)) {
      return NextResponse.json({ error: 'Invalid token ID', received: tokenId }, { status: 400 });
    }

    if (!NFT_CONTRACT_ADDRESS) {
      return NextResponse.json({ error: 'NFT contract not configured' }, { status: 500 });
    }

    const provider = new ethers.JsonRpcProvider(INITIA_RPC_URL);
    const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);

    let metadata, owner;
    try {
      [metadata, owner] = await Promise.all([
        nftContract.getTokenMetadata(tokenId),
        nftContract.ownerOf(tokenId),
      ]);
    } catch (error) {
      if (error.message.includes('Token does not exist')) {
        return NextResponse.json({ error: 'Token does not exist' }, { status: 404 });
      }
      throw error;
    }

    const { gameType, betAmount, result, payout, timestamp, logId } = metadata;

    // Try to get image path from game logger
    let nftImagePath = '/nft/nft.png';
    if (GAME_LOGGER_ADDRESS) {
      try {
        const gameLoggerContract = new ethers.Contract(GAME_LOGGER_ADDRESS, GAME_LOGGER_ABI, provider);
        const gameLog = await gameLoggerContract.getGameLog(logId);
        if (gameLog.nftImagePath) nftImagePath = gameLog.nftImagePath;
      } catch {
        const nftImages = ['/nft/nft.png', '/nft/nft1.png', '/nft/nft2.png', '/nft/nft3.png'];
        nftImagePath = nftImages[Number(tokenId) % nftImages.length];
      }
    }

    const betAmountFormatted = ethers.formatEther(betAmount);
    const payoutFormatted = ethers.formatEther(payout);
    const isWin = payout > betAmount;
    const profit = isWin ? ethers.formatEther(payout - betAmount) : '0';

    let resultData = {};
    try { resultData = JSON.parse(result); } catch { resultData = { raw: result }; }

    const date = new Date(Number(timestamp) * 1000);
    const dateFormatted = date.toISOString().split('T')[0];
    const gameColor = GAME_COLORS[gameType] || '#95A5A6';

    const safeBaseUrl = APP_BASE_URL.replace(/\/$/, '');
    const safeImagePath = nftImagePath.startsWith('/') ? nftImagePath : `/${nftImagePath}`;
    const imageUrl = `${safeBaseUrl}${safeImagePath}`;

    const nftMetadata = {
      name: `APT Casino ${gameType} #${tokenId}`,
      description: `A collectible NFT from APT Casino representing a ${gameType} game on Initia EVM Testnet, played on ${dateFormatted}. ${isWin ? `Won ${profit} INIT!` : 'Better luck next time!'}`,
      image: imageUrl,
      image_url: imageUrl,
      external_url: `${safeBaseUrl}/profile`,
      attributes: [
        { trait_type: 'Game Type', value: gameType },
        { trait_type: 'Bet Amount (INIT)', value: betAmountFormatted, display_type: 'number' },
        { trait_type: 'Payout (INIT)', value: payoutFormatted, display_type: 'number' },
        { trait_type: 'Result', value: isWin ? 'Win' : 'Loss' },
        { trait_type: 'Profit (INIT)', value: profit, display_type: 'number' },
        { trait_type: 'Date', value: dateFormatted },
        { trait_type: 'Timestamp', value: Number(timestamp), display_type: 'date' },
        { trait_type: 'Owner', value: owner },
        { trait_type: 'Log ID', value: logId },
        { trait_type: 'Network', value: 'Initia EVM Testnet' },
      ],
      properties: {
        game_type: gameType,
        bet_amount: betAmountFormatted,
        payout: payoutFormatted,
        is_win: isWin,
        profit,
        timestamp: Number(timestamp),
        log_id: logId,
        owner,
        color: gameColor,
        network: 'initia-testnet',
        currency: 'INIT',
      },
    };

    return NextResponse.json(nftMetadata, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error fetching NFT metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NFT metadata', details: error.message },
      { status: 500 }
    );
  }
}
