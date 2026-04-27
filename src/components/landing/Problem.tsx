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
          <div className="kicker">The math</div>
          <h2 className="section-h">
            The average Canadian household quietly hands{" "}
            <em style={{ fontFamily: "var(--font-instrument-serif), 'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400 }}>
              $487 a year
            </em>{" "}
            to their telecom — for plans they could&apos;ve negotiated down in 20 minutes.
          </h2>
        </div>
        <div className="problem-stats">
          <Stat big="73%" label="of Canadians have never negotiated their bill." />
          <Stat big="38min" label="average hold time with a retention agent." />
          <Stat big="$487" label="annual overpayment on phone + internet." />
        </div>
      </div>
    </section>
  );
}
