import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ZoomScene, type ZoomSceneHandle } from "./components/ZoomScene";
import { Header } from "./components/Header";
import { FilterPills, type FilterState } from "./components/FilterPills";
import { ScrollHint } from "./components/ScrollHint";
import { Minimap } from "./components/Minimap";
import { useIsMobile } from "./hooks/useIsMobile";
import { useUniverse } from "./hooks/useUniverse";
import { readUrlState, useUrlState, type AppUrlState } from "./hooks/useUrlState";
import type { UniverseItem } from "./lib/universe";
import { pos } from "./lib/scale";

const YOU_VALUE = 10_000;

const DEFAULTS: AppUrlState = {
  anchor: YOU_VALUE,
  scale: "log",
  filters: { coin: true, project: true, person: true, ref: true },
};

const YOU: UniverseItem = {
  id: "you",
  name: "YOU",
  v: YOU_VALUE,
  category: "you",
  kind: "reference",
  label: "your size",
  note: "your size is not size",
  source: { kind: "user" },
  updatedAt: new Date(0).toISOString(),
};

function App() {
  const { status, items } = useUniverse();
  const initial = useMemo(() => readUrlState(DEFAULTS), []);

  const [filters, setFilters] = useState<FilterState>(initial.filters);
  const [progress, setProgress] = useState(0.5);
  const [showHint, setShowHint] = useState(true);
  const isMobile = useIsMobile();

  const sceneRef = useRef<ZoomSceneHandle>(null);

  const onPopState = useCallback((next: AppUrlState) => {
    setFilters(next.filters);
  }, []);

  useUrlState({ anchor: YOU_VALUE, scale: "log", filters }, DEFAULTS, onPopState);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 4500);
    return () => clearTimeout(t);
  }, []);

  const allItems = useMemo(() => {
    return [...items, YOU].sort((a, b) => a.v - b.v);
  }, [items]);

  const visibleItems = useMemo(
    () => allItems.filter((it) => it.category === "you" || filters[it.category]),
    [allItems, filters]
  );

  const youProgress = useMemo(() => {
    if (allItems.length === 0) return 0.5;
    const vMin = allItems[0].v;
    const vMax = allItems[allItems.length - 1].v;
    return pos(YOU_VALUE, vMin, vMax, "log");
  }, [allItems]);

  if (status === "loading" || allItems.length === 0) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          position: "fixed",
          inset: 0,
          display: "grid",
          placeItems: "center",
          fontFamily: "var(--font-serif)",
          color: "var(--cu-muted)",
          fontSize: 18,
        }}
      >
        loading the universe…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        role="alert"
        style={{
          position: "fixed",
          inset: 0,
          display: "grid",
          placeItems: "center",
          fontFamily: "var(--font-mono)",
          color: "var(--cu-muted)",
          fontSize: 13,
        }}
      >
        couldn't load universe data
      </div>
    );
  }

  return (
    <main>
      <ZoomScene
        key={`${isMobile ? "m" : "d"}:${allItems.length}`}
        ref={sceneRef}
        items={visibleItems}
        initialT={youProgress}
        onProgressChange={setProgress}
        isMobile={isMobile}
      />
      <Header isMobile={isMobile} />
      <FilterPills filters={filters} onChange={setFilters} isMobile={isMobile} />
      <Minimap
        progress={progress}
        anchorProgress={youProgress}
        items={allItems}
        scale="log"
        onJump={(t, instant) => sceneRef.current?.jumpTo(t, instant)}
        isMobile={isMobile}
      />
      <ScrollHint visible={showHint} />
    </main>
  );
}

export default App;
