/**
 * Canonical production app origin (Vercel). Override with NEXT_PUBLIC_APP_URL for forks / staging.
 */
export const PUBLIC_APP_ORIGIN_DEFAULT = "https://apt-casino-initia.vercel.app";

export function getPublicAppOrigin() {
  const fromEnv =
    typeof process !== "undefined" && process.env?.NEXT_PUBLIC_APP_URL
      ? String(process.env.NEXT_PUBLIC_APP_URL).replace(/\/$/, "")
      : "";
  return fromEnv || PUBLIC_APP_ORIGIN_DEFAULT;
}

/**
 * Public marketing and deck URLs.
 * Override the pitch deck in the UI with NEXT_PUBLIC_PITCH_DECK_URL (optional).
 */
export const PITCH_DECK_FIGMA_URL =
  "https://www.figma.com/deck/MaNXzpdQG9Xu00r9LHuT1w/APT-Casino-Initia?node-id=1-1812&p=f&t=lw2ZfabwT0TwgRfK-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1";

export function getPitchDeckUrl() {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_PITCH_DECK_URL) {
    return process.env.NEXT_PUBLIC_PITCH_DECK_URL;
  }
  return PITCH_DECK_FIGMA_URL;
}

/** Hackathon / product demo (YouTube). Override with NEXT_PUBLIC_DEMO_VIDEO_URL. */
export const DEMO_VIDEO_URL_DEFAULT = "https://youtu.be/hkBWR4cIVak";

export function getDemoVideoUrl() {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_DEMO_VIDEO_URL) {
    return String(process.env.NEXT_PUBLIC_DEMO_VIDEO_URL).trim();
  }
  return DEMO_VIDEO_URL_DEFAULT;
}
