import { NextRequest, NextResponse } from "next/server";
import { stripe, PLAN_AMOUNT, PLAN_CURRENCY } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { email, paymentType } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find or create Stripe customer
    const existing = await stripe.customers.list({ email, limit: 1 });
    const customer =
      existing.data.length > 0
        ? existing.data[0]
        : await stripe.customers.create({ email });

    if (paymentType === "scheduled") {
      // SetupIntent to save the card for later charging
      const setupIntent = await stripe.setupIntents.create({
        customer: customer.id,
        usage: "off_session",
        payment_method_types: ["card"],
        metadata: { email, paymentType: "scheduled" },
      });

      return NextResponse.json({ clientSecret: setupIntent.client_secret });
    } else {
      // Immediate PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: PLAN_AMOUNT,
        currency: PLAN_CURRENCY,
        customer: customer.id,
        receipt_email: email,
        metadata: { email, paymentType: "immediate" },
        automatic_payment_methods: { enabled: true },
      });

      return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    }
  } catch (err) {
    console.error("Stripe intent error:", err);
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 });
  }
}
