import { useEffect, useMemo, useRef, useState } from "react";
import type { UniverseItem } from "../lib/universe";
import { fmtUsd, logv, type ScaleMode } from "../lib/scale";

interface MinimapProps {
  /** Current scroll position in [0, 1]. */
  progress: number;
  /** Where the anchor (YOU) sits in [0, 1]. */
  anchorProgress: number;
  items: UniverseItem[];
  scale: ScaleMode;
  /** Called when the user clicks/drags to a new position. */
  onJump: (t: number, instant: boolean) => void;
  isMobile?: boolean;
}

export function Minimap({ progress, anchorProgress, items, scale, onJump, isMobile = false }: MinimapProps) {
  // On small screens we hide the ruler entirely — the scroll gesture and
  // tick labels inside the scene carry the scale on their own.
  if (isMobile) return null;
  const vMin = items[0]?.v ?? 1;
  const vMax = items[items.length - 1]?.v ?? 1;
  const logMin = logv(vMin);
  const logMax = logv(vMax);

  const ticks = useMemo(() => {
    if (scale === "linear") {
      return [0, 0.25, 0.5, 0.75, 1].map((s) => ({
        t: s,
        v: vMin + (vMax - vMin) * s,
      }));
    }
    const out: Array<{ t: number; v: number }> = [];
    const span = Math.max(1, logMax - logMin);
    for (let lv = Math.ceil(logMin); lv <= Math.floor(logMax); lv += 3) {
      const t = (lv - logMin) / span;
      out.push({ t, v: Math.pow(10, lv) });
    }
    return out;
  }, [scale, vMin, vMax, logMin, logMax]);

  const railRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const jumpFromEvent = (clientY: number) => {
    const el = railRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const t = Math.max(0, Math.min(1, (clientY - r.top) / r.height));
    onJump(t, true);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => jumpFromEvent(e.clientY);
    const onUp = () => setDragging(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging]);

  return (
    <div
      style={{
        position: "fixed",
        right: 28,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 40,
        height: "min(440px, 64vh)",
        display: "flex",
        alignItems: "stretch",
        gap: 10,
        fontFamily: "var(--font-mono)",
        userSelect: "none",
        touchAction: "none",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "relative",
          width: 52,
          fontSize: 10,
          color: "var(--cu-muted)",
        }}
      >
        {ticks.map((tk, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              right: 0,
              top: `${tk.t * 100}%`,
              transform: "translateY(-50%)",
              textAlign: "right",
              letterSpacing: 0.3,
            }}
          >
            {fmtUsd(tk.v)}
          </div>
        ))}
      </div>

      <div
        ref={railRef}
        onPointerDown={(e) => {
          setDragging(true);
          jumpFromEvent(e.clientY);
        }}
        role="slider"
        aria-label="Scale position"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        tabIndex={0}
        onKeyDown={(e) => {
          const step = e.shiftKey ? 0.1 : 0.02;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            onJump(Math.min(1, progress + step), false);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            onJump(Math.max(0, progress - step), false);
          } else if (e.key === "Home") {
            e.preventDefault();
            onJump(0, false);
          } else if (e.key === "End") {
            e.preventDefault();
            onJump(1, false);
          }
        }}
        style={{
          position: "relative",
          width: 2,
          background: "var(--cu-line-2)",
          borderRadius: 1,
          cursor: "pointer",
        }}
      >
        {ticks.map((tk, i) => (
          <div
            key={i}
            aria-hidden
            style={{
              position: "absolute",
              left: -3,
              right: -3,
              top: `${tk.t * 100}%`,
              height: 1,
              background: "oklch(0.7 0.01 60)",
              transform: "translateY(-50%)",
            }}
          />
        ))}

        <div
          aria-hidden
          style={{
            position: "absolute",
            left: "50%",
            top: `${anchorProgress * 100}%`,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--cu-accent)",
            transform: "translate(-50%, -50%)",
            boxShadow: "0 0 0 3px var(--cu-bg)",
            pointerEvents: "none",
          }}
        />

        <div
          onPointerDown={(e) => {
            e.stopPropagation();
            e.currentTarget.setPointerCapture?.(e.pointerId);
            setDragging(true);
          }}
          style={{
            position: "absolute",
            left: "50%",
            top: `${progress * 100}%`,
            transform: "translate(-50%, -50%)",
            cursor: dragging ? "grabbing" : "grab",
            touchAction: "none",
            // Expand hit area well beyond the visible puck for touch.
            padding: 12,
            margin: -12,
          }}
        >
          <div
            style={{
              width: dragging ? 22 : 18,
              height: dragging ? 22 : 18,
              borderRadius: "50%",
              background: "white",
              border: "1.5px solid oklch(0.22 0.01 60)",
              boxShadow: dragging
                ? "0 4px 14px rgba(0,0,0,0.22), 0 0 0 4px oklch(0.94 0.01 60)"
                : "0 1px 4px rgba(0,0,0,0.12)",
              transition: "width 140ms, height 140ms, box-shadow 140ms",
            }}
          />
        </div>
      </div>
    </div>
  );
}
