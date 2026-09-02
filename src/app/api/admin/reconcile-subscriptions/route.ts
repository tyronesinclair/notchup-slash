import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { stripe, SUB_AMOUNT } from "@/lib/stripe";

// Reconcile DB against Stripe for subscriptions not yet marked active — recovers
// any invoice.paid webhook that was missed or raced the signup.
export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || token !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pending = await prisma.payment.findMany({
    where: { stripeSubscriptionId: { not: null }, NOT: { subscriptionStatus: "active" } },
    include: { customer: { select: { email: true } } },
  });

  const results = [];
  for (const p of pending) {
    try {
      const sub = await stripe.subscriptions.retrieve(p.stripeSubscriptionId!);
      if (sub.status === "active") {
        await prisma.payment.update({
          where: { id: p.id },
          data: { status: "paid", subscriptionStatus: "active", amount: SUB_AMOUNT, paidAt: p.paidAt ?? new Date() },
        });
        results.push({ email: p.customer.email, action: "activated" });
      } else {
        results.push({ email: p.customer.email, stripeStatus: sub.status, action: "none" });
      }
    } catch (err) {
      results.push({ email: p.customer.email, error: err instanceof Error ? err.message : String(err) });
    }
  }

  return NextResponse.json({ checked: pending.length, results });
}
