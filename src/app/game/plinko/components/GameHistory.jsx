"use client";
import { useState } from "react";
import { FaExternalLinkAlt, FaImage } from "react-icons/fa";
import Image from "next/image";

const GAME_LOGGER = "0xcB559740E47eed913fDa1fFCecAd0D694dfA6271";
const NFT_CONTRACT = "0x737165fE3834e07E0b053900BcE3C18Add9F2c7D";

export default function GameHistory({ history }) {
  const [visibleCount, setVisibleCount] = useState(5);
  const [imageErrors, setImageErrors] = useState({});
  const hasTxHash = (value) =>
    typeof value === "string" && /^0x([A-Fa-f0-9]{64})$/.test(value);

  const openInitiaExplorer = (txHash) => {
    if (!hasTxHash(txHash)) return;
    window.open(`https://scan.testnet.initia.xyz/evm-1/evm-txs/${txHash}`, "_blank");
  };

  const openEntropyExplorer = (txHash) => {
    if (txHash) {
      window.open(`https://entropy-explorer.pyth.network/?chain=arbitrum-sepolia&search=${txHash}`, "_blank");
    }
  };

  const openNFTExplorer = (nftTxHash) => {
    if (!hasTxHash(nftTxHash)) return;
    window.open(`https://scan.testnet.initia.xyz/evm-1/evm-txs/${nftTxHash}`, "_blank");
  };

  const handleImageError = (gameId) => {
    setImageErrors((prev) => ({ ...prev, [gameId]: true }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Game History</h3>
        {history.length > visibleCount && (
          <button
            onClick={() => setVisibleCount((c) => Math.min(c + 5, history.length))}
            className="bg-[#2A0025] border border-[#333947] rounded-lg px-3 py-2 text-sm text-white hover:bg-[#3A0035] transition-colors"
          >
            Show more
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#333947]">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Game</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Title</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Bet</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Multiplier</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Payout</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">NFT</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Entropy Explorer</th>
            </tr>
          </thead>
          <tbody>
            {history.slice(0, visibleCount).map((game) => (
              <tr key={game.id} className="border-b border-[#333947]/30 hover:bg-[#2A0025]/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">P</span>
                    </div>
                    <span className="text-white text-sm">Plinko</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-gray-300 text-sm">{game.title}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full" />
                    <span className="text-white text-sm">{game.betAmount} INIT</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-gray-300 text-sm">{game.multiplier}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full" />
                    <span className={`text-sm font-bold ${parseFloat(game.payout) > 0 ? "text-green-400" : "text-gray-400"}`}>
                      {game.payout} INIT
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  {hasTxHash(game.nftTxHash) ? (
                    <button
                      onClick={() => openNFTExplorer(game.nftTxHash)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#681DDB]/20 border border-[#681DDB]/40 rounded-lg text-[#681DDB] text-xs font-bold hover:bg-[#681DDB]/30 transition-all"
                      title="View NFT mint transaction on Initia Explorer"
                    >
                      <FaImage size={12} />
                      <span>NFT</span>
                    </button>
                  ) : (
                    <span className="text-xs text-gray-500">Pending</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col gap-1">
                    {game.entropyProof?.sequenceNumber && game.entropyProof.sequenceNumber !== "0" && (
                      <div className="text-yellow-400 font-bold text-xs font-mono">
                        {String(game.entropyProof.sequenceNumber)}
                      </div>
                    )}
                    <div className="flex gap-1 flex-wrap">
                      {hasTxHash(game.initiaTxHash) ? (
                        <button
                          onClick={() => openInitiaExplorer(game.initiaTxHash)}
                          className="flex items-center gap-1 px-2 py-1 bg-[#0A0A0A]/10 border border-[#65B3AE]/30 rounded text-[#65B3AE] text-xs hover:bg-[#65B3AE]/20 transition-colors"
                          title="View on Initia Explorer"
                        >
                          <FaExternalLinkAlt size={8} />
                          Initia
                        </button>
                      ) : (
                        <span className="text-xs text-gray-500">Initia pending</span>
                      )}
                      {hasTxHash(game.entropyProof?.transactionHash) && (
                        <button
                          onClick={() => openEntropyExplorer(game.entropyProof.transactionHash)}
                          className="flex items-center gap-1 px-2 py-1 bg-[#681DDB]/10 border border-[#681DDB]/30 rounded text-[#681DDB] text-xs hover:bg-[#681DDB]/20 transition-colors"
                          title="View on Pyth Entropy Explorer"
                        >
                          <FaExternalLinkAlt size={8} />
                          Entropy
                        </button>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {history.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>No game history yet. Play a game to see your results here!</p>
        </div>
      )}
    </div>
  );
}
