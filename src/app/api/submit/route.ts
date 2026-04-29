import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { sendConfirmationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone = "", services, paymentType, scheduledDate, stripePaymentIntentId } =
      await req.json();

    if (!name || !email || !services?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // For scheduled payments: retrieve the SetupIntent now to grab the saved payment method.
    // The Stripe webhook fires before this page loads, so the webhook can't find the customer yet.
    // Pulling it here guarantees stripePaymentMethodId is always saved.
    let stripePaymentMethodId: string | null = null;
    let stripeCustomerId: string | null = null;
    if (paymentType === "scheduled" && stripePaymentIntentId) {
      try {
        const si = await stripe.setupIntents.retrieve(stripePaymentIntentId);
        stripePaymentMethodId = (si.payment_method as string) ?? null;
        stripeCustomerId = (si.customer as string) ?? null;
      } catch (e) {
        console.error("Could not retrieve setup intent:", e);
      }
    }

    const customer = await prisma.customer.upsert({
      where: { email },
      update: { name, phone, ...(stripeCustomerId && { stripeCustomerId }) },
      create: { name, email, phone, stripeCustomerId: stripeCustomerId ?? undefined },
    });

    // Create service records — credentials are collected post-payment via /api/credentials
    for (const svc of services) {
      const existing = await prisma.service.findFirst({
        where: { customerId: customer.id, provider: svc.provider, serviceType: svc.serviceType },
      });
      if (!existing) {
        await prisma.service.create({
          data: {
            customerId: customer.id,
            serviceType: svc.serviceType,
            provider: svc.provider,
            encryptedCredentials: "",
          },
        });
      }
    }

    await prisma.payment.upsert({
      where: { customerId: customer.id },
      update: {
        paymentType,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        stripePaymentIntentId: stripePaymentIntentId ?? null,
        stripePaymentMethodId: stripePaymentMethodId,
        status: paymentType === "scheduled" ? "scheduled" : "paid",
        paidAt: paymentType === "immediate" ? new Date() : null,
      },
      create: {
        customerId: customer.id,
        paymentType,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        stripePaymentIntentId: stripePaymentIntentId ?? null,
        stripePaymentMethodId: stripePaymentMethodId,
        status: paymentType === "scheduled" ? "scheduled" : "paid",
        paidAt: paymentType === "immediate" ? new Date() : null,
      },
    });

    await sendConfirmationEmail({ name, email, services, paymentType, scheduledDate });

    return NextResponse.json({ success: true, customerId: customer.id });
  } catch (err) {
    console.error("Submit error:", err);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
