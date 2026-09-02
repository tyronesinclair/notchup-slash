// Server component — plain crawlable text (this section carries a lot of SEO weight).

type Group = {
  tone: "now" | "soon" | "cancel" | "no";
  kicker: string;
  title: string;
  body: string;
  items: string[];
};

const groups: Group[] = [
  {
    tone: "now",
    kicker: "Slash negotiates these now",
    title: "Internet · Mobile · TV · Home phone",
    body: "Rogers, Bell, Telus and most major Canadian carriers, plus many regional ones. This is where the biggest loyalty tax lives, and where retention teams have the most room to move.",
    items: ["Rogers", "Bell", "Telus", "Shaw", "Videotron", "Freedom Mobile", "Fido", "Koodo", "Virgin Plus", "Cogeco", "Eastlink", "Regional carriers"],
  },
  {
    tone: "soon",
    kicker: "Coming next",
    title: "Home security · Insurance",
    body: "Same playbook, new providers. We'll email every subscriber the moment we can work these — nothing to add on your end yet.",
    items: ["ADT", "Telus SmartHome", "Home insurance", "Auto insurance"],
  },
  {
    tone: "cancel",
    kicker: "Can't negotiate — flat-rate subscriptions",
    title: "Streaming · Gym · Software",
    body: "These don't haggle, so we won't pretend to. We'll tell you plainly and point you to the fastest way out if you want it.",
    items: ["Netflix", "Crave", "Spotify", "Gym memberships", "App subscriptions"],
  },
  {
    tone: "no",
    kicker: "Regulated — nobody can negotiate these",
    title: "Hydro · Gas · Water",
    body: "Rates are set by regulators, not sales teams. We won't pretend otherwise — we'll point you to the real levers (plans, usage, rebates) instead.",
    items: ["BC Hydro", "Hydro-Québec", "Ontario utilities", "Natural gas", "Water"],
  },
];

export default function Bills() {
  return (
    <section id="bills" className="bills">
      <div className="container">
        <div className="section-header">
          <div className="kicker">Which bills</div>
          <h2 className="section-h">
            Straight answer on every bill. <span style={{ color: "var(--muted)" }}>Even the ones we can&apos;t touch.</span>
          </h2>
          <p className="section-sub">
            Add as many bills as you want under one $15/mo subscription. We work them one at a time, so each gets our full attention — starting with the first one you add.
          </p>
        </div>

        <div className="bills-grid">
          {groups.map((g) => (
            <div key={g.kicker} className={`bill-group bill-${g.tone}`}>
              <div className="bill-kicker">{g.kicker}</div>
              <h3 className="bill-title">{g.title}</h3>
              <p className="bill-body">{g.body}</p>
              <ul className="bill-chips">
                {g.items.map((it) => (<li key={it} className="bill-chip">{it}</li>))}
              </ul>
            </div>
          ))}
        </div>

        <p className="bill-note">
          Don&apos;t see your provider? Add it as &ldquo;Other&rdquo; at sign-up. If we can&apos;t work it, we&apos;ll say so before you&apos;re charged for a second month.
        </p>
      </div>
    </section>
  );
}
