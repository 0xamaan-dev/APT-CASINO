import { useState, useCallback } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { ethers } from 'ethers';
import { InitiaGameLogger } from '../services/CreditCoinGameLogger';
import { getInitiaExplorerTxUrl } from '../config/initiaTestnetConfig';
import APTCasinoNFT_ABI from '../abis/APTCasinoNFT.json';

/**
 * React hook for Initia Game Logger
 * Provides easy access to game logging functionality on Initia EVM Testnet
 */
export function useInitiaGameLogger() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [isLogging, setIsLogging] = useState(false);
  const [lastLogTxHash, setLastLogTxHash] = useState(null);
  const [error, setError] = useState(null);

  const getEthersProviderAndSigner = useCallback(async () => {
    if (!publicClient) return { provider: null, signer: null };
    const provider = new ethers.BrowserProvider(window.ethereum);
    let signer = null;
    if (walletClient && isConnected) signer = await provider.getSigner();
    return { provider, signer };
  }, [publicClient, walletClient, isConnected]);

  const logGame = useCallback(async ({ gameType, betAmount, result, payout, entropyProof }) => {
    if (!isConnected || !address) {
      setError('Wallet not connected');
      return null;
    }

    setIsLogging(true);
    setError(null);

    try {
      const response = await fetch('/api/log-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameType, playerAddress: address, betAmount, result, payout, entropyProof }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to log game');

      setLastLogTxHash(data.transactionHash);
      return data.transactionHash;
    } catch (err) {
      console.error('Failed to log game to Initia:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLogging(false);
    }
  }, [address, isConnected]);

  const getHistory = useCallback(async (limit = 50) => {
    if (!address) return [];
    try {
      const { provider } = await getEthersProviderAndSigner();
      const logger = new InitiaGameLogger(provider, null);
      const games = await logger.getGameHistory(address, limit);

      try {
        const response = await fetch(`/api/game-history?player=${address}&limit=${limit}`);
        if (response.ok) {
          const { nftData } = await response.json();
          return games.map((game) => ({
            ...game,
            nftTxHash: game.nftTxHash || nftData[game.logId]?.nftTxHash || null,
            nftTokenId: game.nftTokenId || nftData[game.logId]?.nftTokenId || null,
            nftImagePath: game.nftImagePath || nftData[game.logId]?.nftImagePath || null,
            nftMinting: nftData[game.logId]?.nftMinting || false,
            nftError: nftData[game.logId]?.nftError || null,
          }));
        }
      } catch (nftErr) {
        console.warn('Failed to fetch supplemental NFT data:', nftErr);
      }

      return games;
    } catch (err) {
      console.error('Failed to get history from Initia:', err);
      return [];
    }
  }, [address, getEthersProviderAndSigner]);

  const getLogsByGameType = useCallback(async (gameType, limit = 50) => {
    if (!address) return [];
    try {
      const { provider } = await getEthersProviderAndSigner();
      const logger = new InitiaGameLogger(provider, null);
      const games = await logger.getLogsByGameType(gameType, limit);

      try {
        const response = await fetch(`/api/game-history?player=${address}&limit=${limit}`);
        if (response.ok) {
          const { nftData } = await response.json();
          return games.map((game) => ({
            ...game,
            nftTxHash: game.nftTxHash || nftData[game.logId]?.nftTxHash || null,
            nftTokenId: game.nftTokenId || nftData[game.logId]?.nftTokenId || null,
            nftImagePath: game.nftImagePath || nftData[game.logId]?.nftImagePath || null,
            nftMinting: nftData[game.logId]?.nftMinting || false,
            nftError: nftData[game.logId]?.nftError || null,
          }));
        }
      } catch (nftErr) {
        console.warn('Failed to fetch supplemental NFT data:', nftErr);
      }

      return games;
    } catch (err) {
      console.error('Failed to get logs by game type:', err);
      return [];
    }
  }, [address, getEthersProviderAndSigner]);

  const getGameCount = useCallback(async () => {
    if (!address) return 0;
    try {
      const { provider } = await getEthersProviderAndSigner();
      const logger = new InitiaGameLogger(provider, null);
      return await logger.getPlayerGameCount(address);
    } catch {
      return 0;
    }
  }, [address, getEthersProviderAndSigner]);

  const getStats = useCallback(async () => {
    try {
      const { provider } = await getEthersProviderAndSigner();
      const logger = new InitiaGameLogger(provider, null);
      return await logger.getStats();
    } catch {
      return null;
    }
  }, [getEthersProviderAndSigner]);

  const subscribeToEvents = useCallback((callback) => {
    const setupSubscription = async () => {
      try {
        const { provider } = await getEthersProviderAndSigner();
        const logger = new InitiaGameLogger(provider, null);
        return logger.onGameResultLogged(callback);
      } catch {
        return () => {};
      }
    };

    let unsubscribe = () => {};
    setupSubscription().then((unsub) => { unsubscribe = unsub; });
    return () => unsubscribe();
  }, [getEthersProviderAndSigner]);

  const getExplorerUrl = useCallback((txHash) => {
    return getInitiaExplorerTxUrl(txHash);
  }, []);

  const getNFTsByOwner = useCallback(async () => {
    if (!address) return [];
    try {
      const nftContractAddress = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;
      if (!nftContractAddress) return [];
      const { provider } = await getEthersProviderAndSigner();
      if (!provider) return [];

      const nftContract = new ethers.Contract(nftContractAddress, APTCasinoNFT_ABI.abi, provider);
      const tokenIds = await nftContract.getTokensByOwner(address);
      const nfts = [];

      for (const tokenId of tokenIds) {
        const metadata = await nftContract.getTokenMetadata(tokenId);
        nfts.push({
          tokenId: tokenId.toString(),
          gameType: metadata.gameType,
          betAmount: metadata.betAmount.toString(),
          result: metadata.result,
          payout: metadata.payout.toString(),
          timestamp: Number(metadata.timestamp),
          logId: metadata.logId,
        });
      }

      return nfts;
    } catch {
      return [];
    }
  }, [address, getEthersProviderAndSigner]);

  const getNFTCount = useCallback(async () => {
    if (!address) return 0;
    try {
      const nftContractAddress = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;
      if (!nftContractAddress) return 0;
      const { provider } = await getEthersProviderAndSigner();
      if (!provider) return 0;
      const nftContract = new ethers.Contract(nftContractAddress, APTCasinoNFT_ABI.abi, provider);
      return Number(await nftContract.balanceOf(address));
    } catch {
      return 0;
    }
  }, [address, getEthersProviderAndSigner]);

  return {
    isLogging,
    lastLogTxHash,
    error,
    isConnected,
    address,
    isInitialized: isConnected && !!publicClient,
    logGame,
    getHistory,
    getLogsByGameType,
    getGameCount,
    getStats,
    subscribeToEvents,
    getExplorerUrl,
    getNFTsByOwner,
    getNFTCount,
  };
}

// Backwards compatibility exports
export const useCreditcoinGameLogger = useInitiaGameLogger;
export const useCreditCoinGameLogger = useInitiaGameLogger;
export const useMantleGameLogger = useInitiaGameLogger;
export default useInitiaGameLogger;
