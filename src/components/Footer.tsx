export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <a href="https://notchup.app" style={{ display: "inline-block" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://cdn.prod.website-files.com/663d33e48a497e68ec23fc06/66427492c358294cac47f56b_NU%201B.png"
              alt="NotchUp"
              style={{ height: 24, width: "auto", display: "block" }}
            />
          </a>
          <p style={{ color: "var(--ink-soft)", fontSize: 14, marginTop: 14, maxWidth: 320, lineHeight: 1.5 }}>
            Slash — the AI agent that lowers your bills. A NotchUp product.
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
          <a href="https://notchup.app/slash">Slash</a>
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
          <strong>About NotchUp Slash</strong> — Slash is an AI bill-negotiation agent for Canadians, by NotchUp. It&apos;s a $15/month subscription that covers unlimited internet, mobile, TV and home-phone bills, negotiated one at a time. We keep 0% of your savings. Cancel anytime; a full refund is available within 30 days of signing up, no questions asked. Slash negotiates with your provider&apos;s retention team through your account and never changes your plan without your approval.
        </p>
        <p>
          <strong>Not affiliated</strong> — NotchUp Slash is an independent service and is not affiliated with, endorsed by, or sponsored by Rogers Communications, BCE Inc. (Bell), TELUS Corporation, Shaw, Videotron, Freedom Mobile, Fido Solutions, Koodo Mobile, Virgin Plus, Cogeco, Eastlink, or any of their subsidiaries. All carrier names, logos, and trademarks are the property of their respective owners and are used here for identification purposes only.
        </p>
        <p>
          <strong>Savings disclaimer</strong> — Savings figures shown ($487/yr, ~32% reduction, calculator results) are estimates based on typical retention-offer reductions for comparable Canadian plans; they are not results from Slash customers and not a guarantee. The example stories and sample bill on this page are illustrative, not real customer quotes. Actual savings depend on your plan, provider, and account history. Competitor fee ranges cited are typical industry success-fee percentages, not claims about any specific company.
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
