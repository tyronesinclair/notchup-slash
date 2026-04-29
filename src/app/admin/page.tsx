import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import RunChargesButton from "./RunChargesButton";
import RetryChargeButton from "./RetryChargeButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

// Returns today's date string (YYYY-MM-DD) in Pacific time
function todayPST() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Vancouver" });
}

// Returns the date string (YYYY-MM-DD) for a given UTC Date in Pacific time
function datePST(d: Date) {
  return d.toLocaleDateString("en-CA", { timeZone: "America/Vancouver" });
}

async function getStats() {
  const [
    totalCustomers,
    paidPayments,
    scheduledPayments,
    recentCustomers,
    eventCounts,
    revenueResult,
    credentialsCount,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.payment.count({ where: { status: "paid" } }),
    prisma.payment.findMany({
      where: { status: { in: ["scheduled", "failed"] } },
      include: { customer: true },
      orderBy: { scheduledDate: "asc" },
    }),
    prisma.customer.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: { payment: true, services: true },
    }),
    prisma.analyticsEvent.groupBy({
      by: ["event"],
      _count: { event: true },
    }),
    prisma.payment.aggregate({
      where: { status: "paid" },
      _sum: { amount: true },
    }),
    prisma.customer.count({ where: { status: "credentials_received" } }),
  ]);

  const eventMap = Object.fromEntries(
    eventCounts.map((e) => [e.event, e._count.event])
  );

  return {
    totalCustomers,
    paidPayments,
    scheduledPayments,
    recentCustomers,
    eventMap,
    totalRevenueCents: revenueResult._sum.amount ?? 0,
    credentialsCount,
  };
}

function Badge({
  label,
  color,
}: {
  label: string;
  color: "green" | "amber" | "red" | "gray" | "blue";
}) {
  const styles = {
    green: { background: "#ECFDF3", color: "#065F46" },
    amber: { background: "#FEF3C7", color: "#92400E" },
    red:   { background: "#FEF2F2", color: "#991B1B" },
    gray:  { background: "#F3F4F6", color: "#6B7280" },
    blue:  { background: "#EFF6FF", color: "#1D4ED8" },
  };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
      style={styles[color]}
    >
      {label}
    </span>
  );
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token || token !== process.env.ADMIN_SECRET) {
    redirect("/admin/login");
  }

  const stats = await getStats();
  const {
    totalCustomers,
    paidPayments,
    scheduledPayments,
    recentCustomers,
    eventMap,
    totalRevenueCents,
    credentialsCount,
  } = stats;

  const pageViews = eventMap["page_view"] ?? 0;
  const formStarts = eventMap["form_start"] ?? 0;
  const contactSubmits = eventMap["contact_submit"] ?? 0;
  const credentialsSubmits = eventMap["credentials_submit"] ?? 0;

  const scheduledTotal = scheduledPayments.filter((p) => p.status === "scheduled").length;
  const failedTotal = scheduledPayments.filter((p) => p.status === "failed").length;
  const cardInDbCount = scheduledPayments.filter((p) => p.status === "scheduled" && !!p.stripePaymentMethodId).length;
  const missingCardCount = scheduledTotal - cardInDbCount;
  const collectedRevenue = (totalRevenueCents / 100).toFixed(2);
  const scheduledRevenue = (scheduledTotal * 35).toFixed(2);
  const conversionRate = pageViews > 0 ? (((paidPayments + scheduledTotal) / pageViews) * 100).toFixed(1) : "—";
  const today = todayPST();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://cdn.prod.website-files.com/663d33e48a497e68ec23fc06/66427492c358294cac47f56b_NU%201B.png"
            alt="NotchUp"
            style={{ height: 20, width: "auto" }}
          />
          <span className="text-sm font-semibold text-gray-400">/ Admin</span>
        </div>
        <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 underline">
          View site →
        </Link>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1" style={{ fontFamily: "var(--font-montserrat)" }}>
            Dashboard
          </h1>
          <p className="text-sm text-gray-400">NotchUp Slash · live stats</p>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 col-span-2 md:col-span-1" style={{ borderColor: "#4F4EA5", borderWidth: 2 }}>
            <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#4F4EA5" }}>Total Revenue</div>
            <div className="text-3xl font-extrabold text-gray-900" style={{ fontFamily: "var(--font-montserrat)" }}>
              ${(parseFloat(collectedRevenue) + parseFloat(scheduledRevenue)).toFixed(2)} CAD
            </div>
            <div className="text-xs text-gray-400 mt-1">${collectedRevenue} collected · ${scheduledRevenue} scheduled</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Collected</div>
            <div className="text-3xl font-extrabold text-gray-900" style={{ fontFamily: "var(--font-montserrat)" }}>${collectedRevenue}</div>
            <div className="text-xs text-gray-400 mt-1">{paidPayments} paid · cash in hand</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Scheduled</div>
            <div className="text-3xl font-extrabold text-gray-900" style={{ fontFamily: "var(--font-montserrat)" }}>${scheduledRevenue}</div>
            <div className="text-xs mt-1">
              {scheduledTotal} customers ·{" "}
              <span className="text-green-600 font-semibold">{cardInDbCount} card saved</span>
              {missingCardCount > 0 && (
                <span className="text-red-500 font-semibold"> · {missingCardCount} no card</span>
              )}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Total signups</div>
            <div className="text-3xl font-extrabold text-gray-900" style={{ fontFamily: "var(--font-montserrat)" }}>{totalCustomers}</div>
            <div className="text-xs text-gray-400 mt-1">{conversionRate}% conversion</div>
          </div>
        </div>

        {/* Scheduled payments — Stripe-verified card status */}
        {scheduledTotal > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-700" style={{ fontFamily: "var(--font-montserrat)" }}>
                  Scheduled charges
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Card status based on DB record. Use &ldquo;Verify with Stripe&rdquo; for live confirmation. Charged at 8am PST on chosen date.
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {missingCardCount > 0 && (
                  <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
                    ⚠ {missingCardCount} no card saved
                  </span>
                )}
                <RunChargesButton />
                <Link href="/api/admin/scheduled-check" target="_blank" className="text-xs text-violet-600 hover:underline font-semibold">
                  Verify with Stripe →
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    <th className="text-left px-6 py-3">Customer</th>
                    <th className="text-left px-6 py-3">Charge date (PST)</th>
                    <th className="text-left px-6 py-3">Card saved</th>
                    <th className="text-left px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduledPayments.filter((p) => p.status === "scheduled").map((p) => {
                    const hasCard = !!p.stripePaymentMethodId;
                    const chargeDatePST = p.scheduledDate ? datePST(new Date(p.scheduledDate)) : null;
                    const chargeLabel = chargeDatePST
                      ? new Date(chargeDatePST + "T12:00:00").toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })
                      : "—";
                    const isOverdue = chargeDatePST ? chargeDatePST < today : false;
                    return (
                      <tr key={p.id} className="border-b border-gray-50">
                        <td className="px-6 py-3">
                          <Link href={`/admin/customers/${p.customerId}`} className="font-medium text-gray-900 hover:text-violet-600 transition-colors">
                            {p.customer.name}
                          </Link>
                          <div className="text-xs text-gray-400">{p.customer.email}</div>
                        </td>
                        <td className="px-6 py-3">
                          <span className={`font-medium ${isOverdue ? "text-red-600" : "text-gray-900"}`}>
                            {chargeLabel}
                          </span>
                          {isOverdue && <div className="text-xs text-red-500">Overdue — check cron</div>}
                        </td>
                        <td className="px-6 py-3">
                          {hasCard ? (
                            <span className="text-green-600 font-semibold text-xs">✓ Saved in DB</span>
                          ) : (
                            <span className="text-red-500 font-semibold text-xs">✗ Missing</span>
                          )}
                        </td>
                        <td className="px-6 py-3">
                          <Badge label={hasCard ? "Will charge" : "No card — won't charge"} color={hasCard ? "green" : "red"} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Failed charges */}
            {failedTotal > 0 && (
              <div className="border-t border-red-100 px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-red-700 uppercase tracking-widest">
                    ⚠ {failedTotal} declined / failed
                  </p>
                  <p className="text-xs text-gray-400">Retry individually when ready</p>
                </div>
                <div className="space-y-2">
                  {scheduledPayments.filter((p) => p.status === "failed").map((p) => {
                    const chargeDatePST = p.scheduledDate ? datePST(new Date(p.scheduledDate)) : null;
                    const chargeLabel = chargeDatePST
                      ? new Date(chargeDatePST + "T12:00:00").toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })
                      : "—";
                    return (
                      <div key={p.id} className="flex items-center justify-between bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{p.customer.name}</div>
                          <div className="text-xs text-gray-400">{p.customer.email} · scheduled {chargeLabel}</div>
                        </div>
                        <RetryChargeButton paymentId={p.id} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Funnel */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-bold text-gray-700 mb-4" style={{ fontFamily: "var(--font-montserrat)" }}>
            Funnel
          </h2>
          <div className="space-y-3">
            {[
              { label: "Page views", value: pageViews },
              { label: "Form starts", value: formStarts },
              { label: "Contact submitted", value: contactSubmits },
              { label: "Payments completed", value: paidPayments + scheduledTotal },
              { label: "Credentials submitted", value: credentialsSubmits },
            ].map((row, i, arr) => {
              const prev = i === 0 ? null : arr[i - 1].value;
              const dropPct = prev && prev > 0 ? (((prev - row.value) / prev) * 100).toFixed(0) : null;
              const maxVal = arr[0].value || 1;
              const pct = Math.round((row.value / maxVal) * 100);
              return (
                <div key={row.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">{row.label}</span>
                    <div className="flex items-center gap-3">
                      {dropPct && Number(dropPct) > 0 && (
                        <span className="text-xs text-red-400">−{dropPct}%</span>
                      )}
                      <span className="font-bold text-gray-900">{row.value.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "#4F4EA5" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* All customers */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-700" style={{ fontFamily: "var(--font-montserrat)" }}>
              All customers
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                  <th className="text-left px-6 py-3">Name</th>
                  <th className="text-left px-6 py-3">Services</th>
                  <th className="text-left px-6 py-3">Payment</th>
                  <th className="text-left px-6 py-3">Charge date</th>
                  <th className="text-left px-6 py-3">Card</th>
                  <th className="text-left px-6 py-3">Creds</th>
                  <th className="text-left px-6 py-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentCustomers.map((c) => {
                  const isScheduled = c.payment?.status === "scheduled";
                  const hasCard = isScheduled ? !!c.payment?.stripePaymentMethodId : false;
                  const chargeDatePST = c.payment?.scheduledDate ? datePST(new Date(c.payment.scheduledDate)) : null;
                  const chargeDate = chargeDatePST
                    ? new Date(chargeDatePST + "T12:00:00").toLocaleDateString("en-CA", { month: "short", day: "numeric" })
                    : null;
                  return (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer">
                      <td className="px-6 py-3">
                        <Link href={`/admin/customers/${c.id}`} className="font-medium text-gray-900 hover:text-violet-600 transition-colors block">
                          {c.name}
                        </Link>
                        <span className="text-xs text-gray-400">{c.email}</span>
                      </td>
                      <td className="px-6 py-3 text-gray-500 text-xs">
                        {c.services.map((s) => `${s.provider} (${s.serviceType === "internet" ? "net" : "cell"})`).join(", ")}
                      </td>
                      <td className="px-6 py-3">
                        <Badge
                          label={c.payment?.status ?? "none"}
                          color={c.payment?.status === "paid" ? "green" : c.payment?.status === "scheduled" ? "amber" : "gray"}
                        />
                      </td>
                      <td className="px-6 py-3 text-xs text-gray-500">
                        {isScheduled && chargeDate ? chargeDate : "—"}
                      </td>
                      <td className="px-6 py-3 text-xs">
                        {isScheduled ? (
                          hasCard
                            ? <span className="text-green-600 font-semibold">✓ Saved</span>
                            : <span className="text-red-500 font-semibold">✗ Missing</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <Badge
                          label={c.status === "credentials_received" ? "received" : "pending"}
                          color={c.status === "credentials_received" ? "green" : "amber"}
                        />
                      </td>
                      <td className="px-6 py-3 text-gray-400 text-xs">
                        {new Date(c.createdAt).toLocaleDateString("en-CA")}
                      </td>
                    </tr>
                  );
                })}
                {recentCustomers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400 text-sm">
                      No signups yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
