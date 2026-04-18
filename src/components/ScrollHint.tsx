interface ScrollHintProps {
  visible: boolean;
}

export function ScrollHint({ visible }: ScrollHintProps) {
  if (!visible) return null;
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        left: "50%",
        bottom: 90,
        transform: "translateX(-50%)",
        zIndex: 30,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        pointerEvents: "none",
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        textTransform: "uppercase",
        letterSpacing: 1.5,
        color: "var(--cu-muted-2)",
        opacity: 0.7,
        animation: "cu-hint 2.4s ease-in-out infinite",
      }}
    >
      <span>scroll to explore</span>
      <svg width="14" height="22" viewBox="0 0 14 22" fill="none">
        <path
          d="M7 2 V 20 M2 15 L7 20 L12 15"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
