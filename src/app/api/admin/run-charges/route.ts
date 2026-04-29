import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { stripe, PLAN_AMOUNT, PLAN_CURRENCY } from "@/lib/stripe";

// Admin-triggered version of the daily cron: charges all scheduled payments due today (PST).
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || token !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // End of today in America/Vancouver timezone
  const now = new Date();
  const utcMs = now.getTime();
  const vanMs = new Date(now.toLocaleString("en-US", { timeZone: "America/Vancouver" })).getTime();
  const offsetMs = utcMs - vanMs;
  const todayVan = now.toLocaleDateString("en-CA", { timeZone: "America/Vancouver" });
  const [vy, vm, vd] = todayVan.split("-").map(Number);
  const endOfDayVan = new Date(vy, vm - 1, vd, 23, 59, 59, 999);
  const cutoff = new Date(endOfDayVan.getTime() + offsetMs);

  const due = await prisma.payment.findMany({
    where: {
      paymentType: "scheduled",
      status: "scheduled",
      scheduledDate: { lte: cutoff },
      stripePaymentMethodId: { not: null },
    },
    include: { customer: true },
  });

  const results = [];

  for (const payment of due) {
    const customer = payment.customer;
    try {
      let stripeCustomerId = customer.stripeCustomerId;
      if (!stripeCustomerId) {
        const list = await stripe.customers.list({ email: customer.email, limit: 1 });
        stripeCustomerId = list.data[0]?.id ?? null;
      }

      if (!stripeCustomerId) {
        results.push({ email: customer.email, status: "no_stripe_customer" });
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

      if (!customer.stripeCustomerId) {
        await prisma.customer.update({
          where: { id: customer.id },
          data: { stripeCustomerId },
        });
      }

      results.push({ email: customer.email, status: pi.status, chargeId: pi.id });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`run-charges failed for ${customer.email}:`, err);
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "failed" },
      });
      results.push({ email: customer.email, status: "error", error: message });
    }
  }

  return NextResponse.json({
    cutoff: cutoff.toISOString(),
    found: due.length,
    processed: results.length,
    results,
  });
}
