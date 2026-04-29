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

  // Sequential — not parallel — to avoid Stripe rate limits
  const results = [];
  for (const p of payments) {
    const hasIdInDb = !!p.stripePaymentMethodId;

    let stripeVerified = false;
    let stripeStatus: "confirmed" | "not_found" | "rate_limited" | "no_id" | "error" = "no_id";
    let stripeError: string | null = null;

    if (hasIdInDb) {
      try {
        const pm = await stripe.paymentMethods.retrieve(p.stripePaymentMethodId!);
        stripeVerified = !!pm && pm.customer !== null;
        stripeStatus = stripeVerified ? "confirmed" : "not_found";
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        const isRateLimit = msg.toLowerCase().includes("rate limit");
        stripeStatus = isRateLimit ? "rate_limited" : "error";
        stripeError = msg;
        // Rate limited ≠ card missing — don't treat as failure
        stripeVerified = false;
      }
    }

    results.push({
      name: p.customer.name,
      email: p.customer.email,
      scheduledDate: p.scheduledDate,
      stripeCustomerId: p.customer.stripeCustomerId,
      stripePaymentMethodId: p.stripePaymentMethodId,
      hasIdInDb,
      stripeVerified,
      stripeStatus,
      stripeError,
      willCharge: stripeVerified,
    });
  }

  const ready = results.filter((r) => r.stripeVerified).length;
  const missing = results.filter((r) => !r.stripeVerified && r.stripeStatus !== "rate_limited").length;
  const rateLimited = results.filter((r) => r.stripeStatus === "rate_limited").length;

  return NextResponse.json({ total: results.length, ready, missing, rateLimited, payments: results });
}
