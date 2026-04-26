/**
 * Initia InterwovenKit — single import surface for reviewers and static search.
 * Wiring: `WalletProviders` (wagmi + InterwovenKitProvider + enableAutoSign),
 * `InitiaAutoSignControls` (useInterwovenKit().autoSign on TESTNET.defaultChainId).
 *
 * Packages: https://www.npmjs.com/package/@initia/interwovenkit-react
 */
export {
  TESTNET,
  InterwovenKitProvider,
  useInterwovenKit,
  initiaPrivyWalletConnector,
  injectStyles,
} from "@initia/interwovenkit-react";

export { default as interwovenKitStyles } from "@initia/interwovenkit-react/styles.js";
