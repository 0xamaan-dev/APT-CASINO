import { getInitiaEvmAccountExplorerOverviewUrl } from '@/config/initiaTestnetConfig';

/** Treasury — Initia EVM Testnet (signing uses `0x…`; Initia Scan account may use `init1…`). */

/** Default public treasury EOA (Initia testnet). Override via env in production. */
export const DEFAULT_INITIA_TREASURY_ADDRESS =
  '0x6E932AD4F0E99E0e49059149C035194cc352BE52';

/** Default Initia Scan EVM account id for treasury overview (`0x…` or `init1…`). */
export const DEFAULT_INITIA_TREASURY_ACCOUNT_SCAN_ID =
  '0x6E932AD4F0E99E0e49059149C035194cc352BE52';

function getTreasuryAccountScanId() {
  return (
    process.env.NEXT_PUBLIC_INITIA_TREASURY_ACCOUNT_SCAN_ID ||
    process.env.INITIA_TREASURY_ACCOUNT_SCAN_ID ||
    DEFAULT_INITIA_TREASURY_ACCOUNT_SCAN_ID
  );
}

export const TREASURY_CONFIG = {
  ADDRESS:
    process.env.NEXT_PUBLIC_INITIA_TREASURY_ADDRESS ||
    process.env.INITIA_TREASURY_ADDRESS ||
    DEFAULT_INITIA_TREASURY_ADDRESS,

  PRIVATE_KEY: process.env.INITIA_TREASURY_PRIVATE_KEY || process.env.TREASURY_PRIVATE_KEY || '',

  NETWORK: {
    CHAIN_ID: '0x18E8F',
    CHAIN_NAME: 'Initia EVM Testnet',
    RPC_URL:
      process.env.NEXT_PUBLIC_INITIA_TESTNET_RPC ||
      'https://jsonrpc-evm-1.anvil.asia-southeast.initia.xyz',
    EXPLORER_URL:
      process.env.NEXT_PUBLIC_INITIA_TESTNET_EXPLORER ||
      'https://scan.testnet.initia.xyz/evm-1',
  },

  GAS: {
    DEPOSIT_LIMIT: process.env.GAS_LIMIT_DEPOSIT ? '0x' + parseInt(process.env.GAS_LIMIT_DEPOSIT).toString(16) : '0x1E8480',
    WITHDRAW_LIMIT: process.env.GAS_LIMIT_WITHDRAW ? '0x' + parseInt(process.env.GAS_LIMIT_WITHDRAW).toString(16) : '0x1E8480',
  },

  LIMITS: {
    MIN_DEPOSIT: parseFloat(process.env.MIN_DEPOSIT) || 0.001,
    MAX_DEPOSIT: parseFloat(process.env.MAX_DEPOSIT) || 10000,
  },
};

export const isValidTreasuryAddress = (address) => /^0x[a-fA-F0-9]{40}$/.test(address);

export const getTreasuryInfo = () => ({
  address: TREASURY_CONFIG.ADDRESS,
  network: TREASURY_CONFIG.NETWORK.CHAIN_NAME,
  chainId: TREASURY_CONFIG.NETWORK.CHAIN_ID,
});

/** Initia Scan — EVM testnet treasury account overview (`/evm-1/accounts/…/overview`). */
export function getTreasuryInitiaScanUrl() {
  return getInitiaEvmAccountExplorerOverviewUrl(getTreasuryAccountScanId());
}
