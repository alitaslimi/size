import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type Ref,
} from "react";
import type { UniverseItem } from "../lib/universe";
import { fmtUsd, logv } from "../lib/scale";
import { Disc } from "./Disc";

export interface ZoomSceneHandle {
  jumpTo: (t: number, instant?: boolean) => void;
}

interface ZoomSceneProps {
  items: UniverseItem[];
  initialT?: number;
  onProgressChange?: (t: number) => void;
  isMobile?: boolean;
  ref?: Ref<ZoomSceneHandle>;
}

/**
 * ~137.5° — consecutive items around the ring are always this far apart,
 * giving even coverage regardless of how many land inside the focus window.
 */
const GOLDEN_RADIANS = Math.PI * (3 - Math.sqrt(5));

const PX_PER_DECADE = 2400;
const FOCUS_SIGMA = 0.3;
const FOCUS_CUTOFF = 0.04;
/** Minimum log10 gap between two coins — thins the altcoin long tail
 *  so the ring doesn't choke in crowded decades. Non-coin categories
 *  (people, references, you) are never filtered. */
const MIN_LOG_GAP = 0.1;

function seededUnit(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function easeInOutQuad(k: number): number {
  return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
}

function animateScroll(el: HTMLElement, target: number, dur = 600) {
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

export function ZoomScene({
  items,
  initialT,
  onProgressChange,
  isMobile = false,
  ref,
}: ZoomSceneProps) {
  const viewRef = useRef<HTMLDivElement | null>(null);
  const didInit = useRef(false);

  // Thin tightly-packed coins so the ring has breathing room in dense
  // decades. Items are already sorted by value in the App layer.
  const thinned = useMemo(() => {
    const out: UniverseItem[] = [];
    let lastCoinLog = -Infinity;
    for (const it of items) {
      if (it.category !== "coin") {
        out.push(it);
        continue;
      }
      const lg = logv(it.v);
      if (lg - lastCoinLog >= MIN_LOG_GAP) {
        out.push(it);
        lastCoinLog = lg;
      }
    }
    return out;
  }, [items]);

  const vMin = thinned[0]?.v ?? 1;
  const vMax = thinned[thinned.length - 1]?.v ?? 1;
  const logMin = logv(vMin);
  const logMax = logv(vMax);
  const logSpan = Math.max(1, logMax - logMin);

  const [vh, setVh] = useState(() => (typeof window !== "undefined" ? window.innerHeight : 800));
  const [vw, setVw] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 1200));

  useEffect(() => {
    const onResize = () => {
      setVh(window.innerHeight);
      setVw(window.innerWidth);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const totalH = logSpan * PX_PER_DECADE + vh;
  const maxScrollRange = Math.max(1, totalH - vh);

  const [scrollY, setScrollY] = useState(() => (initialT ?? 0.5) * maxScrollRange);

  // Each item's stable layout metadata, keyed by its sorted position.
  const itemLayouts = useMemo(() => {
    return thinned.map((it, i) => ({
      angle: (i * GOLDEN_RADIANS) % (Math.PI * 2),
      // Radius multiplier 0.82–1.18 pushes items onto slightly different
      // orbits so they don't all sit on one crisp ring.
      radiusMul: 0.82 + seededUnit(it.id) * 0.36,
    }));
  }, [thinned]);

  const currentLog = logMin + (scrollY / maxScrollRange) * logSpan;

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

  const centerX = vw / 2;
  const centerY = vh / 2;
  const baseR = Math.min(vw, vh) * (isMobile ? 0.4 : 0.34);

  // Continuous fade: every item in range gets a focus score; the only
  // cutoff is a low FOCUS_CUTOFF that drops near-invisible dust. No
  // rank-based budget, so items don't pop in/out as you scroll.
  const scored = useMemo(() => {
    const out: Array<{ item: UniverseItem; focus: number; layoutIndex: number }> = [];
    for (let i = 0; i < thinned.length; i++) {
      const dLog = logv(thinned[i].v) - currentLog;
      const focus = Math.exp(-(dLog * dLog) / (2 * FOCUS_SIGMA * FOCUS_SIGMA));
      if (focus < FOCUS_CUTOFF) continue;
      out.push({ item: thinned[i], focus, layoutIndex: i });
    }
    return out;
  }, [thinned, currentLog]);

  return (
    <>
      <div
        ref={attachView}
        style={
          {
            position: "fixed",
            inset: 0,
            overflowY: "scroll",
            overflowX: "hidden",
            background: "var(--cu-bg)",
            WebkitOverflowScrolling: "touch",
          } as CSSProperties
        }
      >
        <div style={{ height: totalH }} />
      </div>

      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: "radial-gradient(oklch(0.88 0.01 60) 1px, transparent 1.2px)",
          backgroundSize: "28px 28px",
          opacity: 0.3,
        }}
      />

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            left: centerX,
            top: centerY,
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            fontFamily: "var(--font-mono)",
            color: "var(--cu-muted)",
            letterSpacing: 1.5,
            textTransform: "uppercase",
            userSelect: "none",
          }}
        >
          <div style={{ fontSize: 9, marginBottom: 6 }}>Now zooming</div>
          <div
            style={{
              fontFamily: "var(--font-serif)",
              textTransform: "none",
              letterSpacing: -0.3,
              fontSize: isMobile ? 28 : 36,
              color: "oklch(0.25 0.01 60)",
              lineHeight: 1,
            }}
          >
            {fmtUsd(Math.pow(10, currentLog))}
          </div>
        </div>

        {scored.map(({ item: it, focus, layoutIndex }) => {
          const { angle, radiusMul } = itemLayouts[layoutIndex];
          const R = baseR * radiusMul;
          const x = centerX + R * Math.cos(angle);
          const y = centerY + R * Math.sin(angle);

          const minS = isMobile ? 16 : 22;
          const maxS = isMobile ? 78 : 112;
          const size = minS + (maxS - minS) * focus;

          const opacity = Math.max(0.28, focus);
          const showMeta = focus > 0.45;
          const isYou = it.category === "you";

          return (
            <div
              key={it.id}
              style={{
                position: "absolute",
                left: x,
                top: y,
                transform: "translate(-50%, -50%)",
                opacity,
                zIndex: Math.round(focus * 150) + (isYou ? 5 : 0),
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                maxWidth: 220,
                willChange: "opacity",
              }}
            >
              <Disc item={it} size={size} halo={isYou} />
              {showMeta && (
                <div
                  style={{
                    textAlign: "center",
                    fontFamily: "var(--font-sans)",
                    opacity: Math.min(1, (focus - 0.38) / 0.25),
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: isMobile ? 15 : 18,
                      color: "oklch(0.16 0.01 60)",
                      lineHeight: 1.1,
                      letterSpacing: -0.3,
                      maxWidth: 200,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {it.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "oklch(0.22 0.01 60)",
                      marginTop: 2,
                      letterSpacing: -0.2,
                    }}
                  >
                    {fmtUsd(it.v)}
                  </div>
                  {isYou && it.note && showMeta && (
                    <div
                      style={{
                        fontSize: 10,
                        color: "var(--cu-muted)",
                        marginTop: 3,
                        fontStyle: "italic",
                      }}
                    >
                      {it.note}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
