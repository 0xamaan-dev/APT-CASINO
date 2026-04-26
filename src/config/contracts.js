// Initia EVM Testnet — contract addresses and network metadata

import { DEFAULT_INITIA_TREASURY_ADDRESS } from '@/config/treasury';

export const INITIA_NETWORKS = {
  TESTNET: 'initia-testnet',
};

export const INITIA_NETWORK_URLS = {
  [INITIA_NETWORKS.TESTNET]:
    process.env.NEXT_PUBLIC_INITIA_TESTNET_RPC ||
    'https://jsonrpc-evm-1.anvil.asia-southeast.initia.xyz',
};

export const INITIA_EXPLORER_URLS = {
  [INITIA_NETWORKS.TESTNET]:
    process.env.NEXT_PUBLIC_INITIA_TESTNET_EXPLORER ||
    'https://scan.testnet.initia.xyz/evm-1',
};

export const DEFAULT_NETWORK = INITIA_NETWORKS.TESTNET;

export const INITIA_CONTRACTS = {
  [INITIA_NETWORKS.TESTNET]: {
    treasury:
      process.env.NEXT_PUBLIC_INITIA_TREASURY_ADDRESS ||
      process.env.INITIA_TREASURY_ADDRESS ||
      DEFAULT_INITIA_TREASURY_ADDRESS,
    gameLogger: process.env.NEXT_PUBLIC_INITIA_GAME_LOGGER_ADDRESS || '',
  },
};

export const TOKEN_CONFIG = {
  INIT: {
    name: 'Initia Token',
    symbol: 'INIT',
    decimals: 18,
    type: 'native',
  },
};

export const NETWORK_INFO = {
  [INITIA_NETWORKS.TESTNET]: {
    name: 'Initia EVM Testnet',
    chainId: 2124225178762456,
    nativeCurrency: TOKEN_CONFIG.INIT,
    explorer: INITIA_EXPLORER_URLS[INITIA_NETWORKS.TESTNET],
  },
};

export default {
  INITIA_NETWORKS,
  INITIA_NETWORK_URLS,
  INITIA_EXPLORER_URLS,
  INITIA_CONTRACTS,
  DEFAULT_NETWORK,
  TOKEN_CONFIG,
  NETWORK_INFO,
};
