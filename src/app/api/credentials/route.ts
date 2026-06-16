import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import { normalizeE164 } from "@/lib/phone";

export async function POST(req: NextRequest) {
  try {
    const { customerId, services, phone } = await req.json();

    if (!customerId || !services?.length) {
      return NextResponse.json({ error: "Missing customerId or services" }, { status: 400 });
    }

    // Phone is collected here (post-payment) so we can text the customer the telco
    // verification code during activation. Normalize to E.164 for reliable matching.
    const normalizedPhone = normalizeE164(phone);

    for (const svc of services) {
      const { provider, serviceType, username, password, accountNumber } = svc;
      if (!username || !password) continue;

      const encrypted = encrypt(JSON.stringify({ username, password, accountNumber: accountNumber ?? "" }));

      const record = await prisma.service.findFirst({
        where: { customerId, provider, serviceType },
      });
      if (!record) continue;

      await prisma.service.update({
        where: { id: record.id },
        data: { encryptedCredentials: encrypted, status: "credentials_received" },
      });
    }

    await prisma.customer.update({
      where: { id: customerId },
      data: {
        status: "credentials_received",
        ...(normalizedPhone && { phone: normalizedPhone }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Credentials error:", err);
    return NextResponse.json({ error: "Failed to save credentials" }, { status: 500 });
  }
}
