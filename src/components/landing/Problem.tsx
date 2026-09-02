function Stat({ big, label }: { big: string; label: string }) {
  return (
    <div className="stat">
      <div className="stat-big">{big}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function Problem() {
  return (
    <section className="problem">
      <div className="container problem-grid">
        <div>
          <div className="kicker">Why Slash exists</div>
          <h2 className="section-h">
            Loyalty is a{" "}
            <em style={{ fontFamily: "var(--font-instrument-serif), 'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400 }}>
              tax
            </em>
            . Your provider quietly raises your rate every year and bets you won&apos;t sit on hold to fight it.
          </h2>
          <p className="section-sub" style={{ marginTop: 16 }}>
            The retention team has a better price ready. They only give it to people who ask, push, and wait. Slash asks, pushes, and waits for you.
          </p>
        </div>
        <div className="problem-stats">
          <Stat big="$487" label="a year the average Canadian household overpays on phone, internet and TV." />
          <Stat big="73%" label="of Canadians have never once negotiated a bill." />
          <Stat big="38min" label="average hold time to reach a retention agent. Slash sits through it, not you." />
        </div>
      </div>
    </section>
  );
}
