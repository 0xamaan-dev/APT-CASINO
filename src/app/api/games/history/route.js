import { NextResponse } from "next/server";
import { GameHistoryService } from "@/services/GameHistoryService";

export const dynamic = "force-dynamic";

/**
 * GET /api/games/history — game history for a user (Supabase / DB).
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userAddress = searchParams.get("userAddress");
  const gameType = searchParams.get("gameType");
  const limit = searchParams.get("limit") || "50";
  const offset = searchParams.get("offset") || "0";
  const includeVrfDetails = searchParams.get("includeVrfDetails") || "false";

  if (!userAddress) {
    return NextResponse.json(
      { success: false, error: "Missing required parameter: userAddress" },
      { status: 400 }
    );
  }

  const validGameTypes = ["ROULETTE", "MINES", "PLINKO", "WHEEL"];
  if (gameType && !validGameTypes.includes(gameType.toUpperCase())) {
    return NextResponse.json(
      {
        success: false,
        error: `Invalid game type. Must be one of: ${validGameTypes.join(", ")}`,
      },
      { status: 400 }
    );
  }

  const limitNum = Math.min(parseInt(limit, 10) || 50, 100);
  const offsetNum = parseInt(offset, 10) || 0;
  const includeVrf = includeVrfDetails === "true";

  try {
    const gameHistoryService = new GameHistoryService();
    const queryOptions = {
      userAddress,
      gameType: gameType ? gameType.toUpperCase() : null,
      limit: limitNum,
      offset: offsetNum,
      includeVrfDetails: includeVrf,
      orderBy: "createdAt",
      orderDirection: "DESC",
    };

    const historyResult = await gameHistoryService.getUserGameHistory(queryOptions);

    if (!historyResult.success) {
      throw new Error(historyResult.error || "Failed to fetch game history");
    }

    const games = historyResult.data.games || [];
    const summary = {
      totalGames: games.length,
      totalWins: games.filter((game) => game.isWin).length,
      totalLosses: games.filter((game) => !game.isWin).length,
      totalBetAmount: games.reduce((sum, game) => sum + parseFloat(game.betAmount || 0), 0),
      totalPayoutAmount: games.reduce((sum, game) => sum + parseFloat(game.payoutAmount || 0), 0),
      totalProfitLoss: games.reduce((sum, game) => sum + parseFloat(game.profitLoss || 0), 0),
      winRate:
        games.length > 0
          ? ((games.filter((game) => game.isWin).length / games.length) * 100).toFixed(2)
          : 0,
    };

    const gameTypeStats = {};
    if (!gameType) {
      validGameTypes.forEach((type) => {
        const typeGames = games.filter((game) => game.gameType === type);
        gameTypeStats[type] = {
          count: typeGames.length,
          wins: typeGames.filter((game) => game.isWin).length,
          losses: typeGames.filter((game) => !game.isWin).length,
          totalBet: typeGames.reduce((sum, game) => sum + parseFloat(game.betAmount || 0), 0),
          totalPayout: typeGames.reduce((sum, game) => sum + parseFloat(game.payoutAmount || 0), 0),
          profitLoss: typeGames.reduce((sum, game) => sum + parseFloat(game.profitLoss || 0), 0),
        };
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        games,
        summary,
        gameTypeStats: Object.keys(gameTypeStats).length > 0 ? gameTypeStats : null,
        pagination: {
          limit: limitNum,
          offset: offsetNum,
          hasMore: games.length === limitNum,
        },
        filters: {
          userAddress,
          gameType: gameType || null,
          includeVrfDetails: includeVrf,
        },
      },
      message: `Retrieved ${games.length} game records`,
    });
  } catch (error) {
    console.error("Game history fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error while fetching game history",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
