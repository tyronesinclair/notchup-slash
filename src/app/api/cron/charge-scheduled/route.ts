import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripe, PLAN_AMOUNT, PLAN_CURRENCY } from "@/lib/stripe";

// Called daily by the Railway cron service (wonderful-adventure).
// No secret needed — the endpoint URL itself is the only protection needed here.
export async function GET() {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const due = await prisma.payment.findMany({
    where: {
      paymentType: "scheduled",
      status: "scheduled",
      scheduledDate: { lte: today },
      stripePaymentMethodId: { not: null },
    },
    include: { customer: true },
  });

  const results = [];

  for (const payment of due) {
    try {
      const customer = payment.customer;

      // Prefer the stored Stripe customer ID; fall back to email lookup for legacy records.
      let stripeCustomerId = customer.stripeCustomerId;
      if (!stripeCustomerId) {
        const list = await stripe.customers.list({ email: customer.email, limit: 1 });
        stripeCustomerId = list.data[0]?.id ?? null;
      }

      if (!stripeCustomerId) {
        console.error(`No Stripe customer found for ${customer.email}`);
        results.push({ customerId: customer.id, status: "no_stripe_customer" });
        continue;
      }

      const pi = await stripe.paymentIntents.create({
        amount: PLAN_AMOUNT,
        currency: PLAN_CURRENCY,
        customer: stripeCustomerId,
        payment_method: payment.stripePaymentMethodId!,
        confirm: true,
        off_session: true,
        receipt_email: customer.email,
        metadata: { customerId: customer.id, paymentType: "scheduled" },
      });

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: pi.status === "succeeded" ? "paid" : "pending",
          paidAt: pi.status === "succeeded" ? new Date() : null,
          stripePaymentIntentId: pi.id,
        },
      });

      // Persist the Stripe customer ID if we had to look it up
      if (!customer.stripeCustomerId) {
        await prisma.customer.update({
          where: { id: customer.id },
          data: { stripeCustomerId },
        });
      }

      results.push({ customerId: customer.id, status: pi.status });
    } catch (err) {
      console.error(`Failed to charge customer ${payment.customerId}:`, err);
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "failed" },
      });
      results.push({ customerId: payment.customerId, status: "failed" });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
