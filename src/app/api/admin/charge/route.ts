import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { stripe, PLAN_CURRENCY } from "@/lib/stripe";

// Ad-hoc off-session charge against the customer's saved card. Requires the consent
// they gave at checkout ("save my card for NotchUp services I choose to add later").
// One API call, no form, no redirect — the same wiring Shield proved with real money.
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || token !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { customerId, amountCents, reason } = await req.json();
  const amount = Number(amountCents);
  if (!customerId || !Number.isInteger(amount) || amount < 50 || amount > 100000 || !reason?.trim()) {
    return NextResponse.json({ error: "customerId, amountCents (50–100000) and reason are required" }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  if (!customer.chargeConsent) {
    return NextResponse.json({ error: "Customer has not consented to add-on charges." }, { status: 403 });
  }
  if (!customer.stripeCustomerId) {
    return NextResponse.json({ error: "No Stripe customer on file." }, { status: 400 });
  }

  // Default payment method: the card vaulted at subscription time.
  const sc = await stripe.customers.retrieve(customer.stripeCustomerId);
  if (sc.deleted) return NextResponse.json({ error: "Stripe customer deleted." }, { status: 400 });
  let paymentMethodId =
    typeof sc.invoice_settings?.default_payment_method === "string"
      ? sc.invoice_settings.default_payment_method
      : sc.invoice_settings?.default_payment_method?.id ?? null;
  if (!paymentMethodId) {
    const pms = await stripe.paymentMethods.list({ customer: customer.stripeCustomerId, type: "card", limit: 1 });
    paymentMethodId = pms.data[0]?.id ?? null;
  }
  if (!paymentMethodId) {
    return NextResponse.json({ error: "No saved card on file." }, { status: 400 });
  }

  const charge = await prisma.charge.create({
    data: { customerId: customer.id, amount, currency: PLAN_CURRENCY, reason: String(reason).slice(0, 200) },
  });

  try {
    const pi = await stripe.paymentIntents.create({
      amount,
      currency: PLAN_CURRENCY,
      customer: customer.stripeCustomerId,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
      receipt_email: customer.email,
      description: `NotchUp Slash — ${String(reason).slice(0, 100)}`,
      metadata: { customerId: customer.id, chargeId: charge.id, reason: String(reason).slice(0, 200) },
    });

    await prisma.charge.update({
      where: { id: charge.id },
      data: { stripePaymentIntentId: pi.id, status: pi.status === "succeeded" ? "succeeded" : "pending" },
    });

    return NextResponse.json({ ok: true, chargeId: charge.id, paymentIntentId: pi.id, status: pi.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await prisma.charge.update({ where: { id: charge.id }, data: { status: "failed" } });
    console.error("ad-hoc charge failed:", err);
    return NextResponse.json({ error: message, chargeId: charge.id }, { status: 402 });
  }
}
