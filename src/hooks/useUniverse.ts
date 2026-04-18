import { useEffect, useState } from "react";
import type { UniverseFile, UniverseItem } from "../lib/universe";

interface State {
  status: "loading" | "ready" | "error";
  items: UniverseItem[];
  generatedAt?: string;
  error?: string;
}

const DATA_URL = `${import.meta.env.BASE_URL}data/universe.json`;

export function useUniverse(): State {
  const [state, setState] = useState<State>({ status: "loading", items: [] });

  useEffect(() => {
    let cancelled = false;
    fetch(DATA_URL, { cache: "default" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<UniverseFile>;
      })
      .then((file) => {
        if (cancelled) return;
        setState({
          status: "ready",
          items: file.items,
          generatedAt: file.generatedAt,
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({ status: "error", items: [], error: (err as Error).message });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
