import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { stripe, PLAN_AMOUNT, PLAN_CURRENCY } from "@/lib/stripe";

// One-time admin endpoint: finds scheduled payments with no saved payment method in DB,
// looks up the customer's Stripe setup intent, patches the DB, then charges immediately.
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || token !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  // Find all scheduled payments that are due but have no payment method in DB
  const unpatchedPayments = await prisma.payment.findMany({
    where: {
      paymentType: "scheduled",
      status: "scheduled",
      scheduledDate: { lte: today },
      stripePaymentMethodId: null,
    },
    include: { customer: true },
  });

  const results = [];

  for (const payment of unpatchedPayments) {
    const email = payment.customer.email;
    try {
      // Find the Stripe customer
      let stripeCustomerId = payment.customer.stripeCustomerId;
      if (!stripeCustomerId) {
        const list = await stripe.customers.list({ email, limit: 1 });
        stripeCustomerId = list.data[0]?.id ?? null;
      }

      if (!stripeCustomerId) {
        results.push({ email, status: "no_stripe_customer" });
        continue;
      }

      // Find the most recent succeeded setup intent for this customer
      const setupIntents = await stripe.setupIntents.list({
        customer: stripeCustomerId,
        limit: 10,
      });
      const succeeded = setupIntents.data.find(
        (si) => si.status === "succeeded" && si.payment_method
      );

      if (!succeeded || !succeeded.payment_method) {
        results.push({ email, status: "no_saved_card" });
        continue;
      }

      const paymentMethodId = succeeded.payment_method as string;

      // Patch the DB with the payment method
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          stripePaymentMethodId: paymentMethodId,
          ...((!payment.customer.stripeCustomerId) && { customer: { update: { stripeCustomerId } } }),
        },
      });

      // Charge immediately
      const pi = await stripe.paymentIntents.create({
        amount: PLAN_AMOUNT,
        currency: PLAN_CURRENCY,
        customer: stripeCustomerId,
        payment_method: paymentMethodId,
        confirm: true,
        off_session: true,
        receipt_email: email,
        metadata: { customerId: payment.customerId, paymentType: "scheduled_patched" },
      });

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: pi.status === "succeeded" ? "paid" : "pending",
          paidAt: pi.status === "succeeded" ? new Date() : null,
          stripePaymentIntentId: pi.id,
        },
      });

      // Persist Stripe customer ID if it was missing
      if (!payment.customer.stripeCustomerId) {
        await prisma.customer.update({
          where: { id: payment.customerId },
          data: { stripeCustomerId },
        });
      }

      results.push({ email, status: pi.status, chargeId: pi.id });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`patch-and-charge failed for ${email}:`, err);
      results.push({ email, status: "error", error: message });
    }
  }

  return NextResponse.json({
    found: unpatchedPayments.length,
    processed: results.length,
    results,
  });
}
