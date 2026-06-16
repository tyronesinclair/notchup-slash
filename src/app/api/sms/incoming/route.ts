import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { extractOtp, isKeyword, validateInboundSignature, sendSms } from "@/lib/twilio";
import { normalizeE164 } from "@/lib/phone";

export const runtime = "nodejs";

// Empty TwiML — we acknowledge without auto-replying via TwiML (we send our own SMS instead).
const TWIML_OK = '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';

function twiml(body = TWIML_OK) {
  return new NextResponse(body, { status: 200, headers: { "Content-Type": "text/xml" } });
}

// Twilio inbound SMS webhook (public — Twilio posts here, no admin cookie).
// Matches the sender to a customer, extracts the verification code, logs it, and
// texts the customer back to close the loop (confirm receipt or nudge for the code).
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const params: Record<string, string> = {};
  for (const [k, v] of form.entries()) params[k] = typeof v === "string" ? v : "";

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

  // Match a customer by normalized phone.
  const customers = await prisma.customer.findMany({
    where: { phone: { not: "" } },
    select: { id: true, name: true, phone: true, services: { select: { provider: true } } },
  });
  const match = customers.find((c) => normalizeE164(c.phone) === fromE164);

  const keyword = isKeyword(body);
  const { code } = keyword ? { code: null } : extractOtp(body);

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

  // Close the loop with the customer (mock-safe; only for known customers, never keywords).
  if (match && !keyword) {
    const firstName = match.name.split(" ")[0] || "there";
    const provider = match.services[0]?.provider || "your provider";
    let reply: string | null = null;

    if (code) {
      reply = `Got it, thanks ${firstName}! That's everything we need on our end — we'll take it from here. 🎉`;
    } else if (/\d/.test(body)) {
      // They sent something with digits but we couldn't read a code — guide them.
      reply = `Thanks ${firstName}! We couldn't spot the code in that. Reply with just the digits ${provider} texted you (for example 123456).`;
    }

    if (reply) {
      await sendSms(fromE164, reply);
      await prisma.smsMessage.create({
        data: {
          customerId: match.id,
          direction: "outbound",
          toNumber: fromE164,
          fromNumber: process.env.TWILIO_FROM_NUMBER ?? null,
          body: reply,
        },
      });
    }
  }

  return twiml();
}
