// Treasury — Initia EVM Testnet

export const TREASURY_CONFIG = {
  ADDRESS:
    process.env.NEXT_PUBLIC_INITIA_TREASURY_ADDRESS ||
    process.env.INITIA_TREASURY_ADDRESS ||
    '0x71197e7a1CA5A2cb2AD82432B924F69B1E3dB123',

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
