import Link from "next/link";

export default function CTA() {
  return (
    <section id="cta" className="final">
      <div className="container final-inner">
        <h2 className="final-h">
          Stop overpaying.<br />
          <span style={{ fontFamily: "var(--font-instrument-serif), 'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400 }}>
            Start keeping it.
          </span>
        </h2>

        <p className="final-sub">
          Five minutes to start. We handle the rest. No hold music, no awkward calls, no risk if it doesn&apos;t work out.
        </p>

        <div className="hero-ctas" style={{ justifyContent: "center" }}>
          <Link href="/sign-up" className="btn btn-primary btn-lg">
            Slash my bills for $35 <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="hero-trust" style={{ justifyContent: "center" }}>
          <div><strong>Free</strong> if we can&apos;t save $100+/yr</div>
          <span className="dot-sep" />
          <div><strong>$35 back</strong> if you reject</div>
        </div>
      </div>
    </section>
  );
}
