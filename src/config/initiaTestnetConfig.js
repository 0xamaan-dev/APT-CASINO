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

export default initiaTestnetConfig;
