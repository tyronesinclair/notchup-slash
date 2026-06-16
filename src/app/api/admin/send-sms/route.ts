import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { sendSms } from "@/lib/twilio";
import { normalizeE164 } from "@/lib/phone";

// Sends an ad-hoc SMS to a customer (operator free-form message, e.g. "that code
// expired, I'll send a fresh one"). Logged to the SMS thread.
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || token !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { customerId, body } = await req.json();
  if (!customerId || !body?.trim()) {
    return NextResponse.json({ error: "customerId and a message are required" }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const to = normalizeE164(customer.phone);
  if (!to) {
    return NextResponse.json({ error: "No valid phone on file for this customer." }, { status: 400 });
  }

  const text = String(body).slice(0, 1000);
  const result = await sendSms(to, text);

  await prisma.smsMessage.create({
    data: {
      customerId: customer.id,
      direction: "outbound",
      toNumber: to,
      fromNumber: process.env.TWILIO_FROM_NUMBER ?? null,
      body: text,
    },
  });

  if (!result.sent && !result.mock) {
    return NextResponse.json({ error: result.error ?? "Send failed" }, { status: 500 });
  }

  return NextResponse.json({ sent: result.sent, mock: result.mock });
}
