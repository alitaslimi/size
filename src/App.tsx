import { useMemo, useState } from "react";
import { ParallaxScene } from "./components/ParallaxScene";
import { useUniverse } from "./hooks/useUniverse";
import type { UniverseItem } from "./lib/universe";
import { pos, type ScaleMode } from "./lib/scale";

const DEFAULT_ANCHOR = 1_000_000;

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
  const [scale] = useState<ScaleMode>("log");

  const sceneItems = useMemo(() => {
    const sorted = [...items, youItem(anchor)].sort((a, b) => a.v - b.v);
    return sorted;
  }, [items, anchor]);

  const anchorProgress = useMemo(() => {
    if (sceneItems.length === 0) return 0.5;
    const vMin = sceneItems[0].v;
    const vMax = sceneItems[sceneItems.length - 1].v;
    return pos(anchor, vMin, vMax, scale);
  }, [sceneItems, anchor, scale]);

  if (status === "loading" || sceneItems.length === 0) {
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
    <ParallaxScene
      items={sceneItems}
      anchor={anchor}
      scale={scale}
      initialT={anchorProgress}
    />
  );
}

export default App;
