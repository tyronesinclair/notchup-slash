import Link from "next/link";

export default function CTA() {
  return (
    <section id="cta" className="final">
      <div className="container final-inner">
        <h2 className="final-h">
          Stop paying the loyalty tax.<br />
          <span style={{ fontFamily: "var(--font-instrument-serif), 'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400 }}>
            Keep every dollar.
          </span>
        </h2>

        <p className="final-sub">
          Five minutes to set up. Slash handles the rest — the login, the audit, the negotiation, the waiting. You approve the win.
        </p>

        <div className="hero-ctas" style={{ justifyContent: "center" }}>
          <Link href="/sign-up" className="btn btn-primary btn-lg">
            Start for $15/mo <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="hero-trust" style={{ justifyContent: "center" }}>
          <div><strong>0%</strong> of your savings</div>
          <span className="dot-sep" />
          <div><strong>30-day</strong> money back</div>
          <span className="dot-sep" />
          <div><strong>Cancel</strong> anytime</div>
        </div>
      </div>
    </section>
  );
}
