import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";

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

  const results = await Promise.all(
    payments.map(async (p) => {
      const hasIdInDb = !!p.stripePaymentMethodId;

      let stripeVerified = false;
      let stripeError: string | null = null;

      if (hasIdInDb) {
        try {
          const pm = await stripe.paymentMethods.retrieve(p.stripePaymentMethodId!);
          // Valid if it exists and is attached to a customer
          stripeVerified = !!pm && pm.customer !== null;
        } catch (e: unknown) {
          stripeError = e instanceof Error ? e.message : "Unknown error";
        }
      }

      return {
        name: p.customer.name,
        email: p.customer.email,
        scheduledDate: p.scheduledDate,
        stripeCustomerId: p.customer.stripeCustomerId,
        stripePaymentMethodId: p.stripePaymentMethodId,
        hasIdInDb,
        stripeVerified,
        stripeError,
        willCharge: stripeVerified,
      };
    })
  );

  const ready = results.filter((r) => r.willCharge).length;
  const missing = results.filter((r) => !r.willCharge).length;

  return NextResponse.json({ total: results.length, ready, missing, payments: results });
}
