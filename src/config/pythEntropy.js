/**
 * Pyth Entropy — server-side RPC (defaults to public Sepolia rollup used by Pyth Entropy deployments).
 * Games and balances stay on Initia; only entropy requests use this RPC URL.
 */

const ENTROPY_RPC =
  process.env.PYTH_ENTROPY_RPC_URL ||
  process.env.NEXT_PUBLIC_PYTH_ENTROPY_RPC_URL ||
  'https://sepolia-rollup.arbitrum.io/rpc';

export const PYTH_ENTROPY_CONFIG = {
  NETWORK: {
    chainId: 421614,
    name: 'Pyth Entropy (rollup)',
    rpcUrl: ENTROPY_RPC,
    entropyContract:
      process.env.NEXT_PUBLIC_PYTH_ENTROPY_CONTRACT || '0x549ebba8036ab746611b4ffa1423eb0a4df61440',
    entropyProvider:
      process.env.NEXT_PUBLIC_PYTH_ENTROPY_PROVIDER || '0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344',
    explorerUrl:
      process.env.PYTH_ENTROPY_TX_EXPLORER_BASE || 'https://sepolia.arbiscan.io',
    entropyExplorerUrl: 'https://entropy-explorer.pyth.network/?chain=arbitrum-sepolia&search=',
    currency: 'ETH',
    currencySymbol: 'ETH',
    currencyDecimals: 18,
  },

  NETWORKS: {
    'entropy-backend': {
      chainId: 421614,
      name: 'Pyth Entropy (rollup)',
      rpcUrl: ENTROPY_RPC,
      entropyContract:
        process.env.NEXT_PUBLIC_PYTH_ENTROPY_CONTRACT || '0x549ebba8036ab746611b4ffa1423eb0a4df61440',
      entropyProvider:
        process.env.NEXT_PUBLIC_PYTH_ENTROPY_PROVIDER || '0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344',
      explorerUrl:
        process.env.PYTH_ENTROPY_TX_EXPLORER_BASE || 'https://sepolia.arbiscan.io',
      entropyExplorerUrl: 'https://entropy-explorer.pyth.network/?chain=arbitrum-sepolia&search=',
      currency: 'ETH',
      currencySymbol: 'ETH',
      currencyDecimals: 18,
    },
  },

  DEFAULT_NETWORK: 'entropy-backend',

  GAME_TYPES: {
    MINES: 0,
    PLINKO: 1,
    ROULETTE: 2,
    WHEEL: 3,
  },

  REQUEST_CONFIG: {
    gasLimit: 500000,
    maxGasPrice: '1000000000',
    timeout: 30000,
    maxRetries: 3,
    retryDelay: 1000,
  },

  EXPLORER_CONFIG: {
    baseUrl: 'https://entropy-explorer.pyth.network',
    supportedChains: ['arbitrum-sepolia'],
    transactionLinkFormat: 'https://entropy-explorer.pyth.network/tx/{txHash}',
    entropyExplorerUrl: 'https://entropy-explorer.pyth.network/?chain=arbitrum-sepolia&search=',
  },

  getNetworkConfig(network) {
    return this.NETWORK;
  },

  getEntropyContract() {
    return this.NETWORK.entropyContract;
  },

  getEntropyProvider() {
    return this.NETWORK.entropyProvider;
  },

  getExplorerUrl(txHash) {
    const base = this.NETWORK.explorerUrl;
    return `${base}/tx/${txHash}`;
  },

  getEntropyExplorerUrl(txHash) {
    if (txHash) {
      return `https://entropy-explorer.pyth.network/?chain=arbitrum-sepolia&search=${txHash}`;
    }
    return this.NETWORK.entropyExplorerUrl;
  },

  isNetworkSupported() {
    return true;
  },

  getSupportedNetworks() {
    return ['entropy-backend'];
  },

  getCurrentNetwork() {
    return this.NETWORK;
  },
};

export default PYTH_ENTROPY_CONFIG;
