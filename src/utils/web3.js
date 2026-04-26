import { ethers } from 'ethers';
import { NETWORK_INFO, INITIA_NETWORKS } from '../config/contracts';
import { getInitiaChainIconUrls } from '@/utils/networkUtils';
import {
  rouletteContractAddress,
  tokenContractAddress,
  rouletteABI,
} from '../app/game/roulette/contractDetails';

const TOKEN_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function approve(address,uint256) returns (bool)',
  'function allowance(address,address) view returns (uint256)',
];

const getProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return null;
};

export const getTokenContract = async (withSigner = false) => {
  const provider = getProvider();
  if (!provider) throw new Error('No wallet provider');
  if (withSigner) {
    const signer = await provider.getSigner();
    return new ethers.Contract(tokenContractAddress, TOKEN_ABI, signer);
  }
  return new ethers.Contract(tokenContractAddress, TOKEN_ABI, provider);
};

export const getRouletteContract = async (withSigner = false) => {
  const provider = getProvider();
  if (!provider) throw new Error('No wallet provider');
  if (withSigner) {
    const signer = await provider.getSigner();
    return new ethers.Contract(rouletteContractAddress, rouletteABI, signer);
  }
  return new ethers.Contract(rouletteContractAddress, rouletteABI, provider);
};

export const parseTokenAmount = (amount) => ethers.parseEther(amount.toString());

export const switchToMantleSepolia = async () => {
  if (!window.ethereum) throw new Error('No wallet detected');

  const info = NETWORK_INFO[INITIA_NETWORKS.TESTNET];
  const chainIdHex = '0x' + BigInt(info.chainId).toString(16);

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: chainIdHex,
            chainName: info.name,
            nativeCurrency: info.nativeCurrency,
            rpcUrls: [
              process.env.NEXT_PUBLIC_INITIA_TESTNET_RPC ||
                'https://jsonrpc-evm-1.anvil.asia-southeast.initia.xyz',
            ],
            blockExplorerUrls: [info.explorer],
            iconUrls: getInitiaChainIconUrls(),
          },
        ],
      });
    } else {
      throw switchError;
    }
  }
};
