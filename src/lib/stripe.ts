import Stripe from "stripe";
import { createHmac } from "crypto";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY env var is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-04-22.dahlia",
});

// Legacy one-time activation (grandfathered $35 customers).
export const PLAN_AMOUNT = 3500; // $35.00 CAD in cents
export const PLAN_CURRENCY = "cad";

// Current offer: $15/month subscription, 0% of savings.
export const SUB_AMOUNT = 1500; // $15.00 CAD in cents
export const SUB_PRICE_LOOKUP_KEY = "slash_monthly_15";

let cachedPriceId: string | null = process.env.STRIPE_PRICE_ID ?? null;

/**
 * Find (by lookup_key) or create the recurring $15/mo price. Cached per process.
 * Same pattern as NotchUp Shield's ensurePrice().
 */
export async function ensurePrice(): Promise<string> {
  if (cachedPriceId) return cachedPriceId;
  const prices = await stripe.prices.search({ query: `lookup_key:'${SUB_PRICE_LOOKUP_KEY}'` });
  if (prices.data.length) {
    cachedPriceId = prices.data[0].id;
    return cachedPriceId;
  }
  const product = await stripe.products.create({ name: "NotchUp Slash — AI bill negotiation" });
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: SUB_AMOUNT,
    currency: PLAN_CURRENCY,
    recurring: { interval: "month" },
    lookup_key: SUB_PRICE_LOOKUP_KEY,
  });
  console.log("slash: created Stripe price", price.id);
  cachedPriceId = price.id;
  return cachedPriceId;
}

// ── Self-serve billing links (HMAC token, emailed only to the subscriber) ──
const PUBLIC_BASE = process.env.PUBLIC_BASE_URL ?? "https://notchup.app/slash";

export function manageToken(email: string): string {
  const secret = process.env.BILLING_TOKEN_SECRET || process.env.ADMIN_SECRET || "dev";
  return createHmac("sha256", secret)
    .update("slash-manage:" + email.trim().toLowerCase())
    .digest("hex")
    .slice(0, 32);
}

export function manageUrl(email: string): string {
  return `${PUBLIC_BASE}/api/billing/manage?e=${encodeURIComponent(email.trim().toLowerCase())}&t=${manageToken(email)}`;
}
