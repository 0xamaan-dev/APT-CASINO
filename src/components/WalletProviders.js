"use client";

import { useEffect } from "react";
import { WagmiProvider, createConfig, http, useAccount, useSwitchChain } from "wagmi";
import { injected, metaMask } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  TESTNET,
  InterwovenKitProvider,
  initiaPrivyWalletConnector,
  injectStyles,
  interwovenKitStyles,
} from "@/config/interwovenKit";
import { initiaTestnet } from "@/config/chains";
import { WalletStatusProvider } from "@/hooks/useWalletStatus";
import WalletConnectionGuard from "@/components/WalletConnectionGuard";

const queryClient = new QueryClient();

const wagmiConfig = createConfig({
  chains: [initiaTestnet],
  connectors: [initiaPrivyWalletConnector(), injected(), metaMask()],
  transports: {
    [initiaTestnet.id]: http("https://jsonrpc-evm-1.anvil.asia-southeast.initia.xyz"),
  },
  ssr: false,
});

function InterwovenStyleRoot() {
  useEffect(() => {
    injectStyles(interwovenKitStyles);
  }, []);
  return null;
}

// Auto-switch to Initia EVM Testnet when wallet connects on wrong chain
function NetworkGuard({ children }) {
  const { isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  useEffect(() => {
    if (!isConnected || chainId === initiaTestnet.id) return;
    if (!switchChainAsync) return;

    switchChainAsync({ chainId: initiaTestnet.id }).catch(() => {
      if (typeof window !== "undefined" && window.ethereum) {
        const chainIdHex = "0x" + initiaTestnet.id.toString(16);
        window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: chainIdHex,
              chainName: "Initia EVM Testnet",
              nativeCurrency: { name: "INIT", symbol: "INIT", decimals: 18 },
              rpcUrls: ["https://jsonrpc-evm-1.anvil.asia-southeast.initia.xyz"],
              blockExplorerUrls: ["https://scan.testnet.initia.xyz/evm-1"],
            },
          ],
        }).catch(() => {});
      }
    });
  }, [isConnected, chainId, switchChainAsync]);

  return children;
}

export default function WalletProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <InterwovenKitProvider {...TESTNET} enableAutoSign>
          <InterwovenStyleRoot />
          <NetworkGuard>
            <WalletStatusProvider>
              <WalletConnectionGuard>{children}</WalletConnectionGuard>
            </WalletStatusProvider>
          </NetworkGuard>
        </InterwovenKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
