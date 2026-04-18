import type { UniverseItem } from "../lib/universe";
import { CATEGORY_LABEL } from "../lib/universe";
import { CATEGORY_COLOR, CATEGORY_TINT, fmtUsd, ratio } from "../lib/scale";

interface DiscMetaProps {
  item: UniverseItem;
  anchor: number | null;
  align?: "left" | "right";
  compact?: boolean;
}

export function DiscMeta({ item, anchor, align = "left", compact = false }: DiscMetaProps) {
  const color = CATEGORY_COLOR[item.category];
  const tint = CATEGORY_TINT[item.category];
  const isYou = item.category === "you";

  const longName = item.name.length > 16;
  const veryLongName = item.name.length > 20;
  const nameSize = compact ? (longName ? 22 : 28) : longName ? 28 : 36;
  const valueSize = compact ? 18 : 22;

  return (
    <div
      style={{
        textAlign: align,
        fontFamily: "var(--font-sans)",
        color: "var(--cu-fg-soft)",
        maxWidth: 460,
        display: "flex",
        flexDirection: "column",
        alignItems: align === "right" ? "flex-end" : "flex-start",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: nameSize,
          fontWeight: 400,
          lineHeight: 1.1,
          letterSpacing: -0.6,
          color: isYou ? color : "oklch(0.16 0.01 60)",
          marginBottom: compact ? 10 : 16,
          whiteSpace: veryLongName ? "normal" : "nowrap",
          maxWidth: 440,
          textWrap: "balance" as React.CSSProperties["textWrap"],
        }}
      >
        {item.name}
      </div>

      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: valueSize,
          fontWeight: 500,
          color: "oklch(0.22 0.01 60)",
          marginBottom: compact ? 6 : 10,
          letterSpacing: -0.3,
        }}
      >
        {fmtUsd(item.v)}
      </div>

      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
          flexWrap: "wrap",
          justifyContent: align === "right" ? "flex-end" : "flex-start",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "2px 8px 2px 6px",
            background: tint,
            border: `1px solid ${color}`,
            borderRadius: 999,
            fontSize: 10,
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: 1,
            color,
            fontFamily: "var(--font-mono)",
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: color,
            }}
          />
          {CATEGORY_LABEL[item.category]}
        </span>
        <span
          style={{
            fontSize: 11,
            color: "var(--cu-muted)",
            fontFamily: "var(--font-sans)",
          }}
        >
          {item.label}
        </span>
      </div>

      {anchor != null && !isYou && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "oklch(0.4 0.01 60)",
            letterSpacing: 0.2,
          }}
        >
          <span style={{ color: "oklch(0.22 0.01 60)", fontWeight: 500 }}>
            {ratio(item.v, anchor)}
          </span>
          <span style={{ color: "var(--cu-muted)" }}> your size</span>
        </div>
      )}

      {item.note && (
        <div
          style={{
            fontSize: 11,
            color: "var(--cu-muted)",
            marginTop: 6,
            fontStyle: "italic",
            lineHeight: 1.4,
          }}
        >
          {item.note}
        </div>
      )}
    </div>
  );
}
