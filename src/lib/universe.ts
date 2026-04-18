export type Category = "coin" | "project" | "person" | "ref" | "you";

export type ValueKind =
  | "market-cap"
  | "price"
  | "circulating-supply"
  | "treasury"
  | "tvl"
  | "net-worth"
  | "wallet-balance"
  | "gdp"
  | "reference";

export type Source =
  | { kind: "coingecko"; id: string }
  | { kind: "forbes"; uri: string }
  | { kind: "curated" }
  | { kind: "user" };

export interface UniverseItem {
  id: string;
  name: string;
  /** USD value used to place the item on the scale. */
  v: number;
  category: Category;
  /** What the value represents (e.g. market cap vs. per-token price). */
  kind: ValueKind;
  /** Short subtitle rendered next to the category pill. */
  label: string;
  /** Italic caption under the value. */
  note?: string;
  /** Remote image URL (coin logo, headshot). Falls back to glyph if missing. */
  image?: string;
  /** Free-form tags for filtering / search (e.g. "defi", "stablecoin"). */
  tags?: string[];
  /** Where this row came from + how to refresh it. */
  source: Source;
  /** ISO timestamp of the last refresh. */
  updatedAt: string;
}

export interface UniverseFile {
  generatedAt: string;
  count: number;
  items: UniverseItem[];
}

export const CATEGORY_LABEL: Record<Category, string> = {
  coin: "Coin",
  project: "Project",
  person: "Person",
  ref: "Reference",
  you: "You",
};

export const CATEGORY_LABEL_PLURAL: Record<Category, string> = {
  coin: "Coins",
  project: "Projects",
  person: "People",
  ref: "References",
  you: "You",
};
