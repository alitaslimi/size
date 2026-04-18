import type { UniverseItem } from "../../src/lib/universe";

/**
 * Human-scale anchors and non-crypto reference points.
 * Values are ballpark; we update them when the world changes.
 */
export const REFERENCES: Array<Omit<UniverseItem, "updatedAt">> = [
  { id: "ref-shrimp-dust", name: "Shrimp dust", v: 1e-7, category: "ref", kind: "reference", label: "a single satoshi's shadow", note: "smallest meaningful crypto unit", source: { kind: "curated" } },
  { id: "ref-penny", name: "A penny", v: 0.01, category: "ref", kind: "reference", label: "one US cent", note: "human reference", source: { kind: "curated" } },
  { id: "ref-burrito", name: "A burrito", v: 12, category: "ref", kind: "reference", label: "lunch", note: "human reference", source: { kind: "curated" } },
  { id: "ref-avg-wallet", name: "Avg wallet", v: 1_000, category: "ref", kind: "reference", label: "median active wallet", note: "on-chain estimate", source: { kind: "curated" } },
  { id: "ref-top-1pct-wallet", name: "Top 1% wallet", v: 250_000, category: "ref", kind: "reference", label: "US household, top 1%", note: "net worth cutoff", source: { kind: "curated" } },
  { id: "ref-seed-check", name: "Avg VC seed check", v: 25_000_000, category: "ref", kind: "reference", label: "2026 seed round", note: "reference anchor", source: { kind: "curated" } },
  { id: "ref-nft-record", name: "Bored Ape #8817", v: 5_000_000, category: "project", kind: "reference", label: "highest NFT sale", note: "single-asset record", source: { kind: "curated" } },
  { id: "ref-italy-gdp", name: "Italy GDP", v: 2.1e12, category: "ref", kind: "gdp", label: "annual GDP", note: "country reference", source: { kind: "curated" } },
  { id: "ref-japan-gdp", name: "Japan GDP", v: 4.7e12, category: "ref", kind: "gdp", label: "annual GDP", note: "country reference", source: { kind: "curated" } },
  { id: "ref-china-gdp", name: "China GDP", v: 19.8e12, category: "ref", kind: "gdp", label: "annual GDP", note: "country reference", source: { kind: "curated" } },
  { id: "ref-usa-gdp", name: "USA GDP", v: 29.5e12, category: "ref", kind: "gdp", label: "annual GDP", note: "country reference", source: { kind: "curated" } },
  { id: "ref-world-gdp", name: "World GDP", v: 110e12, category: "ref", kind: "gdp", label: "global annual GDP", note: "planetary scale", source: { kind: "curated" } },
  { id: "ref-global-wealth", name: "Global wealth", v: 900e12, category: "ref", kind: "reference", label: "all assets, all people", note: "estimate", source: { kind: "curated" } },
  { id: "ref-apple-mcap", name: "Apple", v: 4.2e12, category: "ref", kind: "market-cap", label: "market cap", note: "for scale", source: { kind: "curated" } },
  { id: "ref-gold", name: "All gold mined", v: 13.5e12, category: "ref", kind: "reference", label: "ever, worldwide", note: "~213,000 tonnes", source: { kind: "curated" } },
  { id: "ref-uniswap-treasury", name: "Uniswap Treasury", v: 800e6, category: "project", kind: "treasury", label: "DAO treasury", note: "on-chain", source: { kind: "curated" } },
];
