// Initia EVM Testnet — contract addresses and network metadata

import { DEFAULT_INITIA_TREASURY_ADDRESS } from '@/config/treasury';

/** Deployed `InitiaGameLogger` on evm-1; override with `NEXT_PUBLIC_INITIA_GAME_LOGGER_ADDRESS`. */
export const DEFAULT_INITIA_GAME_LOGGER_ADDRESS =
  '0xcB559740E47eed913fDa1fFCecAd0D694dfA6271';

/** Deployed `APTCasinoNFT` on evm-1; override with `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS` / `NFT_CONTRACT_ADDRESS`. */
export const DEFAULT_INITIA_NFT_CONTRACT_ADDRESS =
  '0x737165fE3834e07E0b053900BcE3C18Add9F2c7D';

export function getInitiaGameLoggerAddress() {
  const v = process.env.NEXT_PUBLIC_INITIA_GAME_LOGGER_ADDRESS;
  if (v && v !== '0x0000000000000000000000000000000000000000') return v;
  return DEFAULT_INITIA_GAME_LOGGER_ADDRESS;
}

export function getInitiaNftContractAddress() {
  const v = process.env.NFT_CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;
  if (v && v !== '0x0000000000000000000000000000000000000000') return v;
  return DEFAULT_INITIA_NFT_CONTRACT_ADDRESS;
}

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
    gameLogger: getInitiaGameLoggerAddress(),
    nft: getInitiaNftContractAddress(),
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
