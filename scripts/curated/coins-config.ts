/**
 * Whitelist of crypto assets we pull from CoinGecko, with per-asset intent.
 *
 * - "price"      → use current price (good for per-token reference like SHIB, BTC, ETH)
 * - "market-cap" → use total market cap (good for DOGE, XRP, Solana as a network)
 * - "supply"     → use circulating supply × price (for stablecoins)
 *
 * Some assets appear twice (e.g. BTC has both a per-token price row and a total
 * market-cap row) because both sizes are interesting.
 */
export interface CoinEntry {
  /** CoinGecko coin id. */
  cgId: string;
  /** Display name override (CoinGecko's `name` if omitted). */
  name?: string;
  kind: "price" | "market-cap" | "supply";
  label: string;
  note?: string;
  tags?: string[];
  /** Stable id suffix so one cgId can produce multiple rows. */
  variant?: string;
}

export const COINS: CoinEntry[] = [
  // per-token prices
  { cgId: "shiba-inu", kind: "price", label: "Shiba Inu · 1 token", note: "per-token price", tags: ["memecoin"] },
  { cgId: "pepe", kind: "price", label: "Pepe · 1 token", note: "per-token price", tags: ["memecoin"] },
  { cgId: "dogecoin", variant: "price", kind: "price", label: "Dogecoin · 1 token", note: "per-token price", tags: ["memecoin"] },
  { cgId: "solana", variant: "price", kind: "price", label: "Solana · 1 token", note: "per-token price", tags: ["L1"] },
  { cgId: "ethereum", variant: "price", kind: "price", label: "Ethereum · 1 token", note: "per-token price", tags: ["L1"] },
  { cgId: "bitcoin", variant: "price", kind: "price", label: "Bitcoin · 1 token", note: "per-token price", tags: ["L1"] },

  // market caps / supplies
  { cgId: "aave", kind: "market-cap", label: "market cap", note: "DeFi blue chip", tags: ["defi"] },
  { cgId: "dogecoin", variant: "mcap", kind: "market-cap", label: "market cap", note: "memecoin index", tags: ["memecoin"] },
  { cgId: "ripple", kind: "market-cap", label: "market cap", note: "payments rail", tags: ["payments"] },
  { cgId: "solana", variant: "mcap", kind: "market-cap", label: "market cap", note: "L1", tags: ["L1"] },
  { cgId: "usd-coin", kind: "supply", label: "circulating supply", note: "stablecoin", tags: ["stablecoin"] },
  { cgId: "tether", kind: "supply", label: "circulating supply", note: "stablecoin", tags: ["stablecoin"] },
  { cgId: "ethereum", variant: "mcap", kind: "market-cap", label: "total market cap", note: "L1", tags: ["L1"] },
  { cgId: "bitcoin", variant: "mcap", kind: "market-cap", label: "total market cap", note: "digital gold", tags: ["L1"] },
];
