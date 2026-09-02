import Link from "next/link";

const serif = { fontFamily: "var(--font-instrument-serif), 'Instrument Serif', serif", fontStyle: "italic" as const, fontWeight: 400 };

export default function Pricing() {
  return (
    <section id="pricing" className="pricing">
      <div className="container">
        <div className="section-header">
          <div className="kicker">Pricing</div>
          <h2 className="section-h">
            One flat price. <span style={{ color: "var(--muted)" }}>Zero percent of your savings.</span>
          </h2>
          <p className="section-sub" style={{ maxWidth: 620 }}>
            Most bill negotiators take a big cut of what they win you. We don&apos;t. $15 a month, and the win is 100% yours.
          </p>
        </div>

        <div className="price-grid price-grid-2">
          <div className="price-card price-card-feature">
            <div className="price-tag">Everything included</div>
            <div className="price-label" style={{ color: "var(--accent-ink)" }}>Slash</div>
            <div className="price-big">$15<span style={{ fontSize: 18, color: "var(--muted)", fontWeight: 400 }}> / month</span></div>
            <ul className="price-list">
              <li>Unlimited bills — internet, mobile, TV, home phone</li>
              <li>Full line-by-line bill audit</li>
              <li>Negotiation with your provider&apos;s retention team</li>
              <li>You approve every offer before anything changes</li>
              <li><strong>0% of your savings — you keep all of it</strong></li>
              <li>Cancel anytime, two clicks, no call</li>
            </ul>
            <Link href="/sign-up" className="btn btn-primary btn-lg" style={{ justifyContent: "center", marginTop: 8 }}>
              Start for $15/mo <span aria-hidden>→</span>
            </Link>
            <div style={{ fontSize: 12.5, color: "var(--muted)", textAlign: "center" }}>Charged monthly · cancel anytime</div>
          </div>

          <div className="price-card price-guarantee">
            <div className="price-label">Guarantee</div>
            <div className="price-big" style={{ ...serif, fontSize: 52 }}>30 days, no questions</div>
            <ul className="price-list">
              <li>Not for you? Full refund within 30 days.</li>
              <li>No forms, no &ldquo;why are you leaving,&rdquo; no hold music.</li>
              <li>After that, cancel anytime and you won&apos;t be charged again.</li>
            </ul>
            <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.55, margin: 0 }}>
              We can afford this because we don&apos;t need a slice of your win to make money. $15 a month covers the work.
            </p>
          </div>
        </div>

        {/* Comparison — the reason to pick a flat fee */}
        <div className="compare">
          <div className="kicker" style={{ marginBottom: 6 }}>Same $600 win, three ways</div>
          <p className="compare-sub">Say we knock $50/mo off your internet — $600 a year. Here&apos;s who keeps what.</p>

          <div className="compare-rows">
            <div className="compare-row compare-row-us">
              <div className="compare-who">
                <strong>Slash</strong>
                <span>keeps 0% · $180/yr flat → <strong>$420 net</strong></span>
              </div>
              <div className="compare-bar">
                <div className="compare-keep" style={{ flex: 420 }}>You keep <strong>$420</strong> after the sub</div>
                <div className="compare-sub" style={{ flex: 180 }}>Slash <strong>$180</strong></div>
              </div>
            </div>
            <div className="compare-row">
              <div className="compare-who">
                <strong>Typical negotiator</strong>
                <span>keeps 40% of year one</span>
              </div>
              <div className="compare-bar">
                <div className="compare-keep" style={{ flex: 360 }}>You keep <strong>$360</strong></div>
                <div className="compare-cut" style={{ flex: 240 }}>They keep <strong>$240</strong></div>
              </div>
            </div>
            <div className="compare-row">
              <div className="compare-who">
                <strong>The expensive ones</strong>
                <span>keep up to 60%</span>
              </div>
              <div className="compare-bar">
                <div className="compare-keep" style={{ flex: 240 }}>You keep <strong>$240</strong></div>
                <div className="compare-cut" style={{ flex: 360 }}>They keep <strong>$360</strong></div>
              </div>
            </div>
          </div>
          <p className="compare-fine">Slash&apos;s $180/yr subscription is the only cost — refundable in your first 30 days — and it covers every bill you add, not just this one. Competitor percentages are typical industry success-fee ranges, not claims about any specific company.</p>
        </div>
      </div>
    </section>
  );
}
