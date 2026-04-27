export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <a href="https://notchup.app" style={{ display: "inline-block" }}>
            <span style={{ fontFamily: "var(--font-inter-tight), 'Inter Tight', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.03em", color: "var(--accent-ink)" }}>
              NotchUp
            </span>
          </a>
          <p style={{ color: "var(--ink-soft)", fontSize: 14, marginTop: 14, maxWidth: 320, lineHeight: 1.5 }}>
            Make any day payday.
          </p>
          <div style={{ marginTop: 18, fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.7 }}>
            <div>(778) 400-5126</div>
            <a href="mailto:hello@notchup.app" style={{ color: "var(--accent-ink)" }}>hello@NotchUp.app</a>
            <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 12, lineHeight: 1.5, maxWidth: 320 }}>
              NotchUp only offers online services. We cannot accept customers or conduct any transactions from our office.
            </p>
          </div>
        </div>

        <div>
          <div className="foot-h">Company</div>
          <a href="https://www.notchup.app/about-us">About Us</a>
          <a href="https://www.notchup.app/relief-plan">Relief Plan</a>
          <a href="https://www.notchup.app/notchup-plus">NotchUp Plus</a>
          <a href="#">Slash</a>
          <a href="#">Influencers &amp; Affiliates</a>
        </div>

        <div>
          <div className="foot-h">Learn</div>
          <a href="https://www.notchup.app/advantage">No Credit Check</a>
          <a href="https://www.notchup.app/alternative">Payroll Loan</a>
          <a href="https://www.notchup.app/what-is-earned-wage-access">What is Earned Wage Access?</a>
          <a href="https://notchup.app/learn/">View all posts →</a>
        </div>

        <div>
          <div className="foot-h">Resources</div>
          <a href="https://www.notchup.app/terms-of-services">Terms of services</a>
          <a href="https://www.notchup.app/privacy-policy">Privacy policy</a>
          <a href="https://www.notchup.app/relief-plan-policy">Relief plan policy</a>
        </div>
      </div>

      <div className="container foot-fine">
        <p>
          <strong>About NotchUp Slash</strong> — Slash is an AI-powered bill negotiation service available exclusively to NotchUp members in Canada. We charge a one-time $35 activation fee plus 40% of the savings we secure in the first 12 months. If we can&apos;t find at least $100 in annual savings within six months, the service is completely free and your $35 is refunded.
        </p>
        <p>
          <strong>Not affiliated</strong> — NotchUp Slash is an independent service and is not affiliated with, endorsed by, or sponsored by Rogers Communications, BCE Inc. (Bell), TELUS Corporation, Videotron, Freedom Mobile, Shaw Communications, Fido Solutions, Koodo Mobile, or any of their subsidiaries. All carrier names, logos, and trademarks are the property of their respective owners and are used here for identification purposes only.
        </p>
        <p>
          <strong>Savings disclaimer</strong> — Savings figures shown ($487/yr average, 32% reduction, individual testimonial amounts) reflect outcomes of approved offers across NotchUp Slash members and are not a guarantee of future results. Actual savings depend on your current plan, carrier, and account history.
        </p>
        <p>
          Not all members will qualify for advances; depending on eligibility, advances range from $50 – $1,500. Subject to NotchUp&apos;s approval and policies.
        </p>
        <p>
          <strong>License Disclosure</strong> — British Columbia, January 11, 2024 License #86443
        </p>
      </div>

      <div className="container foot-bottom">
        <span>© 2026 NotchUp. All rights reserved.</span>
        <span style={{ color: "var(--muted)" }}>Made in Canada 🇨🇦</span>
      </div>
    </footer>
  );
}
