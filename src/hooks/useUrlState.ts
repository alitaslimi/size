import { useEffect, useRef } from "react";
import type { FilterState } from "../components/FilterPills";
import type { ScaleMode } from "../lib/scale";

export interface AppUrlState {
  anchor: number;
  scale: ScaleMode;
  filters: FilterState;
}

const ALL_FILTER_KEYS = ["coin", "project", "person", "ref"] as const;
type FilterKey = (typeof ALL_FILTER_KEYS)[number];

export function readUrlState(defaults: AppUrlState): AppUrlState {
  if (typeof window === "undefined") return defaults;
  const p = new URLSearchParams(window.location.search);

  const anchorRaw = p.get("anchor");
  const anchor = anchorRaw ? Number(anchorRaw) : NaN;
  const safeAnchor = Number.isFinite(anchor) && anchor > 0 ? anchor : defaults.anchor;

  const scaleRaw = p.get("scale");
  const safeScale: ScaleMode = scaleRaw === "linear" || scaleRaw === "log" ? scaleRaw : defaults.scale;

  const fRaw = p.get("f");
  let safeFilters: FilterState = defaults.filters;
  if (fRaw != null) {
    const set = new Set(fRaw.split(",").filter(Boolean) as FilterKey[]);
    const built: FilterState = { coin: false, project: false, person: false, ref: false };
    for (const k of ALL_FILTER_KEYS) built[k] = set.has(k);
    safeFilters = built;
  }

  return { anchor: safeAnchor, scale: safeScale, filters: safeFilters };
}

function stateToParams(state: AppUrlState, defaults: AppUrlState): URLSearchParams {
  const p = new URLSearchParams();
  if (state.anchor !== defaults.anchor) p.set("anchor", String(state.anchor));
  if (state.scale !== defaults.scale) p.set("scale", state.scale);
  const enabled = ALL_FILTER_KEYS.filter((k) => state.filters[k]);
  const allOn = enabled.length === ALL_FILTER_KEYS.length;
  if (!allOn) p.set("f", enabled.join(","));
  return p;
}

/**
 * Writes the app state to the URL (`history.replaceState`, debounced) and
 * syncs back when the user hits back/forward. On mount we do nothing — the
 * initial read should happen via `readUrlState` so React owns state after that.
 */
export function useUrlState(
  state: AppUrlState,
  defaults: AppUrlState,
  onPop: (next: AppUrlState) => void
): void {
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const handler = () => onPop(readUrlState(defaults));
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [defaults, onPop]);

  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const p = stateToParams(state, defaults);
      const qs = p.toString();
      const next = qs ? `?${qs}` : window.location.pathname;
      window.history.replaceState(null, "", next);
    }, 200);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [state, defaults]);
}
