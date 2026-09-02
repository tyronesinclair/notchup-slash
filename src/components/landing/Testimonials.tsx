const testimonials = [
  {
    quote: "I'd been meaning to call Rogers for over a year and kept putting it off. Slash handled the whole thing. My bill went from $119 to $57 — and I kept all of it.",
    who: "Sarah K.", where: "Toronto, ON", saving: "$62/mo", carrier: "Rogers Internet", initials: "SK",
    feature: true,
  },
  {
    quote: "Paying $95 for my cell plan. Slash got it to $57 with the same data. $15 a month for that is not a hard decision.",
    who: "Michael T.", where: "Calgary, AB", saving: "$38/mo", carrier: "Bell Mobility", initials: "MT",
  },
  {
    quote: "Added internet and my phone. It did them one after the other and I didn't touch a thing after signing up. Genuinely impressed.",
    who: "Priya N.", where: "Vancouver, BC", saving: "$44/mo", carrier: "Telus Internet + Mobile", initials: "PN",
  },
  {
    quote: "Skeptical at first. Bell dropped my bill $51 a month and credited me $80 for past overcharges. I approved it from my couch.",
    who: "Daniel R.", where: "Montréal, QC", saving: "$51/mo", carrier: "Bell Internet", initials: "DR",
  },
];

export default function Testimonials() {
  return (
    <section id="proof" className="testimonials">
      <div className="container">
        <div className="section-header">
          <div className="kicker">Member stories</div>
          <h2 className="section-h">
            Real savings. <span style={{ color: "var(--muted)" }}>All theirs to keep.</span>
          </h2>
        </div>

        <div className="t-grid">
          {testimonials.map((t) => (
            <figure key={t.initials} className={`t-card ${t.feature ? "t-feature" : ""}`}>
              <div className="t-saving">
                <span className="t-amount">{t.saving}</span>
                <span className="t-carrier">{t.carrier}</span>
              </div>
              <blockquote>{t.quote}</blockquote>
              <figcaption>
                <div className="t-avatar">{t.initials}</div>
                <div>
                  <div style={{ fontWeight: 600 }}>{t.who}</div>
                  <div style={{ fontSize: 13, color: t.feature ? "rgba(255,255,255,0.65)" : "var(--muted)" }}>{t.where}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="trust-row">
          <span>🍁 Built for Canada, by NotchUp</span>
          <span>🔒 AES-256 encrypted logins</span>
          <span>✓ You approve every change</span>
        </div>
      </div>
    </section>
  );
}
