import twilio from "twilio";

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;

/** True when Twilio is fully configured; otherwise we run in mock mode. */
export function twilioConfigured(): boolean {
  return !!(ACCOUNT_SID && AUTH_TOKEN && FROM_NUMBER);
}

type SendResult = { sent: boolean; mock: boolean; sid?: string; error?: string };

/** Send an SMS. No-ops (logs) and returns mock:true when Twilio isn't configured. */
export async function sendSms(to: string, body: string): Promise<SendResult> {
  if (!twilioConfigured()) {
    console.log(`[twilio mock] would send to ${to}: ${body}`);
    return { sent: false, mock: true };
  }
  try {
    const client = twilio(ACCOUNT_SID, AUTH_TOKEN);
    const msg = await client.messages.create({ to, from: FROM_NUMBER, body });
    return { sent: true, mock: false, sid: msg.sid };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error("[twilio] send failed:", error);
    return { sent: false, mock: false, error };
  }
}

export type OtpExtraction = {
  code: string | null;      // best-guess code, or null if none found
  candidates: string[];     // all plausible codes (for operator to pick when ambiguous)
  ambiguous: boolean;       // true when >1 equally-likely code was found
};

// Remove sequences that look like phone numbers or long reference/account ids so we
// don't mistake their digits for the verification code.
function stripNoise(s: string): string {
  return s
    // NANP phone numbers: +1 (604) 555-0123, 1-800-331-0500, 6045550123, etc.
    .replace(/\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, " ")
    // any run of 9+ digits (account numbers, long refs)
    .replace(/\b\d{9,}\b/g, " ");
}

function isYearLike(g: string): boolean {
  return /^(19|20)\d{2}$/.test(g);
}

/**
 * Extract a verification code from an inbound SMS body. Built to tolerate whatever
 * the customer sends: just the code, a chatty reply, or the entire pasted telco text.
 *
 * Strategy order (first confident hit wins):
 *  1. Code next to a cue word ("code is 482913", "PIN: 4821", "passcode 037512").
 *  2. Google-style "G-123456".
 *  3. The whole message is a code, possibly spaced/dashed ("482 913", "4-8-2-9-1-3").
 *  4. Scan the message (phone numbers/long ids removed) for 4–8 digit groups.
 */
export function extractOtp(body: string): OtpExtraction {
  const empty: OtpExtraction = { code: null, candidates: [], ambiguous: false };
  if (!body || isKeyword(body)) return empty;
  const text = body.trim();

  const single = (c: string): OtpExtraction => ({ code: c, candidates: [c], ambiguous: false });

  // 1. Cue word followed by the code.
  const cue = text.match(
    /\b(?:code|passcode|pass\s?code|pin|otp|password)\b\s*(?:is|are|=|:|#|-)?\s*([0-9](?:[0-9\s-]{2,8})[0-9])/i
  );
  if (cue) {
    const c = cue[1].replace(/[\s-]/g, "");
    if (c.length >= 4 && c.length <= 8) return single(c);
  }

  // 2. Google-style prefix.
  const g = text.match(/\bG-?\s?([0-9]{4,8})\b/i);
  if (g) return single(g[1]);

  // 3. Whole message is just the code (allow spaces/dashes between digits).
  const justDigits = text.replace(/[\s-]/g, "");
  if (/^\d{4,8}$/.test(justDigits)) return single(justDigits);

  // 4. Scan for contiguous 4–8 digit groups after removing phone-number noise.
  let groups = [...new Set(stripNoise(text).match(/\b\d{4,8}\b/g) ?? [])];
  // Drop year-looking 4-digit groups unless that's all we have.
  const nonYears = groups.filter((x) => !isYearLike(x));
  if (nonYears.length > 0) groups = nonYears;

  if (groups.length === 0) return empty;
  if (groups.length === 1) return single(groups[0]);

  // Multiple candidates: a lone 6-digit code (the most common length) wins; else ambiguous.
  const sixes = groups.filter((x) => x.length === 6);
  if (sixes.length === 1) return { code: sixes[0], candidates: groups, ambiguous: false };
  return { code: groups[0], candidates: groups, ambiguous: true };
}

const KEYWORDS = new Set([
  "stop", "stopall", "unsubscribe", "cancel", "end", "quit",
  "start", "yes", "unstop", "help", "info",
]);

/** True if the body is a carrier opt-out/opt-in/help keyword. */
export function isKeyword(body: string): boolean {
  return KEYWORDS.has(body.trim().toLowerCase());
}

/**
 * Validate an inbound Twilio webhook signature.
 * Returns true if valid, or if validation can't run (no auth token) — in which
 * case the caller logs a warning. `url` must be the exact public URL Twilio posted to.
 */
export function validateInboundSignature(
  signature: string | null,
  url: string,
  params: Record<string, string>
): boolean {
  // Escape hatch: lets you temporarily accept inbound while debugging a webhook URL
  // mismatch, instead of silently 403-ing (and dropping) every customer's code.
  if (process.env.TWILIO_SKIP_VALIDATION === "true") {
    console.warn("[twilio] TWILIO_SKIP_VALIDATION=true — accepting inbound without signature check");
    return true;
  }
  if (!AUTH_TOKEN) {
    console.warn("[twilio] no auth token set — skipping inbound signature validation");
    return true;
  }
  if (!signature) {
    console.warn("[twilio] inbound missing X-Twilio-Signature header");
    return false;
  }
  const ok = twilio.validateRequest(AUTH_TOKEN, signature, url, params);
  if (!ok) {
    // Most common cause: PUBLIC_BASE_URL + "/api/sms/incoming" doesn't exactly match the
    // URL configured in the Twilio console. Log the URL we validated against to diagnose.
    console.error(`[twilio] signature mismatch — validated against URL: ${url}`);
  }
  return ok;
}
