import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { UniverseItem, UniverseFile } from "../src/lib/universe";

const OUT = join(process.cwd(), "public", "data", "coins.json");
const API = "https://api.coingecko.com/api/v3/coins/markets";
const TOP_N = 200;

interface CGMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  circulating_supply: number;
}

async function fetchMarkets(limit: number): Promise<CGMarket[]> {
  const url = new URL(API);
  url.searchParams.set("vs_currency", "usd");
  url.searchParams.set("order", "market_cap_desc");
  url.searchParams.set("per_page", String(limit));
  url.searchParams.set("page", "1");
  url.searchParams.set("sparkline", "false");
  url.searchParams.set("locale", "en");

  const res = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": "crypto-universe (https://github.com/alitaslimi/size)",
    },
  });
  if (!res.ok) throw new Error(`CoinGecko ${res.status}: ${await res.text()}`);
  return (await res.json()) as CGMarket[];
}

/** Light category tagging derived from well-known coin ids. */
function tagsFor(id: string, symbol: string): string[] {
  const tags: string[] = [];
  const stables = new Set(["tether", "usd-coin", "dai", "first-digital-usd", "usd-coin-ethereum-bridged", "paypal-usd", "frax", "ethena-usde", "true-usd"]);
  const memes = new Set(["dogecoin", "shiba-inu", "pepe", "bonk", "dogwifcoin", "floki", "book-of-meme"]);
  const l1s = new Set(["bitcoin", "ethereum", "solana", "cardano", "avalanche-2", "polkadot", "near", "sui", "tron", "ton", "aptos"]);
  if (stables.has(id)) tags.push("stablecoin");
  if (memes.has(id)) tags.push("memecoin");
  if (l1s.has(id)) tags.push("L1");
  const wrappedSyms = new Set(["WBTC", "WETH", "STETH", "WEETH", "WSTETH", "CBBTC"]);
  if (wrappedSyms.has(symbol.toUpperCase())) tags.push("wrapped");
  return tags;
}

async function main() {
  const markets = await fetchMarkets(TOP_N);
  const now = new Date().toISOString();

  const items: UniverseItem[] = [];
  for (const m of markets) {
    const v = m.market_cap;
    if (!Number.isFinite(v) || v <= 0) continue;
    items.push({
      id: `coin-${m.id}`,
      name: m.name,
      v,
      category: "coin",
      kind: "market-cap",
      label: `#${m.market_cap_rank} · market cap`,
      note: m.symbol?.toUpperCase(),
      image: m.image,
      tags: tagsFor(m.id, m.symbol),
      source: { kind: "coingecko", id: m.id },
      updatedAt: now,
    });
  }

  const file: UniverseFile = { generatedAt: now, count: items.length, items };
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(file, null, 2) + "\n");
  console.log(`[fetch-coins] wrote ${items.length} items → ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
