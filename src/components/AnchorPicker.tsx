import { useEffect, useRef, useState } from "react";
import { fmtUsd } from "../lib/scale";

interface AnchorPickerProps {
  anchor: number;
  onChange: (next: number) => void;
  onClose: () => void;
}

const PRESETS: Array<{ v: number; label: string }> = [
  { v: 10_000, label: "$10K · retail" },
  { v: 100_000, label: "$100K · comfortable" },
  { v: 1_000_000, label: "$1M · millionaire" },
  { v: 10_000_000, label: "$10M · wealthy" },
  { v: 100_000_000, label: "$100M · centi-millionaire" },
];

export function AnchorPicker({ anchor, onChange, onClose }: AnchorPickerProps) {
  const [customValue, setCustomValue] = useState(String(anchor));
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onDown = (e: PointerEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) onClose();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [onClose]);

  const submitCustom = () => {
    const cleaned = customValue.replace(/[$,_\s]/g, "");
    const n = Number(cleaned);
    if (Number.isFinite(n) && n > 0) onChange(n);
  };

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-label="Set your size anchor"
      style={{
        position: "fixed",
        bottom: 80,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 60,
        width: "min(320px, calc(100vw - 32px))",
        background: "var(--cu-surface)",
        border: "1px solid var(--cu-line)",
        borderRadius: 14,
        padding: 14,
        boxShadow:
          "0 4px 16px rgba(0,0,0,0.06), 0 20px 48px rgba(40,30,10,0.12)",
        fontFamily: "var(--font-sans)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: 1.5,
          color: "var(--cu-muted)",
          marginBottom: 12,
        }}
      >
        Your size anchor
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
        {PRESETS.map((opt) => {
          const on = opt.v === anchor;
          return (
            <button
              key={opt.v}
              type="button"
              onClick={() => {
                onChange(opt.v);
                onClose();
              }}
              style={{
                textAlign: "left",
                padding: "8px 10px",
                border: on
                  ? "1px solid var(--cu-accent)"
                  : "1px solid var(--cu-line)",
                borderRadius: 8,
                background: on ? "var(--cu-accent-soft)" : "white",
                color: "oklch(0.2 0.01 60)",
                cursor: "pointer",
                fontSize: 12,
                fontFamily: "var(--font-mono)",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: 1.5,
          color: "var(--cu-muted)",
          marginBottom: 6,
        }}
      >
        Custom
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitCustom();
          onClose();
        }}
        style={{ display: "flex", gap: 6 }}
      >
        <input
          type="text"
          inputMode="numeric"
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          placeholder="e.g. 250000"
          aria-label="Custom anchor in USD"
          style={{
            flex: 1,
            padding: "8px 10px",
            border: "1px solid var(--cu-line)",
            borderRadius: 8,
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            background: "white",
            color: "oklch(0.2 0.01 60)",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "8px 12px",
            border: "1px solid var(--cu-accent)",
            background: "var(--cu-accent-soft)",
            color: "oklch(0.35 0.12 48)",
            borderRadius: 8,
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Set
        </button>
      </form>

      <div
        style={{
          marginTop: 10,
          fontSize: 11,
          color: "var(--cu-muted)",
          fontFamily: "var(--font-mono)",
        }}
      >
        currently {fmtUsd(anchor)}
      </div>
    </div>
  );
}
