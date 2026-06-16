import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { normalizeE164 } from "@/lib/phone";

// Lets an operator add/correct a customer's phone number (for missing numbers).
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || token !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { customerId, phone } = await req.json();
  if (!customerId) {
    return NextResponse.json({ error: "customerId required" }, { status: 400 });
  }

  const normalized = normalizeE164(phone);
  if (!normalized) {
    return NextResponse.json({ error: "Enter a valid 10-digit Canadian/US number." }, { status: 400 });
  }

  await prisma.customer.update({
    where: { id: customerId },
    data: { phone: normalized },
  });

  return NextResponse.json({ ok: true, phone: normalized });
}
