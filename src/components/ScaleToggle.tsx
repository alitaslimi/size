import type { ScaleMode } from "../lib/scale";

interface ScaleToggleProps {
  scale: ScaleMode;
  onChange: (next: ScaleMode) => void;
}

const OPTS: Array<{ id: ScaleMode; label: string }> = [
  { id: "log", label: "Log" },
  { id: "linear", label: "Linear" },
];

export function ScaleToggle({ scale, onChange }: ScaleToggleProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 112,
        zIndex: 50,
        display: "flex",
        gap: 4,
        background: "var(--cu-surface-blur)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid var(--cu-line)",
        borderRadius: 999,
        padding: 4,
        boxShadow:
          "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(40,30,10,0.04)",
        fontFamily: "var(--font-sans)",
        alignItems: "center",
      }}
      role="radiogroup"
      aria-label="Scale mode"
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          textTransform: "uppercase",
          letterSpacing: 1.5,
          color: "var(--cu-muted)",
          paddingLeft: 8,
          paddingRight: 2,
        }}
      >
        Scale
      </span>
      {OPTS.map((o) => {
        const on = scale === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.id)}
            style={{
              background: on ? "oklch(0.22 0.01 60)" : "transparent",
              color: on ? "white" : "oklch(0.4 0.01 60)",
              border: "none",
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 500,
              fontFamily: "inherit",
              borderRadius: 999,
              cursor: "pointer",
              transition: "background 140ms ease, color 140ms ease",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
