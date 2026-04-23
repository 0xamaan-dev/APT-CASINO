import { NextResponse } from 'next/server';
import { ethers, JsonRpcProvider, Wallet } from 'ethers';
import initiaTestnetConfig from '@/config/initiaTestnetConfig';

/** Treasury balance on Initia EVM Testnet */
export async function GET() {
  try {
    const initiaRpcUrl = initiaTestnetConfig.rpcUrls.default.http[0];
    const TREASURY_PRIVATE_KEY =
      process.env.INITIA_TREASURY_PRIVATE_KEY || process.env.TREASURY_PRIVATE_KEY;

    if (!TREASURY_PRIVATE_KEY) {
      return NextResponse.json({ error: 'Treasury not configured' }, { status: 500 });
    }

    const provider = new JsonRpcProvider(initiaRpcUrl);
    const treasuryWallet = new Wallet(TREASURY_PRIVATE_KEY, provider);

    const balance = await provider.getBalance(treasuryWallet.address);
    const balanceInInit = ethers.formatEther(balance);

    return NextResponse.json({
      success: true,
      treasury: {
        address: treasuryWallet.address,
        balance: balanceInInit,
        balanceWei: balance.toString(),
        currency: 'INIT',
      },
      network: {
        name: initiaTestnetConfig.name,
        chainId: initiaTestnetConfig.id,
        rpcUrl: initiaRpcUrl,
        explorer: initiaTestnetConfig.blockExplorers.default.url,
      },
    });
  } catch (error) {
    console.error('Treasury balance check failed:', error);
    return NextResponse.json(
      { error: 'Failed to check treasury balance', details: error.message },
      { status: 500 }
    );
  }
}
