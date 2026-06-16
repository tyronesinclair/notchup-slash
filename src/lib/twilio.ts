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

/**
 * Extract a verification code from an inbound SMS body.
 * Telco codes are typically 4–8 digits. We take the first such run, but only
 * if the message isn't a keyword command (STOP/START/etc).
 */
export function parseOtp(body: string): string | null {
  if (!body) return null;
  if (isKeyword(body)) return null;
  // Prefer a standalone 4–8 digit group; tolerate a space in the middle (e.g. "12 34").
  const compact = body.replace(/(\d)\s+(\d)/g, "$1$2");
  const match = compact.match(/\b(\d{4,8})\b/);
  return match ? match[1] : null;
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
  if (!AUTH_TOKEN) {
    console.warn("[twilio] no auth token set — skipping inbound signature validation");
    return true;
  }
  if (!signature) return false;
  return twilio.validateRequest(AUTH_TOKEN, signature, url, params);
}
