/**
 * Wagmi / viem chain — Initia EVM Testnet only
 */
import { defineChain } from 'viem';

export const initiaTestnet = defineChain({
  id: 2124225178762456,
  name: 'Initia EVM Testnet',
  iconUrl: '/logos/initia.png',
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
});

export default { initiaTestnet };
