import { useState, type CSSProperties } from "react";
import type { UniverseItem } from "../lib/universe";
import { CATEGORY_COLOR, CATEGORY_TINT, glyph } from "../lib/scale";

interface DiscProps {
  item: UniverseItem;
  size: number;
  halo?: boolean;
  style?: CSSProperties;
}

export function Disc({ item, size, halo, style }: DiscProps) {
  const color = CATEGORY_COLOR[item.category];
  const tint = CATEGORY_TINT[item.category];
  const isYou = item.category === "you";

  const [imgFailed, setImgFailed] = useState(false);
  const hasImage = !!item.image && !imgFailed;

  const fontSize = Math.max(11, Math.min(size * 0.34, 56));
  const ringW = Math.max(1, Math.min(size * 0.022, 2.5));

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: tint,
        border: `${ringW}px solid ${color}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color,
        fontFamily: "var(--font-mono)",
        fontWeight: 600,
        fontSize,
        letterSpacing: -0.5,
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
        boxShadow: isYou
          ? `0 0 0 ${ringW * 2}px ${tint}, 0 8px 28px oklch(0.68 0.18 48 / 0.22)`
          : "0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(30,20,10,0.03)",
        ...style,
      }}
    >
      {halo && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: -size * 0.14,
            borderRadius: "50%",
            border: `1px dashed ${color}`,
            opacity: 0.3,
            pointerEvents: "none",
          }}
        />
      )}

      {hasImage ? (
        <img
          src={item.image}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setImgFailed(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "50%",
            display: "block",
          }}
        />
      ) : (
        <span style={{ mixBlendMode: "multiply" }}>{glyph(item.name)}</span>
      )}

      {isYou && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            boxShadow: `inset 0 0 0 ${ringW}px ${color}`,
            animation: "cu-pulse 2.4s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}
