import Link from "next/link";
import BillReceipt from "./BillReceipt";

const serif = { fontFamily: "var(--font-instrument-serif), 'Instrument Serif', serif", fontStyle: "italic" as const, fontWeight: 400 };

function PromiseChip({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="promise-chip">
      <span className="promise-chip-icon">{icon}</span>
      <div>
        <div className="promise-chip-title">{title}</div>
        <div className="promise-chip-body">{body}</div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div>
          <div className="pill">🇨🇦 An AI agent for Canadian bills · by NotchUp</div>

          <h1 className="hero-h1">
            The AI agent that{" "}
            <span className="hero-strike-wrap">
              lowers your bills
              <svg className="hero-strike" viewBox="0 0 400 24" preserveAspectRatio="none" aria-hidden="true">
                <path d="M2,18 Q100,4 200,12 T398,8" stroke="var(--accent)" strokeWidth="10" fill="none" strokeLinecap="round" />
              </svg>
            </span>{" "}
            <em style={{ ...serif, color: "var(--accent-ink)" }}>so you don&apos;t have to.</em>
          </h1>

          <p className="hero-sub">
            Slash logs into your Rogers, Bell or Telus account, finds the overcharges, and negotiates them down with the retention team. You pass along one sign-in code, then just approve the win. No hold music. No awkward calls.
          </p>

          <div className="hero-promise">
            <div className="hero-promise-headline">
              <span className="hero-promise-amount">100%</span>
              <span>of the savings are <em style={{ ...serif, color: "var(--accent-ink)" }}>yours.</em> We take $0.</span>
            </div>
            <div className="hero-promise-sub">$15/month · 30-day money-back guarantee · cancel anytime</div>
          </div>

          <div className="hero-ctas">
            <Link href="/sign-up" className="btn btn-primary btn-lg">Start for $15/mo <span aria-hidden>→</span></Link>
            <a href="#how" className="btn btn-ghost btn-lg">See how it works</a>
          </div>

          <div className="hero-promise-row">
            <PromiseChip icon="100" title="Keep every dollar" body="0% of your savings, ever." />
            <PromiseChip icon="↺" title="30-day money back" body="no questions asked." />
            <PromiseChip icon="✕" title="Cancel anytime" body="two clicks, no phone call." />
          </div>
        </div>

        <div className="hero-art">
          <BillReceipt />

          <div className="float-chip" style={{ top: -18, left: -24 }}>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>This month · example</div>
            <div style={{ fontFamily: "var(--font-inter-tight), 'Inter Tight', sans-serif", fontWeight: 600, fontSize: 18, color: "var(--accent-ink)" }}>+$62 saved</div>
          </div>

          <div className="hero-stamp" role="img" aria-label="You keep 100% of savings — Slash takes 0%">
            <svg viewBox="0 0 100 100" width="100" height="100" aria-hidden="true">
              <defs>
                <path id="circ" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
              </defs>
              <text className="stamp-text">
                <textPath href="#circ" startOffset="0">KEEP 100% · $15/MO · 30-DAY MONEY BACK · </textPath>
              </text>
            </svg>
            <div className="hero-stamp-core">
              <div className="hero-stamp-big">0%</div>
              <div className="hero-stamp-cap">our cut</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
