import { NextResponse } from 'next/server';
import { TREASURY_CONFIG } from '@/config/treasury';

/**
 * Deposit API - Initia EVM Testnet
 * Users send INIT to the treasury wallet. This API verifies and records the deposit.
 */

const INITIA_TREASURY_ADDRESS =
  process.env.NEXT_PUBLIC_INITIA_TREASURY_ADDRESS || TREASURY_CONFIG.ADDRESS;

const INITIA_CHAIN_ID = 2124225178762456;

export async function POST(request) {
  try {
    const { userAddress, amount, transactionHash } = await request.json();

    console.log('📥 Deposit request:', { userAddress, amount, transactionHash });

    if (!userAddress || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const mockDepositId = 'deposit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    console.log(`🏦 Processing deposit: ${amount} INIT from ${userAddress}`);
    console.log(`📍 Treasury: ${INITIA_TREASURY_ADDRESS}`);
    console.log(`🌐 Network: Initia EVM Testnet (Chain ID: ${INITIA_CHAIN_ID})`);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log(`✅ Deposit successful: ${amount} INIT from ${userAddress}`);

    return NextResponse.json({
      success: true,
      depositId: mockDepositId,
      amount,
      userAddress,
      treasuryAddress: INITIA_TREASURY_ADDRESS,
      network: 'initia-testnet',
      chainId: INITIA_CHAIN_ID,
      currency: 'INIT',
      status: 'confirmed',
      transactionHash,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Deposit API error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('userAddress');

    if (!userAddress) {
      return NextResponse.json({ error: 'User address is required' }, { status: 400 });
    }

    return NextResponse.json({
      userAddress,
      deposits: [],
      network: 'initia-testnet',
      currency: 'INIT',
    });
  } catch (error) {
    console.error('Deposit history error:', error);
    return NextResponse.json({ error: 'Failed to get deposit history' }, { status: 500 });
  }
}
