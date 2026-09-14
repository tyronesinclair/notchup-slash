import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      {/* Site-wide footer: same five columns as notchup.app/tools, /learn, Split and
          Shield. Column order and links: docs/site-footer-spec.md in
          notchup-tools-and-calculators. */}
      <div className="container">
        <div className="footer-brand">
          <a href="https://notchup.app" className="footer-logo">
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
            <a href="mailto:hello@notchup.app" className="footer-email">hello@NotchUp.app</a>
            <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 12, lineHeight: 1.5, maxWidth: 320 }}>
              NotchUp only offers online services. We cannot accept customers or conduct any transactions from our office.
            </p>
          </div>
        </div>
      </div>

      <nav className="container footer-grid" aria-label="Footer">
        <div>
          <div className="foot-h">Products</div>
          <a href="https://apply.notchup.app">Wage Advance</a>
          <a href="https://www.notchup.app/notchup-plus">NotchUp Plus</a>
          <a href="https://offer.notchup.app/split">Split</a>
          <Link href="/">Slash</Link>
          <a href="https://offer.notchup.app/shield">Shield</a>
        </div>

        <div>
          <div className="foot-h">Tools</div>
          <a href="https://notchup.app/tools/">All Tools</a>
          <a href="https://notchup.app/tools/statutory-holiday-pay-calculator/">Statutory Holiday Pay</a>
          <a href="https://notchup.app/tools/hourly-wage-calculator/">Hourly Wage</a>
          <a href="https://notchup.app/tools/vacation-pay-calculator/">Vacation Pay</a>
          <a href="https://notchup.app/tools/overtime-calculator/">Overtime Pay</a>
          <a href="https://notchup.app/tools/take-home-pay-calculator/">Take-Home Pay</a>
        </div>

        <div>
          <div className="foot-h">Learn</div>
          <a href="https://notchup.app/learn/">All Articles</a>
          <a href="https://notchup.app/learn/100-instant-loan-canada/">$100 Instant Loan Canada</a>
          <a href="https://notchup.app/learn/everyone-approved-loans-canada-no-credit-check-what-to-know/">No Credit Check Loans</a>
          <a href="https://notchup.app/learn/best-apps-like-bree-and-nyble-in-canada-2026/">Apps Like Bree &amp; Nyble</a>
        </div>

        <div>
          <div className="foot-h">Resources</div>
          <a href="https://www.notchup.app/terms-of-services">Terms of Service</a>
          <a href="https://www.notchup.app/privacy-policy">Privacy Policy</a>
          <a href="https://www.notchup.app/relief-plan-policy">Relief Plan Policy</a>
        </div>

        <div>
          <div className="foot-h">Company</div>
          <a href="https://www.notchup.app/about-us">About Us</a>
          <a href="https://www.notchup.app/relief-plan">Relief Plan</a>
          <a href="tel:+17784005126">(778) 400-5126</a>
          <a href="mailto:hello@notchup.app">hello@NotchUp.app</a>
        </div>
      </nav>

      <div className="container foot-fine" data-nosnippet>
        <p>
          <strong>About NotchUp Slash</strong> — Slash is an AI bill-negotiation agent for Canadians, by NotchUp. It&apos;s $0 today, then $15/month (CAD) starting on the payday you choose, covering unlimited internet, mobile, TV and home-phone bills, negotiated one at a time. We keep 0% of your savings. Cancel before your first payday and you&apos;re never charged; after your first payment, a full refund is available within 30 days, no questions asked. Slash negotiates with your provider&apos;s retention team through your account and never changes your plan without your approval.
        </p>
        <p>
          <strong>Not affiliated</strong> — NotchUp Slash is an independent service and is not affiliated with, endorsed by, or sponsored by Rogers Communications, BCE Inc. (Bell), TELUS Corporation, Shaw, Videotron, Freedom Mobile, Fido Solutions, Koodo Mobile, Virgin Plus, Cogeco, Eastlink, or any of their subsidiaries. All carrier names, logos, and trademarks are the property of their respective owners and are used here for identification purposes only.
        </p>
        <p>
          <strong>Savings disclaimer</strong> — Savings figures shown ($487/yr, ~32% reduction, calculator results) are estimates based on typical retention-offer reductions for comparable Canadian plans; they are not results from Slash customers and not a guarantee. The example stories and sample bill on our site are illustrative, not real customer quotes. Actual savings depend on your plan, provider, and account history. Competitor fee ranges cited are typical industry success-fee percentages, not claims about any specific company.
        </p>
        <p>
          <strong>License Disclosure</strong> — British Columbia, January 11, 2024 License #86443
        </p>
      </div>

      <div className="container foot-bottom">
        <span>© {new Date().getFullYear()} NotchUp. All rights reserved.</span>
        <span style={{ color: "var(--muted)" }}>Made in Canada 🇨🇦</span>
      </div>
    </footer>
  );
}
