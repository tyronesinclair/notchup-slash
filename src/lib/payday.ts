// Payday helpers. The customer picks a calendar date; the first $15 is charged that day
// (Stripe trial_end at 14:00Z ≈ 10am ET / 7am PT, so it lands "in the morning" everywhere).
export const PAYDAY_MIN_DAYS = 1;
export const PAYDAY_MAX_DAYS = 31;

function localISO(d: Date) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }

export function paydayBounds(now = new Date()) {
  return { min: localISO(addDays(now, PAYDAY_MIN_DAYS)), max: localISO(addDays(now, PAYDAY_MAX_DAYS)) };
}

export function isValidPayday(iso: string, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const { min, max } = paydayBounds(now);
  return iso >= min && iso <= max;
}

// Quick picks: the common Canadian pay cycles. Deduped, in range, soonest first.
export function paydayChips(now = new Date()): { label: string; iso: string }[] {
  const { min, max } = paydayBounds(now);
  const out: { label: string; iso: string }[] = [];
  const push = (label: string, d: Date) => { const iso = localISO(d); if (iso >= min && iso <= max && !out.some((o) => o.iso === iso)) out.push({ label, iso }); };
  const dow = now.getDay(); // 0 Sun … 5 Fri
  const daysToFri = (5 - dow + 7) % 7 || 7; // next Friday, never today
  push("This Friday", addDays(now, daysToFri));
  push("Next Friday", addDays(now, daysToFri + 7));
  const fifteenth = new Date(now.getFullYear(), now.getMonth(), 15);
  push("The 15th", fifteenth > now ? fifteenth : new Date(now.getFullYear(), now.getMonth() + 1, 15));
  const eom = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  push("Last day of the month", eom > now ? eom : new Date(now.getFullYear(), now.getMonth() + 2, 0));
  return out.sort((a, b) => (a.iso < b.iso ? -1 : 1)).slice(0, 4);
}

export function paydayShort(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" });
}
export function paydayLong(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" });
}

// Server: the Stripe trial_end for a payday (unix seconds).
export function paydayToTrialEnd(iso: string) {
  return Math.floor(Date.parse(iso + "T14:00:00Z") / 1000);
}
export function trialEndToPayday(unix: number) {
  return new Date(unix * 1000).toISOString().slice(0, 10);
}
