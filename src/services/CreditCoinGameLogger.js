import { ethers } from 'ethers';
import initiaTestnetConfig, { getInitiaExplorerTxUrl } from '../config/initiaTestnetConfig';
import { getInitiaGameLoggerAddress } from '../config/contracts';

/**
 * Initia Game Logger Service
 *
 * Handles game logging on Initia EVM Testnet.
 * Randomness from Pyth Entropy (server-side); logs and balances use Initia EVM Testnet.
 */

const GAME_LOGGER_ABI = [
  'event GameResultLogged(bytes32 indexed logId, address indexed player, uint8 gameType, uint256 betAmount, uint256 payout, bytes32 entropyRequestId, string entropyTxHash, uint256 timestamp)',
  'event NFTMinted(bytes32 indexed logId, address indexed player, uint256 indexed tokenId, string nftTxHash, string imagePath)',
  'function logGameResult(address player, uint8 gameType, uint256 betAmount, bytes memory resultData, uint256 payout, bytes32 entropyRequestId, string memory entropyTxHash) external returns (bytes32 logId)',
  'function getGameLog(bytes32 logId) external view returns (tuple(bytes32 logId, address player, uint8 gameType, uint256 betAmount, bytes resultData, uint256 payout, bytes32 entropyRequestId, string entropyTxHash, uint256 timestamp, uint256 blockNumber, string nftTxHash, uint256 nftTokenId, string nftImagePath))',
  'function getPlayerHistory(address player, uint256 limit) external view returns (bytes32[] memory)',
  'function getLogsByGameType(uint8 gameType, uint256 limit) external view returns (bytes32[] memory)',
  'function getPlayerGameCount(address player) external view returns (uint256)',
  'function getTotalLogs() external view returns (uint256)',
  'function getStats() external view returns (uint256 totalGames, uint256 totalBets, uint256 totalPayouts, uint256 rouletteCount, uint256 minesCount, uint256 wheelCount, uint256 plinkoCount)',
  'function updateNFTInfo(bytes32 logId, string memory nftTxHash, uint256 tokenId, string memory imagePath) external',
  'function isAuthorizedLogger(address logger) external view returns (bool)',
];

const GAME_TYPES = {
  ROULETTE: 0,
  MINES: 1,
  WHEEL: 2,
  PLINKO: 3,
};

const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 4000,
};

export class InitiaGameLogger {
  constructor(provider = null, signer = null) {
    this.provider = provider;
    this.signer = signer;
    this.contract = null;
    this.contractAddress = getInitiaGameLoggerAddress();
    this.explorerUrl = initiaTestnetConfig.blockExplorers.default.url;

    if (this.provider && this.contractAddress) {
      this.initializeContract();
    }
  }

  initializeContract() {
    try {
      if (!this.contractAddress || this.contractAddress === '0x0000000000000000000000000000000000000000') {
        console.warn('⚠️ Initia Game Logger contract address not configured');
        return;
      }
      const signerOrProvider = this.signer || this.provider;
      this.contract = new ethers.Contract(this.contractAddress, GAME_LOGGER_ABI, signerOrProvider);
      console.log('✅ Initia Game Logger initialized:', this.contractAddress);
    } catch (error) {
      console.error('❌ Failed to initialize Initia Game Logger contract:', error);
      throw error;
    }
  }

  setProviderAndSigner(provider, signer) {
    this.provider = provider;
    this.signer = signer;
    this.initializeContract();
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async logGameResult(gameData) {
    let lastError;
    for (let attempt = 1; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
      try {
        return await this._logGameResultAttempt(gameData);
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Game logging attempt ${attempt} failed:`, error.message);
        if (attempt < RETRY_CONFIG.maxRetries) {
          const delay = Math.min(
            RETRY_CONFIG.baseDelay * Math.pow(2, attempt - 1),
            RETRY_CONFIG.maxDelay
          );
          await this.sleep(delay);
        }
      }
    }
    throw new Error(`Game logging failed after ${RETRY_CONFIG.maxRetries} attempts: ${lastError.message}`);
  }

  async _logGameResultAttempt(gameData) {
    if (!this.contract) throw new Error('Initia Game Logger contract not initialized');
    if (!this.signer) throw new Error('Signer required to log game results');

    const { gameType, playerAddress, betAmount, result, payout, entropyProof } = gameData;
    this.validateGameData(gameData);

    const gameTypeEnum = GAME_TYPES[gameType.toUpperCase()];
    if (gameTypeEnum === undefined) throw new Error(`Invalid game type: ${gameType}`);

    const resultData = this.encodeResultData(result);
    const betAmountWei = ethers.parseEther(betAmount.toString());
    const payoutWei = ethers.parseEther(payout.toString());
    const entropyRequestId = entropyProof?.requestId || entropyProof?.sequenceNumber || ethers.ZeroHash;
    const entropyTxHash = entropyProof?.transactionHash || '';

    const tx = await this.contract.logGameResult(
      playerAddress,
      gameTypeEnum,
      betAmountWei,
      resultData,
      payoutWei,
      entropyRequestId,
      entropyTxHash
    );

    const receipt = await tx.wait();

    return {
      transactionHash: receipt.hash,
      initiaTxHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      entropyTxHash,
      arbitrumSepoliaTxHash: entropyTxHash,
      gameLogNetwork: 'initia-testnet',
      entropyNetwork: 'arbitrum-sepolia',
    };
  }

  async getGameLog(logId) {
    try {
      if (!this.contract) throw new Error('Initia Game Logger contract not initialized');
      const log = await this.contract.getGameLog(logId);
      const decodedResult = this.decodeResultData(log.resultData);
      const gameType = this.getGameTypeName(log.gameType);
      const toSafeNumber = (value) => {
        if (typeof value === 'number') {
          return Number.isFinite(value) ? value : 0;
        }
        if (typeof value === 'bigint') {
          return Number(value);
        }
        if (typeof value === 'string') {
          const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''));
          return Number.isFinite(parsed) ? parsed : 0;
        }
        if (value && typeof value === 'object') {
          if ('multiplier' in value) return toSafeNumber(value.multiplier);
          if ('currentMultiplier' in value) return toSafeNumber(value.currentMultiplier);
          if ('value' in value) return toSafeNumber(value.value);
        }
        const parsed = parseFloat(value ?? 0);
        return Number.isFinite(parsed) ? parsed : 0;
      };

      let details = null;
      let betType = gameType;
      let multiplier = '0.00x';
      let title = gameType;

      if (decodedResult) {
        if (gameType === 'ROULETTE' && decodedResult.bets) {
          betType = `Multiple Bets (${decodedResult.bets.length})`;
          title = betType;
          details = {
            winningBets: decodedResult.winningBets?.map((b) => `${b.name || 'Bet'}: ${b.amount} × ${b.multiplier}x`) || [],
            losingBets: decodedResult.losingBets?.map((b) => `${b.name || 'Bet'}: -${b.amount}`) || [],
          };
          multiplier =
            toSafeNumber(decodedResult.netResult) > 0
              ? (toSafeNumber(decodedResult.netResult) / parseFloat(ethers.formatEther(log.betAmount))).toFixed(2) + 'x'
              : '0.00x';
        } else if (gameType === 'MINES') {
          betType = `Mines: ${decodedResult.minePositions?.length || 0}`;
          title = betType;
          details = { revealed: decodedResult.revealedPositions?.length || 0, hitMine: decodedResult.hitMine || false };
          multiplier = toSafeNumber(decodedResult.currentMultiplier).toFixed(2) + 'x';
        } else if (gameType === 'WHEEL' || gameType === 'PLINKO') {
          multiplier = toSafeNumber(decodedResult.multiplier).toFixed(2) + 'x';
          title = `${gameType} Game`;
        }
      }

      const payout = ethers.formatEther(log.payout);
      const betAmount = ethers.formatEther(log.betAmount);

      return {
        id: log.logId,
        logId: log.logId,
        player: log.player,
        gameType,
        game: gameType.toLowerCase(),
        betType,
        title,
        betAmount,
        bet: `${betAmount} INIT`,
        amount: parseFloat(betAmount),
        resultData: log.resultData,
        result: decodedResult,
        details,
        winningNumber:
          decodedResult?.winningNumber !== undefined
            ? decodedResult.winningNumber
            : decodedResult?.result !== undefined
            ? decodedResult.result
            : null,
        payout,
        payoutAmount: parseFloat(payout),
        multiplier,
        win: parseFloat(payout) > 0,
        outcome: parseFloat(payout) > 0 ? 'win' : 'loss',
        entropyRequestId: log.entropyRequestId,
        entropyTxHash: log.entropyTxHash,
        timestamp: Number(log.timestamp) * 1000,
        time: new Date(Number(log.timestamp) * 1000).toLocaleString(),
        blockNumber: Number(log.blockNumber),
        nftTxHash: log.nftTxHash && log.nftTxHash !== ethers.ZeroHash ? log.nftTxHash : null,
        nftTokenId: log.nftTokenId && log.nftTokenId !== 0n ? log.nftTokenId.toString() : null,
        nftImagePath: log.nftImagePath,
        initiaTxHash: await this._getTxHashFromEvent(logId, Number(log.blockNumber)),
        explorerUrl: `https://scan.testnet.initia.xyz/evm-1/accounts/${this.contractAddress}`,
      };
    } catch (error) {
      console.error('❌ Failed to get game log:', error);
      throw error;
    }
  }

  async getGameHistory(playerAddress, limit = 50) {
    try {
      if (!this.contract) throw new Error('Initia Game Logger contract not initialized');
      const logIds = await this.contract.getPlayerHistory(playerAddress, limit);
      if (logIds.length === 0) return [];
      const logs = await Promise.all(
        logIds.map(async (logId) => {
          try { return await this.getGameLog(logId); } catch { return null; }
        })
      );
      return logs.filter((log) => log !== null);
    } catch (error) {
      console.error('❌ Failed to get game history:', error);
      throw error;
    }
  }

  async getPlayerGameCount(playerAddress) {
    try {
      if (!this.contract) throw new Error('Initia Game Logger contract not initialized');
      const count = await this.contract.getPlayerGameCount(playerAddress);
      return Number(count);
    } catch (error) {
      console.error('❌ Failed to get player game count:', error);
      throw error;
    }
  }

  async getLogsByGameType(gameType, limit = 50) {
    try {
      if (!this.contract) throw new Error('Initia Game Logger contract not initialized');
      const gameTypeEnum = GAME_TYPES[gameType.toUpperCase()];
      if (gameTypeEnum === undefined) throw new Error(`Invalid game type: ${gameType}`);
      const logIds = await this.contract.getLogsByGameType(gameTypeEnum, limit);
      if (logIds.length === 0) return [];
      const logs = await Promise.all(
        logIds.map(async (logId) => {
          try { return await this.getGameLog(logId); } catch { return null; }
        })
      );
      return logs.filter((log) => log !== null);
    } catch (error) {
      console.error('❌ Failed to get logs by game type:', error);
      throw error;
    }
  }

  async getStats() {
    try {
      if (!this.contract) throw new Error('Initia Game Logger contract not initialized');
      const stats = await this.contract.getStats();
      return {
        totalGames: Number(stats.totalGames),
        totalBets: ethers.formatEther(stats.totalBets),
        totalPayouts: ethers.formatEther(stats.totalPayouts),
        gameTypeCounts: {
          roulette: Number(stats.rouletteCount),
          mines: Number(stats.minesCount),
          wheel: Number(stats.wheelCount),
          plinko: Number(stats.plinkoCount),
        },
      };
    } catch (error) {
      console.error('❌ Failed to get stats:', error);
      throw error;
    }
  }

  async _getTxHashFromEvent(logId, blockNumber) {
    try {
      if (!blockNumber) return null;
      // Use direct Initia RPC provider to ensure correct network
      const directProvider = new ethers.JsonRpcProvider(
        'https://jsonrpc-evm-1.anvil.asia-southeast.initia.xyz'
      );
      const contractAddress = getInitiaGameLoggerAddress();
      if (!contractAddress) return null;
      const tempContract = new ethers.Contract(contractAddress, GAME_LOGGER_ABI, directProvider);
      const filter = tempContract.filters.GameResultLogged(logId);
      const events = await tempContract.queryFilter(filter, blockNumber, blockNumber);
      if (events.length > 0) return events[0].transactionHash;
      return null;
    } catch {
      return null;
    }
  }

  getTransactionUrl(txHash) {
    return getInitiaExplorerTxUrl(txHash);
  }

  validateGameData(gameData) {
    const { gameType, playerAddress, betAmount, result, payout } = gameData;
    if (!gameType) throw new Error('Game type is required');
    if (!playerAddress || !ethers.isAddress(playerAddress)) throw new Error('Valid player address is required');
    if (betAmount === undefined || betAmount === null || betAmount < 0) throw new Error('Valid bet amount is required');
    if (payout === undefined || payout === null || payout < 0) throw new Error('Valid payout amount is required');
    if (!result) throw new Error('Game result is required');
  }

  encodeResultData(result) {
    try {
      return ethers.toUtf8Bytes(JSON.stringify(result));
    } catch {
      return '0x';
    }
  }

  decodeResultData(resultData) {
    try {
      if (!resultData || resultData === '0x') return null;
      return JSON.parse(ethers.toUtf8String(resultData));
    } catch {
      return null;
    }
  }

  getGameTypeName(gameTypeEnum) {
    return ['ROULETTE', 'MINES', 'WHEEL', 'PLINKO'][gameTypeEnum] || 'UNKNOWN';
  }

  async isAuthorizedLogger(address) {
    try {
      if (!this.contract) throw new Error('Initia Game Logger contract not initialized');
      return await this.contract.isAuthorizedLogger(address);
    } catch {
      return false;
    }
  }

  onGameResultLogged(callback) {
    try {
      if (!this.contract) throw new Error('Initia Game Logger contract not initialized');
      const filter = this.contract.filters.GameResultLogged();
      const listener = (logId, player, gameType, betAmount, payout, entropyRequestId, entropyTxHash, timestamp, event) => {
        callback({
          logId,
          player,
          gameType: this.getGameTypeName(gameType),
          betAmount: ethers.formatEther(betAmount),
          payout: ethers.formatEther(payout),
          entropyRequestId,
          entropyTxHash,
          timestamp: Number(timestamp),
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber,
        });
      };
      this.contract.on(filter, listener);
      return () => { this.contract.off(filter, listener); };
    } catch (error) {
      console.error('❌ Failed to set up event listener:', error);
      throw error;
    }
  }

  async getNFTInfo(logId) {
    if (!this.contract) throw new Error('Initia Game Logger contract not initialized');
    const gameLog = await this.contract.getGameLog(logId);
    return {
      nftTxHash: gameLog.nftTxHash,
      nftTokenId: gameLog.nftTokenId.toString(),
      nftImagePath: gameLog.nftImagePath,
    };
  }

  async updateNFTInfo(logId, nftTxHash, tokenId, imagePath) {
    if (!this.contract) throw new Error('Initia Game Logger contract not initialized');
    if (!this.signer) throw new Error('Signer required to update NFT info');
    const tx = await this.contract.updateNFTInfo(logId, nftTxHash, BigInt(tokenId), imagePath);
    const receipt = await tx.wait();
    return receipt.hash;
  }
}

// Backwards compatibility exports
export const CreditCoinGameLogger = InitiaGameLogger;
export const initiaGameLogger = new InitiaGameLogger();
export default InitiaGameLogger;
