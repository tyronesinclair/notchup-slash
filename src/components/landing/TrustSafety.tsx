// Server component. Every line here has to be literally true of how Slash works today.

const nevers = [
  { t: "Never ask for your online-banking or card-account logins", d: "We only need your provider account login (Rogers, Bell, Telus…). Your $15 runs through Stripe — we never see your card number." },
  { t: "Never change your plan without your approval", d: "Slash brings you the offer with the before-and-after. Nothing moves until you say yes." },
  { t: "Never take a cut of your savings", d: "Flat $15/mo. Every dollar we win is yours, in year one and every year after." },
  { t: "Never sell your data", d: "It's shared only with the services that run Slash (payments, email, SMS, the secure browser) — see our privacy policy. Email us and we delete your details within 48 hours." },
  { t: "Never lock you in", d: "Cancel from the billing link in your confirmation email, or from the Manage page — two clicks, no call. Full refund in your first 30 days, no questions asked." },
];

const always = [
  { t: "AES-256 encryption", d: "Your provider login is encrypted at rest and in transit, and decrypted only when Slash (or a NotchUp operator supervising it) signs in to work your account." },
  { t: "Canadian, and reviewed before it reaches you", d: "Offers are checked before you see them. Slash is a NotchUp product, built and run in Canada." },
];

export default function TrustSafety() {
  return (
    <section id="trust" className="trust">
      <div className="container">
        <div className="section-header">
          <div className="kicker">Trust &amp; safety</div>
          <h2 className="section-h">
            You&apos;re handing us a login. <span style={{ color: "var(--muted)" }}>Here&apos;s exactly what we will and won&apos;t do with it.</span>
          </h2>
        </div>

        <div className="trust-grid">
          <div className="trust-col">
            <div className="trust-col-h trust-col-never">We never</div>
            {nevers.map((n) => (
              <div key={n.t} className="trust-item">
                <span className="trust-mark trust-mark-never">✕</span>
                <div>
                  <div className="trust-t">{n.t}</div>
                  <div className="trust-d">{n.d}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="trust-col">
            <div className="trust-col-h trust-col-always">We always</div>
            {always.map((a) => (
              <div key={a.t} className="trust-item">
                <span className="trust-mark trust-mark-always">✓</span>
                <div>
                  <div className="trust-t">{a.t}</div>
                  <div className="trust-d">{a.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
