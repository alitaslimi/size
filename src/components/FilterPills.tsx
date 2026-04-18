import type { Category } from "../lib/universe";
import { CATEGORY_COLOR } from "../lib/scale";

export type FilterState = Record<Exclude<Category, "you">, boolean>;

interface FilterPillsProps {
  filters: FilterState;
  onChange: (next: FilterState) => void;
}

const CATS: Array<{ id: Exclude<Category, "you">; label: string }> = [
  { id: "coin", label: "Coins" },
  { id: "project", label: "Projects" },
  { id: "person", label: "People" },
  { id: "ref", label: "References" },
];

export function FilterPills({ filters, onChange }: FilterPillsProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        left: 20,
        display: "flex",
        gap: 6,
        zIndex: 50,
        background: "var(--cu-surface-blur)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid var(--cu-line)",
        borderRadius: 999,
        padding: 4,
        boxShadow:
          "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(40,30,10,0.04)",
        fontFamily: "var(--font-sans)",
      }}
    >
      {CATS.map((c) => {
        const on = filters[c.id];
        const color = CATEGORY_COLOR[c.id];
        return (
          <button
            key={c.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange({ ...filters, [c.id]: !on })}
            style={{
              background: on ? color : "transparent",
              color: on ? "white" : "oklch(0.35 0.01 60)",
              border: "none",
              padding: "7px 14px",
              fontSize: 12,
              fontWeight: 500,
              fontFamily: "inherit",
              borderRadius: 999,
              cursor: "pointer",
              letterSpacing: 0.1,
              transition: "background 140ms ease, color 140ms ease",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: on ? "white" : color,
                display: "inline-block",
              }}
            />
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
