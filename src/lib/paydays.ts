import { prisma } from "./db";
import { stripe } from "./stripe";

// Stripe ends trials and charges on its own at trial_end. This is the safety net and the
// manual override: for every subscription whose payday has arrived and that is still
// trialing, end the trial now (Stripe invoices + charges immediately); for past_due ones,
// retry the open invoice. Never touches legacy $35 rows.
export async function chargeDuePaydays(opts: { force?: boolean } = {}) {
  const now = new Date();
  const due = await prisma.payment.findMany({
    where: {
      paymentType: "subscription",
      subscriptionStatus: { in: ["trialing", "past_due"] },
      stripeSubscriptionId: { not: null },
      ...(opts.force ? {} : { scheduledDate: { lte: now } }),
    },
    include: { customer: true },
    orderBy: { scheduledDate: "asc" },
  });
  const results: { email: string; action: string; status: string; error?: string }[] = [];
  for (const p of due) {
    const subId = p.stripeSubscriptionId!;
    try {
      const sub = await stripe.subscriptions.retrieve(subId, { expand: ["latest_invoice"] });
      if (sub.status === "trialing") {
        // Ends the trial → Stripe creates + auto-pays the first invoice off the saved card.
        const updated = await stripe.subscriptions.update(subId, { trial_end: "now", proration_behavior: "none" });
        results.push({ email: p.customer.email, action: "end_trial", status: updated.status });
        if (updated.status === "active") {
          await prisma.payment.update({ where: { id: p.id }, data: { status: "paid", subscriptionStatus: "active", paidAt: new Date() } });
        } else if (updated.status === "past_due" || updated.status === "incomplete") {
          await prisma.payment.update({ where: { id: p.id }, data: { status: "past_due", subscriptionStatus: updated.status } });
        }
      } else if (sub.status === "past_due" || sub.status === "unpaid") {
        const inv = sub.latest_invoice as { id: string; status?: string | null } | null;
        if (inv && inv.status === "open") {
          const paid = await stripe.invoices.pay(inv.id);
          results.push({ email: p.customer.email, action: "retry_invoice", status: paid.status ?? "unknown" });
          if (paid.status === "paid") await prisma.payment.update({ where: { id: p.id }, data: { status: "paid", subscriptionStatus: "active", paidAt: new Date() } });
        } else {
          results.push({ email: p.customer.email, action: "skip", status: `invoice ${inv?.status ?? "none"}` });
        }
      } else {
        // Stripe already moved it (active/cancelled) — sync the row.
        const map: Record<string, { status: string; subscriptionStatus: string }> = { active: { status: "paid", subscriptionStatus: "active" }, canceled: { status: "cancelled", subscriptionStatus: "cancelled" } };
        if (map[sub.status]) await prisma.payment.update({ where: { id: p.id }, data: map[sub.status] });
        results.push({ email: p.customer.email, action: "sync", status: sub.status });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("charge-paydays failed for", p.customer.email, msg);
      results.push({ email: p.customer.email, action: "error", status: "error", error: msg });
    }
  }
  return { found: due.length, results, ranAt: now.toISOString() };
}
