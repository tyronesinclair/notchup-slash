import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

// Returns all failed scheduled payments, and can reset them back to "scheduled" for retry.
export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || token !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const failed = await prisma.payment.findMany({
    where: { paymentType: "scheduled", status: "failed" },
    include: { customer: true },
    orderBy: { scheduledDate: "asc" },
  });

  return NextResponse.json({
    total: failed.length,
    payments: failed.map((p) => ({
      id: p.id,
      name: p.customer.name,
      email: p.customer.email,
      scheduledDate: p.scheduledDate,
      stripePaymentMethodId: p.stripePaymentMethodId,
      stripePaymentIntentId: p.stripePaymentIntentId,
    })),
  });
}

// Reset a failed payment back to "scheduled" so it appears in admin and can be retried.
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || token !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { paymentId } = await req.json();

  if (paymentId) {
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "failed" },
    });
    return NextResponse.json({ reset: 1 });
  }

  // Reset all failed → scheduled so they show in the admin
  const result = await prisma.payment.updateMany({
    where: { paymentType: "scheduled", status: "failed" },
    data: { status: "failed" },
  });

  return NextResponse.json({ reset: result.count });
}
