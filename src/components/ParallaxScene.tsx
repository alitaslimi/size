import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type Ref,
} from "react";
import type { UniverseItem } from "../lib/universe";
import { fmtUsd, logv, pos, type ScaleMode } from "../lib/scale";
import { Disc } from "./Disc";
import { DiscMeta } from "./DiscMeta";

export interface ParallaxSceneHandle {
  jumpTo: (t: number, instant?: boolean) => void;
}

interface ParallaxSceneProps {
  items: UniverseItem[];
  anchor: number;
  scale: ScaleMode;
  /** Starting scroll position in [0, 1]; only used on mount. */
  initialT?: number;
  /** Called with the current scroll progress in [0, 1]. */
  onProgressChange?: (t: number) => void;
  /** Mobile layout: stack disc + meta centered, smaller max size. */
  isMobile?: boolean;
  ref?: Ref<ParallaxSceneHandle>;
}

function easeInOutQuad(k: number): number {
  return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
}

function animateScroll(el: HTMLElement, target: number, dur = 700) {
  const start = el.scrollTop;
  const delta = target - start;
  const t0 = performance.now();
  function step(now: number) {
    const k = Math.min(1, (now - t0) / dur);
    el.scrollTop = start + delta * easeInOutQuad(k);
    if (k < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

export function ParallaxScene({
  items,
  anchor,
  scale,
  initialT,
  onProgressChange,
  isMobile = false,
  ref,
}: ParallaxSceneProps) {
  const viewRef = useRef<HTMLDivElement | null>(null);
  const didInit = useRef(false);

  const vMin = items[0]?.v ?? 1;
  const vMax = items[items.length - 1]?.v ?? 1;

  const logMin = logv(vMin);
  const logMax = logv(vMax);
  const logSpan = Math.max(1, logMax - logMin);

  const [vh, setVh] = useState(() => (typeof window !== "undefined" ? window.innerHeight : 800));

  useEffect(() => {
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const totalH = scale === "linear" ? 28000 : logSpan * 420 + 800;
  const maxScrollRange = Math.max(1, totalH - vh);

  const [scrollY, setScrollY] = useState(() => (initialT ?? 0) * maxScrollRange);

  const focusT = (scrollY + vh / 2 - 400) / maxScrollRange;

  const positions = useMemo(
    () => items.map((it) => pos(it.v, vMin, vMax, scale)),
    [items, vMin, vMax, scale]
  );

  const ranked = useMemo(() => {
    return items
      .map((_, i) => ({ i, dT: Math.abs(positions[i] - focusT) }))
      .sort((a, b) => a.dT - b.dT);
  }, [items, positions, focusT]);

  const rankOf = useMemo(() => {
    const m = new Map<number, { pos: number; dT: number }>();
    ranked.forEach((r, p) => m.set(r.i, { pos: p, dT: r.dT }));
    return m;
  }, [ranked]);

  const sizeFor = useCallback(
    (i: number) => {
      const info = rankOf.get(i);
      if (!info) return 40;
      const { pos: rankPos, dT } = info;
      const sigmaT = (vh / maxScrollRange) * 1.1;
      const gauss = Math.exp(-(dT * dT) / (2 * sigmaT * sigmaT));
      const rankBoost = rankPos === 0 ? 1.0 : rankPos === 1 ? 0.42 : rankPos === 2 ? 0.2 : 0;
      const score = Math.max(gauss, rankBoost);
      const minSize = isMobile ? 10 : 14;
      const maxSize = isMobile ? 180 : 340;
      return minSize + (maxSize - minSize) * score;
    },
    [rankOf, vh, maxScrollRange, isMobile]
  );

  const attachView = useCallback(
    (el: HTMLDivElement | null) => {
      viewRef.current = el;
      if (!el) return;
      if (!didInit.current && initialT != null) {
        const target = initialT * maxScrollRange;
        let tries = 0;
        const trySet = () => {
          if (didInit.current) return;
          const maxScroll = el.scrollHeight - el.clientHeight;
          if (maxScroll >= target - 1) {
            el.scrollTop = target;
            didInit.current = true;
            return;
          }
          if (++tries < 30) requestAnimationFrame(trySet);
          else {
            el.scrollTop = Math.min(target, maxScroll);
            didInit.current = true;
          }
        };
        requestAnimationFrame(trySet);
        setTimeout(trySet, 50);
        setTimeout(trySet, 200);
      }
    },
    [initialT, maxScrollRange]
  );

  useImperativeHandle(
    ref,
    () => ({
      jumpTo: (t: number, instant?: boolean) => {
        const el = viewRef.current;
        if (!el) return;
        const target = Math.max(0, Math.min(maxScrollRange, t * maxScrollRange));
        if (instant) el.scrollTop = target;
        else animateScroll(el, target);
      },
    }),
    [maxScrollRange]
  );

  useEffect(() => {
    const el = viewRef.current;
    if (!el) return;
    let rafId = 0;
    let pending = false;
    const onScroll = () => {
      if (pending) return;
      pending = true;
      rafId = requestAnimationFrame(() => {
        pending = false;
        const y = el.scrollTop;
        setScrollY(y);
        onProgressChange?.(Math.max(0, Math.min(1, y / maxScrollRange)));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener("scroll", onScroll);
    };
  }, [maxScrollRange, onProgressChange]);

  const ticks = useMemo(() => {
    if (scale === "linear") {
      const out: Array<{ t: number; label: string }> = [];
      for (let k = 0; k <= 10; k++) {
        const v = vMin + (vMax - vMin) * (k / 10);
        out.push({ t: k / 10, label: fmtUsd(v) });
      }
      return out;
    }
    const out: Array<{ t: number; label: string }> = [];
    for (let lv = Math.ceil(logMin); lv <= Math.floor(logMax); lv += 1) {
      const t = (lv - logMin) / logSpan;
      out.push({ t, label: fmtUsd(Math.pow(10, lv)) });
    }
    return out;
  }, [scale, vMin, vMax, logMin, logMax, logSpan]);

  const bgY = -scrollY * 0.18;
  const atmY = -scrollY * 0.08;
  const midY = -scrollY;

  return (
    <div
      ref={attachView}
      style={{
        position: "fixed",
        inset: 0,
        overflowY: "scroll",
        overflowX: "hidden",
        background: "var(--cu-bg)",
      }}
    >
      <div style={{ height: totalH, position: "relative" }} />

      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          transform: `translateY(${bgY}px)`,
          backgroundImage: "radial-gradient(oklch(0.88 0.01 60) 1px, transparent 1.2px)",
          backgroundSize: "28px 28px",
          pointerEvents: "none",
          opacity: 0.55,
        }}
      />

      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          transform: `translateY(${atmY}px)`,
          backgroundImage:
            "radial-gradient(ellipse at 50% 20%, oklch(0.97 0.015 60) 0%, transparent 50%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, transform: `translateY(${midY}px)` }}>
          {ticks.map((tk, i) => {
            const y = tk.t * maxScrollRange + 400;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: y,
                  left: 0,
                  right: 0,
                  height: 0,
                  borderTop: "1px dashed var(--cu-line)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    background: "var(--cu-bg)",
                    padding: "2px 10px",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "oklch(0.65 0.01 60)",
                    letterSpacing: 1,
                  }}
                >
                  {tk.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, transform: `translateY(${midY}px)` }}>
          {items.map((it, i) => {
            const y = positions[i] * maxScrollRange + 400;
            const size = sizeFor(i);
            const info = rankOf.get(i);
            const dT = info ? info.dT : 1;
            const isLeft = i % 2 === 0;
            const xPct = isMobile ? 50 : isLeft ? 30 : 70;
            const sigOp = scale === "linear" ? 0.04 : 0.22;
            const opacity = Math.max(0.18, Math.exp(-(dT * dT) / (2 * sigOp * sigOp)));
            const gap = isMobile ? Math.max(10, size * 0.06) : Math.max(28, size * 0.08);
            const z = Math.round(size);
            return (
              <div
                key={it.id}
                style={{
                  position: "absolute",
                  top: y,
                  left: `${xPct}%`,
                  transform: "translate(-50%, -50%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap,
                  flexDirection: isMobile ? "column" : isLeft ? "row" : "row-reverse",
                  opacity,
                  zIndex: z,
                  transition: "opacity 200ms ease",
                  padding: isMobile ? "0 16px" : 0,
                  width: isMobile ? "min(100vw, 440px)" : undefined,
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  <Disc item={it} size={size} halo={it.category === "you"} />
                </div>
                <DiscMeta
                  item={it}
                  anchor={anchor}
                  align={isMobile ? "left" : isLeft ? "left" : "right"}
                  compact={isMobile}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
