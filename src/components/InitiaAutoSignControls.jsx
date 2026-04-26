"use client";

/**
 * Initia hackathon: native feature `auto-signing` (InterwovenKit).
 * Lets users enable session-style signing in the Initia testnet wallet UX.
 * EVM casino flows run on `evm-1` via wagmi; this complements the required Initia UX stack.
 */
import { TESTNET, useInterwovenKit } from "@/config/interwovenKit";
import { useAccount } from "wagmi";

const L1_CHAIN = TESTNET.defaultChainId;

export default function InitiaAutoSignControls() {
  const { isConnected } = useAccount();
  const { autoSign } = useInterwovenKit();

  if (!isConnected) {
    return null;
  }

  const enabled = Boolean(autoSign.isEnabledByChain?.[L1_CHAIN]);
  const loading = autoSign.isLoading;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-950/20 px-2 py-1.5 text-xs text-emerald-100/90">
      <span className="hidden sm:inline font-medium">Initia auto-sign</span>
      {enabled ? (
        <span className="text-emerald-300">On</span>
      ) : (
        <span className="text-white/60">Off</span>
      )}
      <button
        type="button"
        disabled={loading}
        onClick={async () => {
          try {
            if (enabled) {
              await autoSign.disable(L1_CHAIN);
            } else {
              await autoSign.enable(L1_CHAIN);
            }
          } catch (e) {
            console.warn("Initia auto-sign toggle:", e);
          }
        }}
        className="rounded bg-emerald-600/80 px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        {loading ? "…" : enabled ? "Disable" : "Enable"}
      </button>
    </div>
  );
}
