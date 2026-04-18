import { fmtUsd } from "../lib/scale";

interface AnchorBadgeProps {
  anchor: number;
  onClick?: () => void;
}

export function AnchorBadge({ anchor, onClick }: AnchorBadgeProps) {
  const interactive = !!onClick;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!interactive}
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 40,
        background: "oklch(0.96 0.005 60)",
        border: "1px solid oklch(0.68 0.18 48 / 0.4)",
        borderRadius: 999,
        padding: "8px 16px 8px 10px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow:
          "0 2px 8px oklch(0.68 0.18 48 / 0.15), 0 12px 32px rgba(40,30,10,0.06)",
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        color: "var(--cu-fg-soft)",
        cursor: interactive ? "pointer" : "default",
      }}
      aria-label={`Your size anchor: ${fmtUsd(anchor)}${interactive ? " (click to change)" : ""}`}
    >
      <span
        aria-hidden
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "var(--cu-accent)",
          boxShadow: "0 0 0 3px oklch(0.68 0.18 48 / 0.2)",
        }}
      />
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: 1.5,
          color: "var(--cu-muted-2)",
        }}
      >
        your size
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        {fmtUsd(anchor)}
      </span>
    </button>
  );
}
