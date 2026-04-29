import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { stripe, PLAN_AMOUNT, PLAN_CURRENCY } from "@/lib/stripe";

// Retry a single failed scheduled payment by payment ID.
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || token !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { paymentId } = await req.json();
  if (!paymentId) {
    return NextResponse.json({ error: "paymentId required" }, { status: 400 });
  }

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { customer: true },
  });

  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  if (!payment.stripePaymentMethodId) {
    return NextResponse.json({ error: "No payment method saved" }, { status: 400 });
  }

  const customer = payment.customer;

  let stripeCustomerId = customer.stripeCustomerId;
  if (!stripeCustomerId) {
    const list = await stripe.customers.list({ email: customer.email, limit: 1 });
    stripeCustomerId = list.data[0]?.id ?? null;
  }

  if (!stripeCustomerId) {
    return NextResponse.json({ error: "No Stripe customer found" }, { status: 400 });
  }

  try {
    const pi = await stripe.paymentIntents.create({
      amount: PLAN_AMOUNT,
      currency: PLAN_CURRENCY,
      customer: stripeCustomerId,
      payment_method: payment.stripePaymentMethodId,
      confirm: true,
      off_session: true,
      receipt_email: customer.email,
      metadata: { customerId: customer.id, paymentType: "scheduled_retry" },
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

    return NextResponse.json({ status: pi.status, chargeId: pi.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`retry-charge failed for ${customer.email}:`, err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
