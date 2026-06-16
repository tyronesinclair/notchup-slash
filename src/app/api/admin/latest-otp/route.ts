import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

// Returns the most recent inbound SMS (and parsed code) for a customer.
// Polled by the operator console while waiting for the customer's reply.
export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || token !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customerId = req.nextUrl.searchParams.get("customerId");
  if (!customerId) {
    return NextResponse.json({ error: "customerId required" }, { status: 400 });
  }

  const latest = await prisma.smsMessage.findFirst({
    where: { customerId, direction: "inbound" },
    orderBy: { createdAt: "desc" },
  });

  if (!latest) return NextResponse.json({ message: null });

  return NextResponse.json({
    message: {
      body: latest.body,
      code: latest.code,
      receivedAt: latest.createdAt,
    },
  });
}
