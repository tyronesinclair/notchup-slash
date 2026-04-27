import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

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

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object;
    await prisma.payment.updateMany({
      where: { stripePaymentIntentId: pi.id },
      data: { status: "paid", paidAt: new Date() },
    });
  }

  if (event.type === "setup_intent.succeeded") {
    const si = event.data.object;
    const email = si.metadata?.email;
    if (email) {
      const customer = await prisma.customer.findUnique({ where: { email } });
      if (customer) {
        await prisma.payment.updateMany({
          where: { customerId: customer.id },
          data: { stripePaymentMethodId: si.payment_method as string },
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
