/**
 * Initia EVM Testnet Configuration
 * Network: https://initia.xyz
 */

export const initiaTestnetConfig = {
  id: 2124225178762456,
  name: 'Initia EVM Testnet',
  network: 'initia-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'INIT',
    symbol: 'INIT',
  },
  rpcUrls: {
    default: {
      http: ['https://jsonrpc-evm-1.anvil.asia-southeast.initia.xyz'],
    },
    public: {
      http: ['https://jsonrpc-evm-1.anvil.asia-southeast.initia.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Initia EVM Explorer',
      url: 'https://scan.testnet.initia.xyz/evm-1',
    },
  },
  testnet: true,
};

/** Initia EVM testnet (`evm-1`) account pages on [Initia Scan](https://scan.testnet.initia.xyz/evm-1). */
export const initiaL1TestnetScanBase = 'https://scan.testnet.initia.xyz/evm-1';

export const initiaTestnetTokens = {
  INIT: {
    address: 'native',
    decimals: 18,
    symbol: 'INIT',
    name: 'Initia Token',
    isNative: true,
  },
};

export const getInitiaExplorerTxUrl = (txHash) => {
  return `${initiaTestnetConfig.blockExplorers.default.url}/evm-txs/${txHash}`;
};

export const getInitiaExplorerAddressUrl = (address) => {
  return `${initiaTestnetConfig.blockExplorers.default.url}/accounts/${address}`;
};

/** Account page on Initia EVM testnet (`evm-1`). */
export const getInitiaL1AccountExplorerUrl = (address) =>
  `${initiaL1TestnetScanBase}/accounts/${address}`;

/**
 * EVM account **overview** on [Initia Scan](https://scan.testnet.initia.xyz/evm-1) (`…/overview`).
 * `accountId` may be `init1…` or `0x…` depending on how the explorer routes the account.
 */
export function getInitiaEvmAccountExplorerOverviewUrl(accountId) {
  const base = initiaTestnetConfig.blockExplorers.default.url;
  return `${base}/accounts/${accountId}/overview`;
}

export default initiaTestnetConfig;
