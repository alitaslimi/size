import { useEffect, useMemo, useRef, useState } from "react";
import { ParallaxScene, type ParallaxSceneHandle } from "./components/ParallaxScene";
import { Header } from "./components/Header";
import { FilterPills, type FilterState } from "./components/FilterPills";
import { ScaleToggle } from "./components/ScaleToggle";
import { AnchorBadge } from "./components/AnchorBadge";
import { ScrollHint } from "./components/ScrollHint";
import { Minimap } from "./components/Minimap";
import { useUniverse } from "./hooks/useUniverse";
import type { UniverseItem } from "./lib/universe";
import { pos, type ScaleMode } from "./lib/scale";

const DEFAULT_ANCHOR = 1_000_000;

const DEFAULT_FILTERS: FilterState = {
  coin: true,
  project: true,
  person: true,
  ref: true,
};

function youItem(anchor: number): UniverseItem {
  return {
    id: "you",
    name: "YOU",
    v: anchor,
    category: "you",
    kind: "reference",
    label: "your size",
    note: "let's say you're a millionaire",
    source: { kind: "user" },
    updatedAt: new Date().toISOString(),
  };
}

function App() {
  const { status, items } = useUniverse();
  const [anchor] = useState(DEFAULT_ANCHOR);
  const [scale, setScale] = useState<ScaleMode>("log");
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [progress, setProgress] = useState(0.5);
  const [showHint, setShowHint] = useState(true);

  const sceneRef = useRef<ParallaxSceneHandle>(null);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 4500);
    return () => clearTimeout(t);
  }, []);

  const allItems = useMemo(() => {
    return [...items, youItem(anchor)].sort((a, b) => a.v - b.v);
  }, [items, anchor]);

  const visibleItems = useMemo(
    () => allItems.filter((it) => it.category === "you" || filters[it.category]),
    [allItems, filters]
  );

  const anchorProgress = useMemo(() => {
    if (allItems.length === 0) return 0.5;
    const vMin = allItems[0].v;
    const vMax = allItems[allItems.length - 1].v;
    return pos(anchor, vMin, vMax, scale);
  }, [allItems, anchor, scale]);

  if (status === "loading" || allItems.length === 0) {
    return (
      <div
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
    <>
      <ParallaxScene
        // Remount when the x-axis scale changes so positions recompute cleanly.
        key={`${scale}:${allItems.length}`}
        ref={sceneRef}
        items={visibleItems}
        anchor={anchor}
        scale={scale}
        initialT={anchorProgress}
        onProgressChange={setProgress}
      />
      <Header />
      <FilterPills filters={filters} onChange={setFilters} />
      <ScaleToggle scale={scale} onChange={setScale} />
      <Minimap
        progress={progress}
        anchorProgress={anchorProgress}
        items={allItems}
        scale={scale}
        onJump={(t, instant) => sceneRef.current?.jumpTo(t, instant)}
      />
      <AnchorBadge anchor={anchor} />
      <ScrollHint visible={showHint} />
    </>
  );
}

export default App;
