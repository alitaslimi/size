import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { UniverseItem, UniverseFile } from "../src/lib/universe";
import { PEOPLE_FALLBACK } from "./curated/people-fallback";

const OUT = join(process.cwd(), "public", "data", "people.json");
const FORBES_RTB = "https://www.forbes.com/forbesapi/person/rtb/0/position/true.json";
/**
 * Names we want on the chart if Forbes returns them. Their order is preserved
 * and anyone missing from Forbes falls through to the curated fallback.
 */
const WANT_TOP = ["Elon Musk", "Jeff Bezos", "Bernard Arnault", "Mark Zuckerberg", "Larry Ellison"];

type ForbesPerson = {
  personName: string;
  finalWorth: number; // in millions USD
  uri: string;
  squareImage?: string;
  source?: string;
};

function normalizeForbesImage(raw: string): string {
  let s = raw.trim();
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("//")) return `https:${s}`;
  // strip any accidental leading slashes and prepend the CDN host
  s = s.replace(/^\/+/, "");
  return `https://specials-images.forbesimg.com/${s}`;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function fetchForbes(): Promise<ForbesPerson[] | null> {
  try {
    const res = await fetch(FORBES_RTB, {
      headers: {
        accept: "application/json",
        "user-agent":
          "Mozilla/5.0 (compatible; crypto-universe/1.0; +https://github.com/alitaslimi93/size)",
      },
    });
    if (!res.ok) {
      console.warn(`[fetch-people] Forbes ${res.status}; using fallback list`);
      return null;
    }
    const json = (await res.json()) as { personList?: { personsLists?: ForbesPerson[] } };
    const list = json.personList?.personsLists;
    if (!Array.isArray(list) || list.length === 0) return null;
    return list;
  } catch (err) {
    console.warn(`[fetch-people] Forbes request failed: ${(err as Error).message}`);
    return null;
  }
}

function forbesToItem(p: ForbesPerson, now: string): UniverseItem {
  const image = p.squareImage ? normalizeForbesImage(p.squareImage) : undefined;
  return {
    id: `person-${slugify(p.personName)}`,
    name: p.personName,
    v: Math.round((p.finalWorth ?? 0) * 1_000_000),
    category: "person",
    kind: "net-worth",
    label: p.source ?? "net worth est.",
    note: "Forbes Real-Time Billionaires",
    image,
    tags: ["billionaire"],
    source: { kind: "forbes", uri: p.uri ?? slugify(p.personName) },
    updatedAt: now,
  };
}

async function main() {
  const now = new Date().toISOString();
  const forbes = await fetchForbes();

  const items: UniverseItem[] = [];
  const seen = new Set<string>();

  if (forbes) {
    const wantSet = new Set(WANT_TOP);
    for (const p of forbes) {
      if (!wantSet.has(p.personName)) continue;
      const item = forbesToItem(p, now);
      items.push(item);
      seen.add(item.id);
    }
  }

  for (const base of PEOPLE_FALLBACK) {
    if (seen.has(base.id)) continue;
    items.push({ ...base, updatedAt: now });
  }

  const file: UniverseFile = { generatedAt: now, count: items.length, items };
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(file, null, 2) + "\n");
  console.log(`[fetch-people] wrote ${items.length} items → ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
