import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { UniverseItem, UniverseFile } from "../src/lib/universe";
import { REFERENCES } from "./curated/references";

const OUT = join(process.cwd(), "public", "data", "references.json");

async function main() {
  const now = new Date().toISOString();
  const items: UniverseItem[] = REFERENCES.map((r) => ({ ...r, updatedAt: now }));
  const file: UniverseFile = { generatedAt: now, count: items.length, items };
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(file, null, 2) + "\n");
  console.log(`[build-references] wrote ${items.length} items → ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
