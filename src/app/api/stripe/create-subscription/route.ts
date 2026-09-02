import { NextRequest, NextResponse } from "next/server";
import { stripe, ensurePrice } from "@/lib/stripe";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Creates the $15/mo subscription in "default_incomplete" state and returns the
// invoice's confirmation secret for the Payment Element. The card entered is vaulted
// to the Customer as their default (save_default_payment_method: on_subscription),
// so the subscription renews itself and add-on services can be charged later with
// the customer's consent. Same pattern as NotchUp Shield.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase().slice(0, 254);
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const priceId = await ensurePrice();

    // One Stripe Customer per email — the permanent wallet every NotchUp product charges.
    const existing = await stripe.customers.list({ email, limit: 1 });
    const customer = existing.data[0] ?? (await stripe.customers.create({ email }));

    const sub = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: {
        save_default_payment_method: "on_subscription",
        payment_method_types: ["card"],
      },
      expand: ["latest_invoice.confirmation_secret"],
      metadata: { email, product: "slash", plan: "monthly_15" },
    });

    const invoice = sub.latest_invoice as unknown as
      | { confirmation_secret?: { client_secret?: string } }
      | null;
    const clientSecret = invoice?.confirmation_secret?.client_secret;
    if (!clientSecret) {
      throw new Error("no confirmation secret on subscription invoice");
    }

    return NextResponse.json({
      clientSecret,
      subscriptionId: sub.id,
      customerId: customer.id,
      priceId,
    });
  } catch (err) {
    console.error("create-subscription error:", err);
    return NextResponse.json({ error: "Subscription setup failed" }, { status: 500 });
  }
}
