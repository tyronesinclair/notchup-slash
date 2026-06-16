import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseOtp, isKeyword, validateInboundSignature } from "@/lib/twilio";
import { normalizeE164 } from "@/lib/phone";

export const runtime = "nodejs";

// Empty TwiML — we acknowledge without auto-replying.
const TWIML_OK = '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';

function twiml(body = TWIML_OK) {
  return new NextResponse(body, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

// Twilio inbound SMS webhook (public — Twilio posts here, no admin cookie).
// Matches the sender to a customer, parses the verification code, and logs it.
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const params: Record<string, string> = {};
  for (const [k, v] of form.entries()) params[k] = typeof v === "string" ? v : "";

  // Validate the request really came from Twilio.
  const publicBase = process.env.PUBLIC_BASE_URL ?? "";
  const url = `${publicBase}/api/sms/incoming`;
  const signature = req.headers.get("x-twilio-signature");
  if (!validateInboundSignature(signature, url, params)) {
    console.warn("[sms/incoming] invalid Twilio signature, rejecting");
    return new NextResponse("Forbidden", { status: 403 });
  }

  const from = params.From ?? "";
  const to = params.To ?? "";
  const body = (params.Body ?? "").trim();

  const fromE164 = normalizeE164(from) ?? from;

  // Match an existing customer by normalized phone.
  const customers = await prisma.customer.findMany({
    where: { phone: { not: "" } },
    select: { id: true, phone: true },
  });
  const match = customers.find((c) => normalizeE164(c.phone) === fromE164);

  const code = isKeyword(body) ? null : parseOtp(body);

  await prisma.smsMessage.create({
    data: {
      customerId: match?.id ?? null,
      direction: "inbound",
      fromNumber: fromE164,
      toNumber: to,
      body,
      code,
    },
  });

  // Carrier opt-out keywords are handled by Twilio Advanced Opt-Out; we just log them.
  return twiml();
}
