// Server component — <details>/<summary> accordion: crawlable, zero JS.
// Keep in sync with the FAQPage schema in src/components/JsonLd.tsx.

export const faqItems = [
  { q: "What does $15 a month actually get me?", a: "Everything. Slash logs into your provider account, audits every line of every bill you add, negotiates with the retention team, and brings you the offer to approve. Internet, mobile, TV, home phone — unlimited bills, one subscription. And we keep 0% of what we save you." },
  { q: "You really don't take a percentage of my savings?", a: "Really. Most bill-negotiation services keep 30–60% of your first-year savings. Slash charges a flat $15/mo and nothing else. If we knock $600 off your bills this year, you keep $600." },
  { q: "How does the 30-day money-back guarantee work?", a: "If Slash isn't for you, ask for a refund within 30 days of signing up and you get your money back — no questions, no forms, no phone call. After that, you can cancel anytime from your billing page and you simply stop being charged." },
  { q: "Is my provider login actually safe?", a: "Yes. It's encrypted with AES-256 in transit and at rest, used only by Slash to work your account, and never shared or sold. We never ask for bank or credit-card logins — only your Rogers/Bell/Telus-style account login. You can delete it anytime." },
  { q: "Which bills can Slash negotiate?", a: "Right now: internet, mobile, TV/cable and home phone with every major Canadian carrier (Rogers, Bell, Telus, Shaw, Videotron, Freedom, Fido, Koodo, Virgin Plus, Cogeco, Eastlink and most regional providers). Home security and insurance are next. We can't negotiate regulated utilities like hydro, gas or water — and we'll tell you that plainly rather than pretend." },
  { q: "Can I add more than one bill?", a: "Add as many as you like — they're all covered by the one $15/mo subscription. We work them one at a time so each gets our full attention, starting with the first one you add (put your biggest bill first)." },
  { q: "Will anything change on my account without me knowing?", a: "No. Slash never switches your plan on its own. When it has a win, you get the offer with the before-and-after and you approve or reject it. Nothing changes until you say yes." },
  { q: "How long does it take?", a: "It depends on the provider's queue, but most bills take days to a few weeks from when Slash starts on them. You'll get an email the moment we begin and again when there's an offer to approve." },
  { q: "Is this available everywhere in Canada?", a: "Yes — every province and territory. Slash is a NotchUp product, built and run in Canada." },
];

export default function FAQ() {
  return (
    <section id="faq" className="faq">
      <div className="container faq-grid">
        <div>
          <div className="kicker">FAQ</div>
          <h2 className="section-h">
            Questions, <span style={{ color: "var(--muted)" }}>answered straight.</span>
          </h2>
          <p className="section-sub">
            Still curious? Email{" "}
            <a href="mailto:help@notchup.app" style={{ color: "var(--accent-ink)", textDecoration: "underline" }}>help@notchup.app</a>
            {" "}— a human replies within a business day.
          </p>
        </div>

        <div className="faq-list">
          {faqItems.map((it, i) => (
            <details key={i} className="faq-item" open={i === 0}>
              <summary className="faq-q">
                <span>{it.q}</span>
                <span className="faq-plus" aria-hidden>+</span>
              </summary>
              <div className="faq-a-wrap">
                <div className="faq-a">{it.a}</div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
