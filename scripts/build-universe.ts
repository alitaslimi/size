import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import type { UniverseItem, UniverseFile } from "../src/lib/universe";

const DATA_DIR = join(process.cwd(), "public", "data");
const SOURCES = ["coins.json", "people.json", "references.json"];
const OUT = join(DATA_DIR, "universe.json");

async function loadSource(name: string): Promise<UniverseItem[]> {
  const path = join(DATA_DIR, name);
  if (!existsSync(path)) {
    console.warn(`[build-universe] missing ${name} — skipping`);
    return [];
  }
  const raw = await readFile(path, "utf8");
  const file = JSON.parse(raw) as UniverseFile;
  return file.items ?? [];
}

async function main() {
  const now = new Date().toISOString();
  const all: UniverseItem[] = [];
  const seen = new Set<string>();

  for (const name of SOURCES) {
    const items = await loadSource(name);
    for (const it of items) {
      if (seen.has(it.id)) continue;
      seen.add(it.id);
      all.push(it);
    }
  }

  all.sort((a, b) => a.v - b.v);

  const file: UniverseFile = { generatedAt: now, count: all.length, items: all };
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(file) + "\n"); // minified: this is the one the browser loads
  console.log(`[build-universe] wrote ${all.length} items → ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
