import { NextRequest, NextResponse } from "next/server";
import { stripe, ensurePrice } from "@/lib/stripe";
import { isValidPayday, paydayToTrialEnd } from "@/lib/payday";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// $0 today: the $15/mo subscription starts as a trial that ends on the customer's next
// payday. The Payment Element runs in setup mode against the subscription's
// pending_setup_intent, so the card is vaulted as the default and Stripe charges it
// automatically on payday (with smart retries). No card by payday → Stripe cancels.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase().slice(0, 254);
    if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    const payday = String(body.payday ?? "");
    if (!isValidPayday(payday)) return NextResponse.json({ error: "Pick a payday between tomorrow and 31 days from now" }, { status: 400 });

    // Stash name + bills in metadata so the webhook can rebuild the customer record if
    // the confirmation page never completes (refresh, private mode, closed tab).
    const name = String(body.name ?? "").slice(0, 120);
    const services = Array.isArray(body.services)
      ? JSON.stringify(body.services.map((s: { serviceType?: string; provider?: string }) => ({ t: s.serviceType, p: s.provider })).slice(0, 8)).slice(0, 480)
      : "";

    const priceId = await ensurePrice();

    // One Stripe Customer per email — the permanent wallet every NotchUp product charges.
    const existing = await stripe.customers.list({ email, limit: 1 });
    const customer = existing.data[0] ?? (await stripe.customers.create({ email, name: name || undefined }));

    const sub = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      trial_end: paydayToTrialEnd(payday),
      trial_settings: { end_behavior: { missing_payment_method: "cancel" } },
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription", payment_method_types: ["card"] },
      expand: ["pending_setup_intent"],
      metadata: { email, name, services, payday, product: "slash", plan: "monthly_15_payday" },
    });

    const psi = sub.pending_setup_intent as unknown as { client_secret?: string } | null;
    const clientSecret = psi?.client_secret;
    if (!clientSecret) throw new Error("no pending_setup_intent on trialing subscription");

    return NextResponse.json({ clientSecret, mode: "setup", subscriptionId: sub.id, customerId: customer.id, priceId, payday });
  } catch (err) {
    console.error("create-subscription error:", err);
    return NextResponse.json({ error: "Subscription setup failed" }, { status: 500 });
  }
}
