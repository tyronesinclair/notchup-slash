import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || token !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payments = await prisma.payment.findMany({
    where: { paymentType: "scheduled", status: "scheduled" },
    include: { customer: true },
    orderBy: { scheduledDate: "asc" },
  });

  const results = payments.map((p) => ({
    name: p.customer.name,
    email: p.customer.email,
    scheduledDate: p.scheduledDate,
    hasPaymentMethod: !!p.stripePaymentMethodId,
    stripePaymentMethodId: p.stripePaymentMethodId,
    stripeCustomerId: p.customer.stripeCustomerId,
    willCharge: !!p.stripePaymentMethodId,
  }));

  const ready = results.filter((r) => r.willCharge).length;
  const missing = results.filter((r) => !r.willCharge).length;

  return NextResponse.json({ total: results.length, ready, missing, payments: results });
}
