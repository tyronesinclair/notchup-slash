import Link from "next/link";

function ExampleStep({ label, value, sub, highlight, muted }: { label: string; value: string; sub: string; highlight?: boolean; muted?: boolean }) {
  return (
    <div className={`ex-step ${highlight ? "ex-highlight" : ""} ${muted ? "ex-muted" : ""}`}>
      <div className="ex-label">{label}</div>
      <div className="ex-value">{value}</div>
      <div className="ex-sub">{sub}</div>
    </div>
  );
}

export default function Pricing() {
  return (
    <section id="pricing" className="pricing">
      <div className="container">
        <div className="section-header">
          <div className="kicker">Pricing</div>
          <h2 className="section-h">
            Pay less than a coffee. <span style={{ color: "var(--muted)" }}>Save hundreds a year.</span>
          </h2>
          <p className="section-sub" style={{ maxWidth: 600 }}>
            One transparent fee. We only win when you win — and if you don&apos;t, you don&apos;t owe a cent.
          </p>
        </div>

        <div className="price-grid">
          <div className="price-card">
            <div className="price-label">Activation</div>
            <div className="price-big">$35<span style={{ fontSize: 18, color: "var(--muted)", fontWeight: 400 }}> one-time</span></div>
            <ul className="price-list">
              <li>AI agent setup for your account</li>
              <li>Full bill audit + line-item analysis</li>
              <li>Negotiation with retention dept.</li>
            </ul>
          </div>

          <div className="price-card price-card-feature">
            <div className="price-tag">Most popular</div>
            <div className="price-label" style={{ color: "var(--accent-ink)" }}>Success fee</div>
            <div className="price-big">40%<span style={{ fontSize: 18, color: "var(--muted)", fontWeight: 400 }}> of year-one savings</span></div>
            <ul className="price-list">
              <li>Charged <em>only</em> after you approve the offer</li>
              <li>You keep the other 60% — and every cent after year one</li>
              <li>Reject the offer? Get your $35 back</li>
            </ul>
            <Link href="/sign-up" className="btn btn-primary btn-lg" style={{ justifyContent: "center", marginTop: 8 }}>
              Get started — $35 <span aria-hidden>→</span>
            </Link>
          </div>

          <div className="price-card price-guarantee">
            <div className="price-label">Guarantee</div>
            <div className="price-big" style={{ fontFamily: "var(--font-instrument-serif), 'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400 }}>Risk-free</div>
            <ul className="price-list">
              <li>Can&apos;t save $100+/yr? Completely free.</li>
              <li>Don&apos;t like our offer? $35 fully refunded.</li>
              <li>6-month window to find your savings.</li>
            </ul>
          </div>
        </div>

        <div className="example">
          <div className="kicker" style={{ marginBottom: 8 }}>Example math</div>
          <div className="example-row">
            <ExampleStep label="Found savings" value="$50/mo" sub="on Rogers Internet" />
            <div className="ex-arrow" aria-hidden>→</div>
            <ExampleStep label="Year-one savings" value="$600" sub="annual reduction" />
            <div className="ex-arrow" aria-hidden>→</div>
            <ExampleStep label="NotchUp takes" value="$240" sub="40% of year one" muted />
            <div className="ex-arrow" aria-hidden>→</div>
            <ExampleStep label="You keep" value="$325" sub="after $35 fee" highlight />
          </div>
        </div>
      </div>
    </section>
  );
}
