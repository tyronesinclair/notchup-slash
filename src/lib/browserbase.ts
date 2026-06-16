import Browserbase from "@browserbasehq/sdk";

const API_KEY = process.env.BROWSERBASE_API_KEY;
const PROJECT_ID = process.env.BROWSERBASE_PROJECT_ID;

/** True when Browserbase is configured; otherwise we run in mock mode. */
export function browserbaseConfigured(): boolean {
  return !!(API_KEY && PROJECT_ID);
}

export type ActivationSession = {
  mock: boolean;
  liveViewUrl: string;
  sessionId: string;
  contextId: string | null;
};

/**
 * Start (or resume) a remote browser for a customer's telco activation.
 *
 * Persistence is the whole point: we reuse the customer's Browserbase Context so
 * the telco "trust this device" cookie survives across weeks of negotiation. The
 * proxy is geolocated to Canada so the telco sees a Canadian IP. Whether trust
 * actually persists across sessions is the make-or-break test to run with real
 * accounts (see plan Verification step 5); a sticky per-customer IP is the lever
 * if it doesn't.
 *
 * Returns mock data (pointing the iframe at /admin/mock-browser) when unconfigured,
 * so the whole operator loop is clickable before keys are added.
 */
export async function getOrCreateSession(opts: {
  existingContextId: string | null;
  startUrl?: string | null;
}): Promise<ActivationSession> {
  if (!browserbaseConfigured()) {
    return {
      mock: true,
      liveViewUrl: "/slash/admin/mock-browser",
      sessionId: "mock",
      contextId: opts.existingContextId,
    };
  }

  const bb = new Browserbase({ apiKey: API_KEY! });

  // First activation for this customer → create a persistent Context and keep its id.
  let contextId = opts.existingContextId;
  if (!contextId) {
    const ctx = await bb.contexts.create({ projectId: PROJECT_ID! });
    contextId = ctx.id;
  }

  // Always route through a Canadian residential IP so the telco sees a domestic login
  // (and the "trust this device" cookie persists for that IP). Requires a paid Browserbase
  // plan. Country is overridable via env only if we ever expand beyond Canada.
  const proxyCountry = process.env.BROWSERBASE_PROXY_COUNTRY || "CA";

  const session = await bb.sessions.create({
    projectId: PROJECT_ID!,
    keepAlive: true,
    region: "us-east-1", // closest BB region to Canada
    browserSettings: {
      context: { id: contextId, persist: true },
    },
    proxies: [{ type: "browserbase" as const, geolocation: { country: proxyCountry } }],
  });

  // Pre-navigate the remote browser to the telco login page so the operator lands
  // ready-to-type instead of an empty tab. Best-effort: if it fails, the session is
  // still usable and the operator can navigate manually. playwright-core is imported
  // lazily so it doesn't load on every dashboard render.
  if (opts.startUrl && session.connectUrl) {
    try {
      const { chromium } = await import("playwright-core");
      const browser = await chromium.connectOverCDP(session.connectUrl);
      const ctx = browser.contexts()[0] ?? (await browser.newContext());
      const page = ctx.pages()[0] ?? (await ctx.newPage());
      await page.goto(opts.startUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
      // keepAlive: true keeps the Browserbase session running after we disconnect.
      await browser.close();
    } catch (err) {
      console.error("[browserbase] pre-navigation failed:", err);
    }
  }

  const debug = await bb.sessions.debug(session.id);

  return {
    mock: false,
    liveViewUrl: debug.debuggerFullscreenUrl,
    sessionId: session.id,
    contextId,
  };
}
