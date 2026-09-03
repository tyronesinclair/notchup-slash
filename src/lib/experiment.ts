// Client-side A/B experiment + attribution helpers. Mirrors NotchUp Shield's approach:
// variant from ?var= → localStorage → random; persisted so a visitor always sees the same
// hero; carried on every tracking event and stored on the Customer at signup so paid
// conversions can be attributed per variant in the admin.
//
// Only the LANDING page assigns a variant (assign=true). Other pages read it — someone
// deep-linked straight to /sign-up is never tagged with a hero they didn't see.

export type Variant = "a" | "b" | "c";

// Add "c" here to run a 3-way test. With a few thousand views, 2 arms reach
// significance on click-through; 3 arms usually don't.
export const ACTIVE_VARIANTS: Variant[] = ["a", "b"];

export const HERO_VARIANTS: Record<Variant, { lead: string; struck: string; tail: string; lede: string }> = {
  // a = control: agent framing (the copy as designed)
  a: {
    lead: "The AI agent that",
    struck: "lowers your bills",
    tail: "so you don't have to.",
    lede: "Slash logs into your Rogers, Bell or Telus account, finds the overcharges, and negotiates them down with the retention team. You pass along one sign-in code, then just approve the win. No hold music. No awkward calls.",
  },
  // b = outcome + price + guarantee up front
  b: {
    lead: "Lower your",
    struck: "phone & internet bill",
    tail: "without a single call.",
    lede: "Slash negotiates with Rogers, Bell or Telus for you — $15/mo, and you keep 100% of the savings. Pass along one sign-in code, approve the win, done. Not for you? Money back in 30 days.",
  },
  // c = loyalty-tax pain framing (defined for later; preview with ?var=c)
  c: {
    lead: "You're paying a",
    struck: "loyalty tax.",
    tail: "Slash gets it back.",
    lede: "Your provider quietly raises your rate every year and bets you won't fight it. Slash logs in, finds the overcharges, and negotiates them down. Every dollar it wins is yours.",
  },
};

const VAR_KEY = "slash_var";
const UTM_KEY = "slash_utm";

export function getVariant(assign = false): Variant | null {
  if (typeof window === "undefined") return null;
  try {
    // Explicit preview/override: any defined variant, e.g. ?var=c
    const override = new URLSearchParams(window.location.search).get("var");
    if (override && override in HERO_VARIANTS) {
      localStorage.setItem(VAR_KEY, override);
      return override as Variant;
    }
    const stored = localStorage.getItem(VAR_KEY);
    if (stored && stored in HERO_VARIANTS) return stored as Variant;
    if (!assign) return null;
    const v = ACTIVE_VARIANTS[Math.floor(Math.random() * ACTIVE_VARIANTS.length)];
    localStorage.setItem(VAR_KEY, v);
    return v;
  } catch {
    return null;
  }
}

export type Attribution = { utm_source?: string; utm_medium?: string; utm_campaign?: string; utm_content?: string };

// First-touch UTMs, persisted across the funnel so /api/submit can store them.
export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    const p = new URLSearchParams(window.location.search);
    const fresh: Attribution = {};
    for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const) {
      const v = p.get(k);
      if (v) fresh[k] = v.slice(0, 120);
    }
    const stored = localStorage.getItem(UTM_KEY);
    if (stored) return JSON.parse(stored); // keep first touch
    if (Object.keys(fresh).length) localStorage.setItem(UTM_KEY, JSON.stringify(fresh));
    return fresh;
  } catch {
    return {};
  }
}
