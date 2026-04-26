import { NextResponse } from "next/server";
import { gameHistory } from "@/services/GameHistoryService.js";

export const dynamic = "force-dynamic";

/**
 * POST /api/games/save-result — persist game result with optional entropy / chain metadata.
 */
export async function POST(request) {
  try {
    if (!gameHistory.isInitialized) {
      await gameHistory.initialize();
    }

    const body = await request.json();
    const {
      vrfRequestId,
      userAddress,
      gameType,
      gameConfig,
      resultData,
      betAmount,
      payoutAmount,
      somniaTxHash,
      somniaBlockNumber,
    } = body;

    if (!userAddress || !gameType || !gameConfig || !resultData) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: userAddress, gameType, gameConfig, resultData",
        },
        { status: 400 }
      );
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return NextResponse.json(
        { success: false, error: "Invalid Ethereum address format" },
        { status: 400 }
      );
    }

    if (!["MINES", "PLINKO", "ROULETTE", "WHEEL"].includes(gameType.toUpperCase())) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid game type. Must be one of: MINES, PLINKO, ROULETTE, WHEEL",
        },
        { status: 400 }
      );
    }

    const savedGame = await gameHistory.saveGameResult({
      vrfRequestId,
      userAddress,
      gameType: gameType.toUpperCase(),
      gameConfig,
      resultData,
      betAmount: betAmount ? BigInt(betAmount) : null,
      payoutAmount: payoutAmount ? BigInt(payoutAmount) : null,
      somniaTxHash,
      somniaBlockNumber,
      network: "somnia-testnet",
    });

    let vrfDetails = null;
    if (vrfRequestId) {
      try {
        vrfDetails = await gameHistory.getVRFDetails(vrfRequestId);
      } catch (e) {
        console.warn("Could not fetch VRF details:", e.message);
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          gameResult: savedGame,
          vrfDetails,
          message: "Game result saved successfully",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Save game result API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save game result",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
