interface HeaderProps {
  isMobile?: boolean;
}

export function Header({ isMobile = false }: HeaderProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: isMobile ? 12 : 20,
        left: isMobile ? 12 : "50%",
        transform: isMobile ? "none" : "translateX(-50%)",
        zIndex: 40,
        textAlign: isMobile ? "left" : "center",
        pointerEvents: "none",
        fontFamily: "var(--font-sans)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: isMobile ? 18 : 22,
          lineHeight: 1,
          color: "oklch(0.2 0.01 60)",
          letterSpacing: -0.3,
        }}
      >
        Crypto Universe
      </div>
      {!isMobile && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: 1.5,
            color: "var(--cu-muted)",
            marginTop: 4,
          }}
        >
          scroll · scale · compare
        </div>
      )}
    </div>
  );
}
