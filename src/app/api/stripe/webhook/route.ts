import { NextRequest, NextResponse } from "next/server";
import { stripe, SUB_AMOUNT } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

// Stripe's newer API moved invoice.subscription to invoice.parent.subscription_details.subscription.
function invoiceSubscriptionId(obj: unknown): string | null {
  const o = obj as {
    subscription?: string | { id: string } | null;
    parent?: { subscription_details?: { subscription?: string | { id: string } | null } | null } | null;
  };
  const raw = o.subscription ?? o.parent?.subscription_details?.subscription ?? null;
  if (!raw) return null;
  return typeof raw === "string" ? raw : raw.id;
}

async function recoverFromSubscription(subId: string) {
  const sub = await stripe.subscriptions.retrieve(subId);
  const email = sub.metadata?.email?.trim().toLowerCase();
  if (!email) return;
  const name = sub.metadata?.name || email.split("@")[0];
  let services: { t?: string; p?: string }[] = [];
  try { services = JSON.parse(sub.metadata?.services || "[]"); } catch {}
  const stripeCustomerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  const customer = await prisma.customer.upsert({
    where: { email },
    update: { stripeCustomerId },
    create: { name, email, phone: "", stripeCustomerId },
  });
  for (const s of services) {
    if (!s.t || !s.p) continue;
    const exists = await prisma.service.findFirst({ where: { customerId: customer.id, provider: s.p, serviceType: s.t } });
    if (!exists) await prisma.service.create({ data: { customerId: customer.id, serviceType: s.t, provider: s.p, encryptedCredentials: "" } });
  }
  await prisma.payment.upsert({
    where: { customerId: customer.id },
    update: { paymentType: "subscription", stripeSubscriptionId: subId, subscriptionStatus: "active", status: "paid", amount: SUB_AMOUNT, paidAt: new Date() },
    create: { customerId: customer.id, paymentType: "subscription", stripeSubscriptionId: subId, subscriptionStatus: "active", status: "paid", amount: SUB_AMOUNT, paidAt: new Date() },
  });
  console.log("webhook: recovered orphaned subscription", subId, "for", email);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const obj = event.data.object as unknown;

  try {
    // ── Subscription lifecycle ($15/mo) ──
    if (event.type === "invoice.paid") {
      const subId = invoiceSubscriptionId(obj);
      if (subId) {
        const { count } = await prisma.payment.updateMany({
          where: { stripeSubscriptionId: subId },
          data: { status: "paid", subscriptionStatus: "active", amount: SUB_AMOUNT, paidAt: new Date() },
        });
        // Backstop: the customer paid but /api/submit never ran (page closed/refreshed).
        // Rebuild the record from the subscription metadata so no paid customer is orphaned.
        if (count === 0) await recoverFromSubscription(subId);
      }
    } else if (event.type === "invoice.payment_failed") {
      const subId = invoiceSubscriptionId(obj);
      if (subId) {
        // Deliberately NOT "failed": the legacy admin retry flow charges a one-time PI,
        // which is wrong for a subscription. Stripe's smart retries handle this.
        await prisma.payment.updateMany({
          where: { stripeSubscriptionId: subId },
          data: { status: "past_due", subscriptionStatus: "past_due" },
        });
      }
    } else if (event.type === "customer.subscription.deleted") {
      const sub = obj as { id: string };
      await prisma.payment.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: { status: "cancelled", subscriptionStatus: "cancelled" },
      });
    }

    // ── Legacy one-time flows (grandfathered $35 customers) ──
    else if (event.type === "payment_intent.succeeded") {
      const pi = obj as { id: string };
      await prisma.payment.updateMany({
        where: { stripePaymentIntentId: pi.id },
        data: { status: "paid", paidAt: new Date() },
      });
    } else if (event.type === "setup_intent.succeeded") {
      const si = obj as { metadata?: { email?: string }; payment_method?: string | null };
      const email = si.metadata?.email;
      if (email) {
        const customer = await prisma.customer.findUnique({ where: { email } });
        if (customer && si.payment_method) {
          await prisma.payment.updateMany({
            where: { customerId: customer.id },
            data: { stripePaymentMethodId: si.payment_method as string },
          });
        }
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    // Still 200 so Stripe doesn't hammer retries for a DB hiccup; reconcile covers gaps.
  }

  return NextResponse.json({ received: true });
}
