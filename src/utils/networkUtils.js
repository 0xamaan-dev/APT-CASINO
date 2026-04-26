// Initia EVM Testnet — wallet add/switch helpers
import { initiaTestnet } from '@/config/chains';

export const INITIA_TESTNET_CONFIG = {
  chainId: '0x' + (2124225178762456n).toString(16),
  chainName: 'Initia EVM Testnet',
  nativeCurrency: {
    name: 'Initia',
    symbol: 'INIT',
    decimals: 18,
  },
  rpcUrls: ['https://jsonrpc-evm-1.anvil.asia-southeast.initia.xyz'],
  blockExplorerUrls: ['https://scan.testnet.initia.xyz/evm-1'],
};

export const switchToInitiaTestnet = async () => {
  if (!window.ethereum) {
    throw new Error('No wallet detected');
  }

  const chainIdHex = '0x' + (2124225178762456n).toString(16);

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: chainIdHex,
              chainName: 'Initia EVM Testnet',
              nativeCurrency: { name: 'Initia', symbol: 'INIT', decimals: 18 },
              rpcUrls: ['https://jsonrpc-evm-1.anvil.asia-southeast.initia.xyz'],
              blockExplorerUrls: ['https://scan.testnet.initia.xyz/evm-1'],
            },
          ],
        });
      } catch {
        throw new Error('Failed to add Initia Testnet to wallet');
      }
    } else {
      throw new Error('Failed to switch to Initia Testnet');
    }
  }
};

export const isInitiaTestnet = (chainId) =>
  chainId === initiaTestnet.id || chainId === BigInt(initiaTestnet.id);

export const formatINITBalance = (balance, decimals = 4) => {
  const numBalance = parseFloat(balance || '0');
  return `${numBalance.toFixed(decimals)} INIT`;
};

export const getInitiaExplorerUrl = (txHash) =>
  `https://scan.testnet.initia.xyz/evm-1/evm-txs/${txHash}`;

export const getInitiaExplorerAddressUrl = (address) =>
  `https://scan.testnet.initia.xyz/evm-1/accounts/${address}`;

/** Block explorer for Pyth Entropy request transactions (rollup hosting the entropy contract). */
export const getPythEntropyTxExplorerUrl = (txHash) => {
  const base =
    process.env.PYTH_ENTROPY_TX_EXPLORER_BASE ||
    process.env.NEXT_PUBLIC_PYTH_ENTROPY_TX_EXPLORER_BASE ||
    'https://sepolia.arbiscan.io';
  return `${base}/tx/${txHash}`;
};
