const testimonials = [
  {
    quote: "I'd been meaning to call Rogers for over a year but kept putting it off. NotchUp handled everything. My bill went from $119 to $57 — without me lifting a finger.",
    who: "Sarah K.", where: "Toronto, ON", saving: "$62/mo", carrier: "Rogers Internet", initials: "SK",
    feature: true,
  },
  {
    quote: "Was paying $95/mo for my cell plan. They got it to $57 with the same data. Paid $35 and got back $152 in year one after their cut. Absolutely worth it.",
    who: "Michael T.", where: "Calgary, AB", saving: "$38/mo", carrier: "Bell Mobility", initials: "MT",
  },
  {
    quote: "Did both internet and phone at the same time. Took about four weeks and I didn't have to do anything after signing up. Genuinely impressed.",
    who: "Priya N.", where: "Vancouver, BC", saving: "$44/mo", carrier: "Telus Internet + Cell", initials: "PN",
  },
  {
    quote: "Skeptical at first. NotchUp got Bell to drop my bill $51/mo and credit me $80 for past overcharges. Took less than three weeks.",
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
            Real savings. <span style={{ color: "var(--muted)" }}>Real Canadians.</span>
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
          <span>⭐ 4.9/5 from early access members</span>
          <span>🍁 Canada-only service</span>
          <span>🔒 Bank-grade credential security</span>
        </div>
      </div>
    </section>
  );
}
