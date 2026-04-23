import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { TREASURY_CONFIG } from '@/config/treasury';
import initiaTestnetConfig from '@/config/initiaTestnetConfig';

/**
 * Withdraw API - Initia EVM Testnet
 * Sends INIT from the treasury wallet to the user's address.
 */

const TREASURY_PRIVATE_KEY = TREASURY_CONFIG.PRIVATE_KEY;
const TREASURY_WALLET_ADDRESS = TREASURY_CONFIG.ADDRESS;
const INITIA_RPC_URL = initiaTestnetConfig.rpcUrls.default.http[0];

const provider = new ethers.JsonRpcProvider(INITIA_RPC_URL);
const treasuryWallet = TREASURY_PRIVATE_KEY
  ? new ethers.Wallet(TREASURY_PRIVATE_KEY, provider)
  : null;

export async function POST(request) {
  try {
    const { userAddress, amount } = await request.json();

    console.log('📥 Withdrawal request:', { userAddress, amount });

    if (!userAddress || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    if (!TREASURY_PRIVATE_KEY || !treasuryWallet) {
      return NextResponse.json({ error: 'Treasury not configured' }, { status: 500 });
    }

    console.log(`🏦 Processing withdrawal: ${amount} INIT to ${userAddress}`);
    console.log(`📍 Treasury Wallet: ${treasuryWallet.address}`);

    const amountWei = ethers.parseEther(amount.toString());

    let treasuryBalance = BigInt(0);
    try {
      treasuryBalance = await provider.getBalance(treasuryWallet.address);
      console.log(`💰 Treasury balance: ${ethers.formatEther(treasuryBalance)} INIT`);
    } catch {
      console.log('⚠️ Could not check treasury balance, proceeding...');
    }

    if (treasuryBalance < amountWei) {
      return NextResponse.json(
        { error: `Insufficient treasury funds. Available: ${ethers.formatEther(treasuryBalance)} INIT, Requested: ${amount} INIT` },
        { status: 400 }
      );
    }

    // Format and validate user address
    let formattedUserAddress;
    if (typeof userAddress === 'object' && userAddress.data) {
      const bytes = Object.values(userAddress.data);
      formattedUserAddress = '0x' + bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
    } else if (typeof userAddress === 'string') {
      formattedUserAddress = userAddress.startsWith('0x') ? userAddress : `0x${userAddress}`;
    } else {
      throw new Error(`Invalid userAddress format: ${typeof userAddress}`);
    }

    formattedUserAddress = ethers.getAddress(formattedUserAddress);

    const walletBalance = await provider.getBalance(treasuryWallet.address);
    if (walletBalance < amountWei) {
      return NextResponse.json(
        { error: `Treasury wallet insufficient. Balance: ${ethers.formatEther(walletBalance)} INIT, Requested: ${amount} INIT` },
        { status: 400 }
      );
    }

    const feeData = await provider.getFeeData();
    console.log(`⛽ Gas Price: ${ethers.formatUnits(feeData.gasPrice || 0n, 'gwei')} gwei`);

    console.log(`💸 Sending ${amount} INIT from ${treasuryWallet.address} to ${formattedUserAddress}...`);
    const tx = await treasuryWallet.sendTransaction({
      to: formattedUserAddress,
      value: amountWei,
      gasPrice: feeData.gasPrice,
    });

    console.log(`📤 Initia transaction sent: ${tx.hash}`);

    return NextResponse.json({
      success: true,
      transactionHash: tx.hash,
      amount,
      userAddress: formattedUserAddress,
      toAddress: formattedUserAddress,
      treasuryAddress: treasuryWallet.address,
      status: 'pending',
      network: 'Initia EVM Testnet',
      currency: 'INIT',
      explorerUrl: `https://scan.testnet.initia.xyz/evm-1/evm-txs/${tx.hash}`,
      message: 'Transaction sent on Initia EVM Testnet.',
    });
  } catch (error) {
    console.error('Withdraw API error:', error);
    return NextResponse.json(
      { error: `Withdrawal failed: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    if (!TREASURY_PRIVATE_KEY || !treasuryWallet) {
      return NextResponse.json({ error: 'Treasury not configured' }, { status: 500 });
    }

    try {
      const walletBalance = await provider.getBalance(treasuryWallet.address);
      return NextResponse.json({
        treasuryWalletAddress: treasuryWallet.address,
        walletBalance: ethers.formatEther(walletBalance),
        walletBalanceWei: walletBalance.toString(),
        currency: 'INIT',
        status: 'active',
        network: 'Initia EVM Testnet',
        explorerUrl: `https://scan.testnet.initia.xyz/evm-1/accounts/${treasuryWallet.address}`,
      });
    } catch (balanceError) {
      return NextResponse.json({
        treasuryWalletAddress: treasuryWallet.address,
        walletBalance: '0',
        currency: 'INIT',
        status: 'error',
        error: balanceError.message,
        network: 'Initia EVM Testnet',
      });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check treasury balance: ' + error.message }, { status: 500 });
  }
}
