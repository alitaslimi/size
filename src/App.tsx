import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ParallaxScene, type ParallaxSceneHandle } from "./components/ParallaxScene";
import { Header } from "./components/Header";
import { FilterPills, type FilterState } from "./components/FilterPills";
import { ScaleToggle } from "./components/ScaleToggle";
import { AnchorBadge } from "./components/AnchorBadge";
import { ScrollHint } from "./components/ScrollHint";
import { Minimap } from "./components/Minimap";
import { AnchorPicker } from "./components/AnchorPicker";
import { useIsMobile } from "./hooks/useIsMobile";
import { useUniverse } from "./hooks/useUniverse";
import { readUrlState, useUrlState, type AppUrlState } from "./hooks/useUrlState";
import type { UniverseItem } from "./lib/universe";
import { pos, type ScaleMode } from "./lib/scale";

const DEFAULTS: AppUrlState = {
  anchor: 1_000_000,
  scale: "log",
  filters: { coin: true, project: true, person: true, ref: true },
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
  const initial = useMemo(() => readUrlState(DEFAULTS), []);

  const [anchor, setAnchor] = useState<number>(initial.anchor);
  const [scale, setScale] = useState<ScaleMode>(initial.scale);
  const [filters, setFilters] = useState<FilterState>(initial.filters);
  const [progress, setProgress] = useState(0.5);
  const [showHint, setShowHint] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const isMobile = useIsMobile();

  const sceneRef = useRef<ParallaxSceneHandle>(null);

  const onPopState = useCallback((next: AppUrlState) => {
    setAnchor(next.anchor);
    setScale(next.scale);
    setFilters(next.filters);
  }, []);

  useUrlState({ anchor, scale, filters }, DEFAULTS, onPopState);

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
      <ParallaxScene
        // Remount when scale, anchor, or viewport mode changes so positions
        // recompute and the scene re-centers on the anchor.
        key={`${scale}:${anchor}:${isMobile ? "m" : "d"}:${allItems.length}`}
        ref={sceneRef}
        items={visibleItems}
        anchor={anchor}
        scale={scale}
        initialT={anchorProgress}
        onProgressChange={setProgress}
        isMobile={isMobile}
      />
      <Header isMobile={isMobile} />
      <FilterPills filters={filters} onChange={setFilters} isMobile={isMobile} />
      <ScaleToggle scale={scale} onChange={setScale} isMobile={isMobile} />
      <Minimap
        progress={progress}
        anchorProgress={anchorProgress}
        items={allItems}
        scale={scale}
        onJump={(t, instant) => sceneRef.current?.jumpTo(t, instant)}
        isMobile={isMobile}
      />
      <AnchorBadge anchor={anchor} onClick={() => setPickerOpen((o) => !o)} />
      {pickerOpen && (
        <AnchorPicker
          anchor={anchor}
          onChange={setAnchor}
          onClose={() => setPickerOpen(false)}
        />
      )}
      <ScrollHint visible={showHint && !pickerOpen} />
    </main>
  );
}

export default App;
