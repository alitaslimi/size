import type { Category } from "./universe";

export type ScaleMode = "log" | "linear";

export function fmtUsd(v: number): string {
  if (v === 0) return "$0";
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (abs >= 1e12) return `${sign}$${trim(v / 1e12, abs >= 1e13 ? 0 : 1)}T`;
  if (abs >= 1e9) return `${sign}$${trim(v / 1e9, abs >= 1e10 ? 0 : 1)}B`;
  if (abs >= 1e6) return `${sign}$${trim(v / 1e6, abs >= 1e7 ? 0 : 1)}M`;
  if (abs >= 1e3) return `${sign}$${trim(v / 1e3, abs >= 1e4 ? 0 : 1)}K`;
  if (abs >= 1) return `${sign}$${v.toFixed(abs >= 10 ? 0 : 2)}`;
  if (abs >= 0.01) return `${sign}$${v.toFixed(2)}`;
  // tiny values → scientific with a unicode exponent
  return `${sign}$${v.toExponential(1).replace("e-", "·10⁻").replace("e+", "·10")}`;
}

function trim(n: number, digits: number): string {
  return n.toFixed(digits).replace(/\.0+$/, "");
}

export function ratio(a: number, anchor: number): string {
  if (anchor === 0) return "—";
  const r = a / anchor;
  if (r >= 1) {
    if (r >= 1e12) return `${trim(r / 1e12, 1)}T×`;
    if (r >= 1e9) return `${trim(r / 1e9, 1)}B×`;
    if (r >= 1e6) return `${trim(r / 1e6, 1)}M×`;
    if (r >= 1e3) return `${trim(r / 1e3, 1)}K×`;
    if (r >= 10) return `${Math.round(r)}×`;
    return `${trim(r, 1)}×`;
  }
  const inv = 1 / r;
  if (inv >= 1e6) return `1 / ${(inv / 1e6).toFixed(0)}M`;
  if (inv >= 1e3) return `1 / ${(inv / 1e3).toFixed(0)}K`;
  return `1 / ${inv.toFixed(0)}`;
}

export const logv = (v: number) => Math.log10(Math.max(v, 1e-10));

/** Position of `v` in `[vMin, vMax]` as t ∈ [0, 1] for the selected scale. */
export function pos(v: number, vMin: number, vMax: number, mode: ScaleMode): number {
  if (mode === "linear") {
    return (Math.max(v, 0) - vMin) / (vMax - vMin);
  }
  const lMin = logv(vMin);
  const lMax = logv(vMax);
  return (logv(v) - lMin) / (lMax - lMin);
}

export const CATEGORY_COLOR: Record<Category, string> = {
  coin: "var(--cu-cat-coin)",
  project: "var(--cu-cat-project)",
  person: "var(--cu-cat-person)",
  ref: "var(--cu-cat-ref)",
  you: "var(--cu-cat-you)",
};

export const CATEGORY_TINT: Record<Category, string> = {
  coin: "var(--cu-tint-coin)",
  project: "var(--cu-tint-project)",
  person: "var(--cu-tint-person)",
  ref: "var(--cu-tint-ref)",
  you: "var(--cu-tint-you)",
};

/** Two-letter monogram used when an item has no image. */
export function glyph(name: string): string {
  const cleaned = name.replace(/[^A-Za-z0-9]/g, "");
  if (cleaned.length === 0) return "?";
  const first = cleaned[0];
  const second = cleaned.length > 3 ? cleaned[1] : "";
  return (first + second).toUpperCase();
}
