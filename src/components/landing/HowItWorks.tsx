const steps = [
  {
    n: "01", time: "5 minutes", icon: "📋",
    title: "Add your bills, subscribe",
    body: "Tell us your providers and add your account login (AES-256 encrypted). $15/mo covers every bill you add — they're queued and worked one at a time.",
  },
  {
    n: "02", time: "Days to weeks", icon: "🤖",
    title: "Slash gets to work",
    body: "It logs into your account, audits every line for overcharges and expired promos, then negotiates with the retention team — and sits through the wait so you don't.",
  },
  {
    n: "03", time: "Your call", icon: "✓",
    title: "Approve the win. Keep 100%.",
    body: "You get the offer with the before-and-after. Say yes and the lower rate is locked in. Every dollar saved is yours — we take nothing.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="how">
      <div className="container">
        <div className="section-header">
          <div className="kicker">How it works</div>
          <h2 className="section-h">
            Slash does the fighting. <span style={{ color: "var(--muted)" }}>You do the approving.</span>
          </h2>
        </div>
        <div className="steps steps-3">
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
