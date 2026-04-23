import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { TREASURY_CONFIG } from '@/config/treasury';
import initiaTestnetConfig from '@/config/initiaTestnetConfig';
import { getMintingService } from '@/services/nftMintingServiceInstance';

/**
 * Game Logging API - Initia EVM Testnet
 *
 * Randomness from Pyth Entropy (server-side); game logs on Initia EVM Testnet.
 *
 * NFT MINTING: Happens asynchronously after successful game logging.
 */

const TREASURY_PRIVATE_KEY = TREASURY_CONFIG.PRIVATE_KEY;
const GAME_LOGGER_ADDRESS = process.env.NEXT_PUBLIC_INITIA_GAME_LOGGER_ADDRESS;
const INITIA_RPC_URL = initiaTestnetConfig.rpcUrls.default.http[0];

const GAME_LOGGER_ABI = [
  'function logGameResult(address player, uint8 gameType, uint256 betAmount, bytes memory resultData, uint256 payout, bytes32 entropyRequestId, string memory entropyTxHash) external returns (bytes32 logId)',
  'function isAuthorizedLogger(address logger) external view returns (bool)',
  'event GameResultLogged(bytes32 indexed logId, address indexed player, uint8 gameType, uint256 betAmount, uint256 payout, bytes32 entropyRequestId, string entropyTxHash, uint256 timestamp)',
];

const GAME_TYPES = { ROULETTE: 0, MINES: 1, WHEEL: 2, PLINKO: 3 };

const provider = new ethers.JsonRpcProvider(INITIA_RPC_URL);
const treasuryWallet = TREASURY_PRIVATE_KEY
  ? new ethers.Wallet(TREASURY_PRIVATE_KEY, provider)
  : null;

export async function POST(request) {
  try {
    const { gameType, playerAddress, betAmount, result, payout, entropyProof } = await request.json();

    if (!gameType || !playerAddress || betAmount === undefined || payout === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!treasuryWallet) {
      return NextResponse.json({ error: 'Treasury not configured' }, { status: 500 });
    }

    if (!GAME_LOGGER_ADDRESS || GAME_LOGGER_ADDRESS === '0x0000000000000000000000000000000000000000') {
      return NextResponse.json({ error: 'Initia Game Logger contract not configured' }, { status: 500 });
    }

    const gameTypeEnum = GAME_TYPES[gameType.toUpperCase()];
    if (gameTypeEnum === undefined) {
      return NextResponse.json({ error: `Invalid game type: ${gameType}` }, { status: 400 });
    }

    const gameLogger = new ethers.Contract(GAME_LOGGER_ADDRESS, GAME_LOGGER_ABI, treasuryWallet);

    const isAuthorized = await gameLogger.isAuthorizedLogger(treasuryWallet.address);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Treasury not authorized' }, { status: 403 });
    }

    const betAmountWei = ethers.parseEther(betAmount.toString());
    const payoutWei = ethers.parseEther(payout.toString());
    const resultData = ethers.toUtf8Bytes(JSON.stringify(result || {}));
    const entropyRequestId = entropyProof?.requestId || entropyProof?.sequenceNumber || ethers.ZeroHash;
    const entropyTxHash = entropyProof?.transactionHash || '';

    let gasEstimate;
    try {
      gasEstimate = await gameLogger.logGameResult.estimateGas(
        playerAddress, gameTypeEnum, betAmountWei, resultData, payoutWei, entropyRequestId, entropyTxHash
      );
    } catch (estimateError) {
      return NextResponse.json({ error: 'Contract call would fail: ' + estimateError.message }, { status: 400 });
    }

    const tx = await gameLogger.logGameResult(
      playerAddress,
      gameTypeEnum,
      betAmountWei,
      resultData,
      payoutWei,
      entropyRequestId,
      entropyTxHash,
      { gasLimit: gasEstimate * BigInt(120) / BigInt(100) }
    );

    const receipt = await tx.wait();

    try {
      await getMintingService();
    } catch (mintingError) {
      console.error('⚠️ NFT minting service initialization failed:', mintingError.message);
    }

    return NextResponse.json({
      success: true,
      transactionHash: receipt.hash,
      initiaTxHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      entropyTxHash,
      arbitrumSepoliaTxHash: entropyTxHash,
      gameType,
      playerAddress,
      betAmount,
      payout,
      gameLogNetwork: 'initia-testnet',
      entropyNetwork: 'arbitrum-sepolia',
    });
  } catch (error) {
    console.error('❌ Game logging error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
