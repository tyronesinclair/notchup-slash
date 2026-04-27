import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripe, PLAN_AMOUNT, PLAN_CURRENCY } from "@/lib/stripe";

// Called daily by Railway cron or external cron service
// Charges customers whose scheduled payment date has arrived
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

      // Find the Stripe customer
      const stripeCustomers = await stripe.customers.list({ email: customer.email, limit: 1 });
      if (!stripeCustomers.data.length) continue;

      const stripeCustomer = stripeCustomers.data[0];

      const pi = await stripe.paymentIntents.create({
        amount: PLAN_AMOUNT,
        currency: PLAN_CURRENCY,
        customer: stripeCustomer.id,
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
