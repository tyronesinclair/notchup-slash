import Browserbase from "@browserbasehq/sdk";
import { browserbaseConfigured } from "./browserbase";

const API_KEY = process.env.BROWSERBASE_API_KEY;
const PROJECT_ID = process.env.BROWSERBASE_PROJECT_ID;

export type VerifyResult = {
  status: "valid" | "invalid" | "unknown";
  detail: string;
  // Debug info so we can tune the heuristics from real runs.
  debug?: { finalUrl?: string; bodySnippet?: string; reachedPassword?: boolean };
};

// Telcos reject a bad password BEFORE sending an OTP, so we can verify a credential
// by getting past (or failing) the password step — no OTP needed. This is a heuristic
// generic form-filler: good for standard login forms (Bell/Telus/etc), not Rogers
// (excluded — Transmit Security). Anything ambiguous returns "unknown" → manual fallback.
export async function verifyCredentials(opts: {
  loginUrl: string;
  username: string;
  password: string;
}): Promise<VerifyResult> {
  if (!browserbaseConfigured()) {
    return { status: "unknown", detail: "Browserbase not configured (mock mode)" };
  }
  const { loginUrl, username, password } = opts;
  const bb = new Browserbase({ apiKey: API_KEY! });

  const session = await bb.sessions.create({
    projectId: PROJECT_ID!,
    timeout: 180, // short — verification is quick
    region: "us-east-1",
    browserSettings: {
      viewport: { width: 1920, height: 1080 },
      solveCaptchas: true,
      blockAds: true,
      recordSession: false,
    },
    proxies: [{ type: "browserbase", geolocation: { country: process.env.BROWSERBASE_PROXY_COUNTRY || "CA" } }],
  });

  let result: VerifyResult = { status: "unknown", detail: "did not complete" };

  try {
    const { chromium } = await import("playwright-core");
    const browser = await chromium.connectOverCDP(session.connectUrl);
    const ctx = browser.contexts()[0] ?? (await browser.newContext());
    const page = ctx.pages()[0] ?? (await ctx.newPage());

    await page.goto(loginUrl, { waitUntil: "domcontentloaded", timeout: 35000 });
    await page.waitForTimeout(2500);

    // Username / email field — common patterns across standard login forms.
    const userSel = [
      'input[autocomplete="username"]',
      'input[type="email"]',
      'input[name*="user" i]',
      'input[name*="email" i]',
      'input[id*="user" i]',
      'input[id*="email" i]',
      'input[type="text"]:visible',
    ].join(", ");
    const userField = page.locator(userSel).first();
    await userField.fill(username, { timeout: 15000 });

    // Password may be on the same page or a second step ("Continue" after username).
    let passField = page.locator('input[type="password"]:visible').first();
    if (!(await passField.isVisible().catch(() => false))) {
      await page.getByRole("button", { name: /next|continue|sign in|log in|proceed/i }).first().click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(3000);
      passField = page.locator('input[type="password"]:visible').first();
    }
    const reachedPassword = await passField.isVisible().catch(() => false);
    if (!reachedPassword) {
      result = { status: "unknown", detail: "could not find the password field", debug: { finalUrl: page.url(), reachedPassword: false } };
      await browser.close();
      return result;
    }

    await passField.fill(password, { timeout: 15000 });
    await page.getByRole("button", { name: /sign in|log in|continue|submit|next/i }).first().click({ timeout: 5000 }).catch(() => page.keyboard.press("Enter"));
    await page.waitForTimeout(6000);

    const finalUrl = page.url();
    const body = (await page.evaluate(() => document.body.innerText || "")).toLowerCase();
    const snippet = body.slice(0, 400).replace(/\s+/g, " ");

    const invalidSignals = /(incorrect|invalid|wrong|does ?n[o']?t match|not recognized|isn[o']?t correct|unable to (sign|log) ?in|check your (username|password)|try again)/;
    const otpSignals = /(verification code|one[- ]?time|enter the code|we (just )?(sent|texted)|2[- ]?step|two[- ]?step|authenticat|security code|trust this|remember this device)/;
    const loggedInSignals = /(sign out|log ?out|my account|dashboard|overview|welcome back|account summary|bill|usage)/;

    if (invalidSignals.test(body)) {
      result = { status: "invalid", detail: "login rejected the password", debug: { finalUrl, bodySnippet: snippet, reachedPassword: true } };
    } else if (otpSignals.test(body) || loggedInSignals.test(body)) {
      result = { status: "valid", detail: "advanced past the password (OTP/2FA prompt or logged in)", debug: { finalUrl, bodySnippet: snippet, reachedPassword: true } };
    } else {
      result = { status: "unknown", detail: "could not read the outcome — needs a human", debug: { finalUrl, bodySnippet: snippet, reachedPassword: true } };
    }

    await browser.close();
  } catch (err) {
    result = { status: "unknown", detail: err instanceof Error ? err.message : String(err) };
  } finally {
    // Release the session promptly to stop billing.
    try {
      await bb.sessions.update(session.id, { projectId: PROJECT_ID!, status: "REQUEST_RELEASE" });
    } catch { /* ignore */ }
  }

  return result;
}
