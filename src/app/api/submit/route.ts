import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import { sendConfirmationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, services, paymentType, scheduledDate, stripePaymentIntentId } =
      await req.json();

    if (!name || !email || !phone || !services?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Upsert customer
    const customer = await prisma.customer.upsert({
      where: { email },
      update: { name, phone },
      create: { name, email, phone },
    });

    // Encrypt and save each service
    for (const svc of services) {
      const credentials = JSON.stringify({
        username: svc.username,
        password: svc.password,
        accountNumber: svc.accountNumber ?? "",
      });

      await prisma.service.create({
        data: {
          customerId: customer.id,
          serviceType: svc.serviceType,
          provider: svc.provider,
          encryptedCredentials: encrypt(credentials),
        },
      });
    }

    // Record payment
    await prisma.payment.upsert({
      where: { customerId: customer.id },
      update: {
        paymentType,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        stripePaymentIntentId: stripePaymentIntentId ?? null,
        status: paymentType === "scheduled" ? "scheduled" : "paid",
        paidAt: paymentType === "immediate" ? new Date() : null,
      },
      create: {
        customerId: customer.id,
        paymentType,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        stripePaymentIntentId: stripePaymentIntentId ?? null,
        status: paymentType === "scheduled" ? "scheduled" : "paid",
        paidAt: paymentType === "immediate" ? new Date() : null,
      },
    });

    // Send confirmation email
    await sendConfirmationEmail({ name, email, services, paymentType, scheduledDate });

    return NextResponse.json({ success: true, customerId: customer.id });
  } catch (err) {
    console.error("Submit error:", err);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
