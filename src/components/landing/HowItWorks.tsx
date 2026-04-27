const steps = [
  { n: "01", time: "5 minutes",  title: "Tell us your providers",  body: "Pick your carriers, share your account credentials through bank-grade encryption, and pay the $35 activation fee.", icon: "📋" },
  { n: "02", time: "3–5 weeks",  title: "Our AI gets to work",      body: "NotchUp agents analyze your bills line-by-line, hunt overpayments, and negotiate directly with retention departments.", icon: "🤖" },
  { n: "03", time: "Your call",  title: "You review the offer",     body: "We email a savings proposal. Reject for any reason and your $35 is refunded — no questions, no follow-ups.", icon: "✓" },
  { n: "04", time: "Forever",    title: "Keep the savings",         body: "Approve the new rate. We take 40% of the first year's savings. You keep 60% — and the lower bill — for years.", icon: "↗" },
];

export default function HowItWorks() {
  return (
    <section id="how" className="how">
      <div className="container">
        <div className="section-header">
          <div className="kicker">How it works</div>
          <h2 className="section-h">
            We do the fighting. <span style={{ color: "var(--muted)" }}>You keep the savings.</span>
          </h2>
        </div>
        <div className="steps">
          {steps.map((s) => (
            <div key={s.n} className="step">
              <div className="step-top">
                <span className="step-n">{s.n}</span>
                <span className="step-time">{s.time}</span>
              </div>
              <div className="step-icon">{s.icon}</div>
              <div className="step-title">{s.title}</div>
              <div className="step-body">{s.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
