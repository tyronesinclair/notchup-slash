const carrierStyles: Record<string, { color: string; weight: number; italic: boolean; ls: string; bg?: string; textColor?: string }> = {
  Rogers:    { color: "#DA291C", weight: 800, italic: false, ls: "-0.04em" },
  Bell:      { color: "#0066CC", weight: 700, italic: true,  ls: "-0.03em" },
  Telus:     { color: "#4B286D", weight: 700, italic: false, ls: "-0.02em" },
  Freedom:   { color: "#00A551", weight: 700, italic: false, ls: "-0.025em" },
  Videotron: { color: "#FFC72C", weight: 800, italic: false, ls: "-0.03em", bg: "#FFC72C", textColor: "#1A1A1A" },
  Fido:      { color: "#E6007E", weight: 800, italic: false, ls: "-0.04em" },
  Koodo:     { color: "#5C2D91", weight: 800, italic: false, ls: "-0.03em" },
};

const carriers = ["Rogers", "Bell", "Telus", "Freedom", "Videotron", "Fido", "Koodo"];

function CarrierLogo({ name }: { name: string }) {
  const s = carrierStyles[name] || { color: "var(--ink)", weight: 700, italic: false, ls: "-0.02em" };
  return (
    <span
      className="carrier-logo"
      style={{
        fontFamily: "var(--font-inter-tight), 'Inter Tight', sans-serif",
        fontWeight: s.weight,
        fontStyle: s.italic ? "italic" : "normal",
        letterSpacing: s.ls,
        color: s.bg ? s.textColor : s.color,
        background: s.bg ?? "transparent",
        padding: s.bg ? "4px 10px" : 0,
        borderRadius: s.bg ? 6 : 0,
      }}
    >
      {name}
    </span>
  );
}

export default function Providers() {
  const doubled = [...carriers, ...carriers];
  return (
    <section className="carriers">
      <div className="container">
        <div className="carrier-label">We negotiate with every major Canadian carrier</div>
        <div className="carrier-marquee">
          <div className="carrier-track">
            {doubled.map((c, i) => (
              <CarrierLogo key={i} name={c} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
