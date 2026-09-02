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
          {/* Figures are estimates — see the savings disclaimer in the footer. */}
          <Stat big="$487" label="a year a typical Canadian household can save on phone, internet and TV — an estimate, and every dollar of it stays yours." />
          <Stat big="0" label="calls you make, hold queues you sit in, retention scripts you argue with. Slash does the waiting." />
          <Stat big="$15" label="a month, flat. No percentage of your savings, ever. 30-day money back if it's not for you." />
        </div>
      </div>
    </section>
  );
}
