import Link from "next/link";
import BillReceipt from "./BillReceipt";

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
          <div className="pill">
            🇨🇦 A NotchUp product · Canada only
          </div>

          <h1 className="hero-h1">
            Lower your{" "}
            <span className="hero-strike-wrap">
              phone &amp; internet bills
              <svg className="hero-strike" viewBox="0 0 400 24" preserveAspectRatio="none" aria-hidden="true">
                <path d="M2,18 Q100,4 200,12 T398,8" stroke="var(--accent)" strokeWidth="10" fill="none" strokeLinecap="round" />
              </svg>
            </span>{" "}by{" "}
            <em style={{ fontFamily: "var(--font-instrument-serif), 'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400, color: "var(--accent-ink)" }}>
              $487/year
            </em>{" "}on average.
          </h1>

          <p className="hero-sub">
            NotchUp Slash is the AI that quietly negotiates with Rogers, Bell &amp; Telus on your behalf. No hold music. No retention scripts.
          </p>

          <div className="hero-promise">
            <div className="hero-promise-headline">
              <span className="hero-promise-amount">$100+</span>
              <span>in savings or it&apos;s <em style={{ fontFamily: "var(--font-instrument-serif), 'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400, color: "var(--accent-ink)" }}>completely free</em>.</span>
            </div>
            <div className="hero-promise-sub">Backed by our 6-month, money-back guarantee.</div>
          </div>

          <div className="hero-ctas">
            <Link href="/sign-up" className="btn btn-primary btn-lg">Slash my bills — $35 <span aria-hidden>→</span></Link>
            <a href="#how" className="btn btn-ghost btn-lg">See how it works</a>
          </div>

          <div className="hero-promise-row">
            <PromiseChip icon="✓" title="$100+ guaranteed" body="or it's free, full stop." />
            <PromiseChip icon="↺" title="$35 back" body="if you reject the offer." />
            <PromiseChip icon="⏱" title="6-month window" body="to find your savings." />
          </div>
        </div>

        <div className="hero-art">
          <BillReceipt />

          <div className="float-chip" style={{ top: -18, left: -24 }}>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>This month</div>
            <div style={{ fontFamily: "var(--font-inter-tight), 'Inter Tight', sans-serif", fontWeight: 600, fontSize: 18, color: "var(--accent-ink)" }}>+$62 saved</div>
          </div>

          <div className="hero-stamp" aria-label="Money-back guarantee">
            <svg viewBox="0 0 100 100" width="100" height="100" aria-hidden="true">
              <defs>
                <path id="circ" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
              </defs>
              <text className="stamp-text">
                <textPath href="#circ" startOffset="0">$100 OR FREE · 6 MONTHS · MONEY BACK · </textPath>
              </text>
            </svg>
            <div className="hero-stamp-core">
              <div className="hero-stamp-big">$0</div>
              <div className="hero-stamp-cap">if no savings</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
