import type { UniverseItem } from "./lib/universe";
import { Disc } from "./components/Disc";
import { DiscMeta } from "./components/DiscMeta";

const NOW = new Date().toISOString();

const DEMO: UniverseItem[] = [
  {
    id: "demo-btc",
    name: "Bitcoin",
    v: 68_000,
    category: "coin",
    kind: "price",
    label: "Bitcoin · 1 token",
    note: "per-token price",
    image: "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png",
    source: { kind: "coingecko", id: "bitcoin" },
    updatedAt: NOW,
  },
  {
    id: "demo-you",
    name: "YOU",
    v: 1_000_000,
    category: "you",
    kind: "reference",
    label: "your size",
    note: "let's say you're a millionaire",
    source: { kind: "user" },
    updatedAt: NOW,
  },
  {
    id: "demo-musk",
    name: "Elon Musk",
    v: 340_000_000_000,
    category: "person",
    kind: "net-worth",
    label: "Tesla / SpaceX / xAI",
    note: "net worth est.",
    source: { kind: "curated" },
    updatedAt: NOW,
  },
];

function App() {
  return (
    <div style={{ padding: 40, display: "flex", flexDirection: "column", gap: 48, height: "100vh", overflow: "auto" }}>
      {DEMO.map((item) => (
        <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <Disc item={item} size={180} halo={item.category === "you"} />
          <DiscMeta item={item} anchor={1_000_000} />
        </div>
      ))}
    </div>
  );
}

export default App;
