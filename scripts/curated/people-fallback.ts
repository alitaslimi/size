import type { UniverseItem } from "../../src/lib/universe";

/**
 * Fallback billionaire list used when the Forbes endpoint is unreachable.
 * Also used for crypto-native founders Forbes may not cover well.
 * Net-worth numbers are ballpark estimates.
 */
export const PEOPLE_FALLBACK: Array<Omit<UniverseItem, "updatedAt">> = [
  { id: "person-satoshi-wallets", name: "Satoshi's early wallets", v: 120_000_000, category: "person", kind: "wallet-balance", label: "dormant since 2010", note: "on-chain, unmoved", source: { kind: "curated" }, tags: ["crypto", "on-chain"] },
  { id: "person-vitalik", name: "Vitalik Buterin", v: 450_000_000, category: "person", kind: "wallet-balance", label: "public wallet + holdings", note: "public ETH wallet", source: { kind: "curated" }, tags: ["crypto", "founder"] },
  { id: "person-cz", name: "CZ", v: 2_100_000_000, category: "person", kind: "net-worth", label: "Binance founder, est. liquid", note: "public estimate", source: { kind: "curated" }, tags: ["crypto", "founder"] },
  { id: "person-bernard-arnault", name: "Bernard Arnault", v: 180_000_000_000, category: "person", kind: "net-worth", label: "LVMH founder", note: "net worth est.", source: { kind: "curated" }, tags: ["billionaire"] },
  { id: "person-jeff-bezos", name: "Jeff Bezos", v: 215_000_000_000, category: "person", kind: "net-worth", label: "Amazon founder", note: "net worth est.", source: { kind: "curated" }, tags: ["billionaire"] },
  { id: "person-elon-musk", name: "Elon Musk", v: 340_000_000_000, category: "person", kind: "net-worth", label: "Tesla / SpaceX / xAI", note: "net worth est.", source: { kind: "curated" }, tags: ["billionaire"] },
];
