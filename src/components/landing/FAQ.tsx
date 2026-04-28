"use client";
import { useState } from "react";

const items = [
  { q: "Is my login information actually safe?", a: "Yes. Credentials are encrypted with bank-grade AES-256 in transit and at rest, scoped to a single negotiation, and rotated automatically when we're done. We never store unmasked credentials and we never share them with third parties." },
  { q: "What if you can't save me money?", a: "If we can't find at least $100/yr in savings within six months, the service is completely free — your $35 activation is refunded in full." },
  { q: "What if I don't like the savings offer?", a: "Reject it for any reason. Maybe you didn't like the new plan structure, maybe you found a better deal yourself — doesn't matter. Your $35 is refunded, no follow-ups." },
  { q: "How long does the process take?", a: "Most negotiations close in 3–5 weeks. Some are faster, some are slower depending on the carrier's queue. You'll see status updates the whole way through." },
  { q: "Which providers do you negotiate?", a: "Rogers, Bell, Telus, Freedom Mobile, Videotron, Fido, Koodo, Virgin Plus, and most regional Canadian carriers. We support both internet and mobile lines." },
  { q: "Can I add multiple services?", a: "Yes — add as many lines and services as you want under one $35 activation. We negotiate them in parallel." },
  { q: "Is this available across Canada?", a: "Yes, we serve every province and territory. Notchup Slash is exclusive to Notchup members." },
  { q: "What's the 40% based on?", a: "It's 40% of the savings we secure for the first 12 months only. Every dollar saved after month 12 is 100% yours, forever." },
];

export default function FAQ() {
  const [open, setOpen] = useState<number>(0);

  return (
    <section id="faq" className="faq">
      <div className="container faq-grid">
        <div>
          <div className="kicker">FAQ</div>
          <h2 className="section-h">
            Questions, <span style={{ color: "var(--muted)" }}>answered.</span>
          </h2>
          <p className="section-sub">
            Still curious? Email{" "}
            <a href="mailto:help@notchup.app" style={{ color: "var(--accent-ink)", textDecoration: "underline" }}>
              help@notchup.app
            </a>{" "}
            — we reply within a business day.
          </p>
        </div>

        <div className="faq-list">
          {items.map((it, i) => (
            <div
              key={i}
              className={`faq-item ${open === i ? "open" : ""}`}
              onClick={() => setOpen(open === i ? -1 : i)}
            >
              <div className="faq-q">
                <span>{it.q}</span>
                <span className="faq-plus" aria-hidden>{open === i ? "−" : "+"}</span>
              </div>
              <div className="faq-a-wrap">
                <div className="faq-a">{it.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
