import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";

async function getStats() {
  const [
    totalCustomers,
    paidPayments,
    scheduledPayments,
    pendingCredentials,
    recentCustomers,
    eventCounts,
    revenueResult,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.payment.count({ where: { status: "paid" } }),
    prisma.payment.count({ where: { status: "scheduled" } }),
    prisma.customer.count({ where: { status: { not: "credentials_received" } } }),
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
  ]);

  const eventMap = Object.fromEntries(
    eventCounts.map((e) => [e.event, e._count.event])
  );

  return {
    totalCustomers,
    paidPayments,
    scheduledPayments,
    pendingCredentials,
    recentCustomers,
    eventMap,
    totalRevenueCents: revenueResult._sum.amount ?? 0,
  };
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-3xl font-extrabold text-gray-900" style={{ fontFamily: "var(--font-montserrat)" }}>{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token || token !== process.env.ADMIN_SECRET) {
    redirect("/admin/login");
  }

  const stats = await getStats();
  const { totalCustomers, paidPayments, scheduledPayments, recentCustomers, eventMap, totalRevenueCents } = stats;

  const pageViews = eventMap["page_view"] ?? 0;
  const formStarts = eventMap["form_start"] ?? 0;
  const contactSubmits = eventMap["contact_submit"] ?? 0;
  const paymentSuccess = eventMap["payment_success"] ?? 0;
  const credentialsSubmits = eventMap["credentials_submit"] ?? 0;

  const conversionRate = pageViews > 0 ? ((paidPayments / pageViews) * 100).toFixed(1) : "—";
  const revenueCAD = (totalRevenueCents / 100).toFixed(2);

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
        <Link
          href="/"
          className="text-xs text-gray-400 hover:text-gray-600 underline"
        >
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

        {/* Revenue + key metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Revenue" value={`$${revenueCAD}`} sub={`${paidPayments} paid · ${scheduledPayments} scheduled`} />
          <StatCard label="Total signups" value={totalCustomers} sub="all-time" />
          <StatCard label="Conversion" value={`${conversionRate}%`} sub="visits → paid" />
          <StatCard label="Credentials in" value={credentialsSubmits} sub={`of ${paidPayments} paid`} />
        </div>

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
              { label: "Payments completed", value: paidPayments + scheduledPayments },
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
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: "#4F4EA5" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent customers */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-700" style={{ fontFamily: "var(--font-montserrat)" }}>
              Recent signups
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                  <th className="text-left px-6 py-3">Name</th>
                  <th className="text-left px-6 py-3">Email</th>
                  <th className="text-left px-6 py-3">Services</th>
                  <th className="text-left px-6 py-3">Payment</th>
                  <th className="text-left px-6 py-3">Credentials</th>
                  <th className="text-left px-6 py-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentCustomers.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-6 py-3 text-gray-500">{c.email}</td>
                    <td className="px-6 py-3 text-gray-500">
                      {c.services.map((s) => `${s.provider} (${s.serviceType === "internet" ? "net" : "cell"})`).join(", ")}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{
                          background: c.payment?.status === "paid" ? "#ECFDF3" : c.payment?.status === "scheduled" ? "#FEF3C7" : "#F3F4F6",
                          color: c.payment?.status === "paid" ? "#065F46" : c.payment?.status === "scheduled" ? "#92400E" : "#6B7280",
                        }}
                      >
                        {c.payment?.status ?? "none"}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{
                          background: c.status === "credentials_received" ? "#ECFDF3" : "#FEF3C7",
                          color: c.status === "credentials_received" ? "#065F46" : "#92400E",
                        }}
                      >
                        {c.status === "credentials_received" ? "received" : "pending"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-400 text-xs">
                      {new Date(c.createdAt).toLocaleDateString("en-CA")}
                    </td>
                  </tr>
                ))}
                {recentCustomers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400 text-sm">
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
