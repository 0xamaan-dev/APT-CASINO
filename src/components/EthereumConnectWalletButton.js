"use client";
import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export default function EthereumConnectWalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => disconnect()}
          style={{
            background: 'linear-gradient(135deg, #8B2398, #31C4BE)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          {address.slice(0, 6)}...{address.slice(-4)}
        </button>
      </div>
    );
  }

  const injectedConnector = connectors.find(
    (c) => c.id === 'injected' || c.id === 'metaMask'
  ) || connectors[0];

  return (
    <div className="relative">
      <button
        onClick={() => injectedConnector && connect({ connector: injectedConnector })}
        style={{
          background: 'linear-gradient(135deg, #8B2398, #31C4BE)',
          border: 'none',
          borderRadius: '12px',
          color: 'white',
          padding: '8px 16px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
        }}
      >
        Connect Wallet
      </button>
    </div>
  );
}
