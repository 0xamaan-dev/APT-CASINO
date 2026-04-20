require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: '.env.local' });
require("dotenv").config({ path: '.env' });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.24",
        settings: {
          optimizer: { enabled: true, runs: 200 },
          evmVersion: "cancun",
        },
      },
      {
        version: "0.8.20",
        settings: { optimizer: { enabled: true, runs: 200 } },
      },
      {
        version: "0.8.19",
        settings: { optimizer: { enabled: true, runs: 200 } },
      },
    ],
  },
  networks: {
    'initia-testnet': {
      url: process.env.NEXT_PUBLIC_INITIA_TESTNET_RPC || 'https://jsonrpc-evm-1.anvil.asia-southeast.initia.xyz',
      accounts: process.env.INITIA_TREASURY_PRIVATE_KEY
        ? [process.env.INITIA_TREASURY_PRIVATE_KEY]
        : process.env.TREASURY_PRIVATE_KEY
        ? [process.env.TREASURY_PRIVATE_KEY]
        : [],
      chainId: 2124225178762456,
      timeout: 120000,
      httpHeaders: { "User-Agent": "hardhat" },
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: {
      'initia-testnet': process.env.INITIA_EXPLORER_API_KEY || 'abc',
    },
    customChains: [
      {
        network: 'initia-testnet',
        chainId: 2124225178762456,
        urls: {
          apiURL: 'https://explorer-evm-1.anvil.asia-southeast.initia.xyz/api',
          browserURL: 'https://explorer-evm-1.anvil.asia-southeast.initia.xyz',
        },
      },
    ],
  },
  paths: {
    sources: './contracts',
    cache: './cache',
    artifacts: './artifacts',
  },
};
