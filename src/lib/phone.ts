// Phone number helpers. Canada/US use the North American Numbering Plan (+1).
// We normalize everything to E.164 so inbound Twilio numbers (already E.164)
// match what we stored at signup.

/**
 * Normalize a raw phone string to E.164 (+1XXXXXXXXXX) for Canada/US.
 * Returns null if it can't be made into a valid 10-digit NANP number.
 */
export function normalizeE164(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let digits = raw.replace(/[^\d]/g, "");
  // Strip a leading country code 1 if present (11 digits starting with 1).
  if (digits.length === 11 && digits.startsWith("1")) {
    digits = digits.slice(1);
  }
  if (digits.length !== 10) return null;
  // NANP area code and exchange can't start with 0 or 1.
  if (digits[0] === "0" || digits[0] === "1") return null;
  return `+1${digits}`;
}

/** Format an E.164 (or raw) number as (XXX) XXX-XXXX for display. */
export function formatDisplay(value: string | null | undefined): string {
  const e164 = normalizeE164(value);
  if (!e164) return value || "";
  const d = e164.slice(2); // drop +1
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/** True if the value can be normalized to a valid E.164 number. */
export function isValidPhone(value: string | null | undefined): boolean {
  return normalizeE164(value) !== null;
}
