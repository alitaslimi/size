import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { UniverseItem, UniverseFile } from "../src/lib/universe";
import { COINS, type CoinEntry } from "./curated/coins-config";

const OUT = join(process.cwd(), "public", "data", "coins.json");
const API = "https://api.coingecko.com/api/v3/coins/markets";

interface CGMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  circulating_supply: number;
}

async function fetchMarkets(ids: string[]): Promise<CGMarket[]> {
  const url = new URL(API);
  url.searchParams.set("vs_currency", "usd");
  url.searchParams.set("ids", ids.join(","));
  url.searchParams.set("order", "market_cap_desc");
  url.searchParams.set("per_page", String(ids.length));
  url.searchParams.set("page", "1");
  url.searchParams.set("sparkline", "false");

  const res = await fetch(url, {
    headers: { accept: "application/json", "user-agent": "crypto-universe (github.com/alitaslimi93/size)" },
  });
  if (!res.ok) throw new Error(`CoinGecko ${res.status}: ${await res.text()}`);
  return (await res.json()) as CGMarket[];
}

function rowFor(entry: CoinEntry, market: CGMarket, now: string): UniverseItem | null {
  let v: number;
  if (entry.kind === "price") v = market.current_price;
  else if (entry.kind === "market-cap") v = market.market_cap;
  else v = (market.circulating_supply ?? 0) * (market.current_price ?? 0);

  if (!Number.isFinite(v) || v <= 0) return null;

  const idSuffix = entry.variant ? `-${entry.variant}` : "";
  const displayName =
    entry.name ?? (entry.kind === "price" ? market.symbol.toUpperCase() : market.name);

  return {
    id: `coin-${entry.cgId}${idSuffix}`,
    name: displayName,
    v,
    category: "coin",
    kind: entry.kind === "supply" ? "circulating-supply" : entry.kind,
    label: entry.label,
    note: entry.note,
    image: market.image,
    tags: entry.tags,
    source: { kind: "coingecko", id: entry.cgId },
    updatedAt: now,
  };
}

async function main() {
  const uniqueIds = [...new Set(COINS.map((c) => c.cgId))];
  const markets = await fetchMarkets(uniqueIds);
  const byId = new Map(markets.map((m) => [m.id, m]));

  const now = new Date().toISOString();
  const items: UniverseItem[] = [];
  for (const entry of COINS) {
    const market = byId.get(entry.cgId);
    if (!market) {
      console.warn(`[fetch-coins] no market data for ${entry.cgId}`);
      continue;
    }
    const row = rowFor(entry, market, now);
    if (row) items.push(row);
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
