import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { sendSms } from "@/lib/twilio";
import { normalizeE164 } from "@/lib/phone";

// Texts the customer asking for the telco verification code they just received.
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || token !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { customerId } = await req.json();
  if (!customerId) {
    return NextResponse.json({ error: "customerId required" }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { services: true },
  });
  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const to = normalizeE164(customer.phone);
  if (!to) {
    return NextResponse.json({ error: "No valid phone on file for this customer." }, { status: 400 });
  }

  const provider = customer.services[0]?.provider || "your provider";
  const body =
    `NotchUp here — we're activating your ${provider} account now. ` +
    `${provider} just texted you a verification code. Reply with that code to continue. ` +
    `Reply STOP to opt out.`;

  const result = await sendSms(to, body);

  await prisma.smsMessage.create({
    data: {
      customerId: customer.id,
      direction: "outbound",
      toNumber: to,
      fromNumber: process.env.TWILIO_FROM_NUMBER ?? null,
      body,
    },
  });

  if (!result.sent && !result.mock) {
    return NextResponse.json({ error: result.error ?? "Send failed" }, { status: 500 });
  }

  return NextResponse.json({ sent: result.sent, mock: result.mock, to });
}
