import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { ArrowLeft, Wifi, Smartphone } from "lucide-react";

export const metadata: Metadata = { robots: { index: false, follow: false } };

type DecryptedCred = {
  username: string;
  password: string;
  accountNumber: string;
} | null;

function decryptCred(encrypted: string): DecryptedCred {
  if (!encrypted) return null;
  try {
    return JSON.parse(decrypt(encrypted));
  } catch {
    return null;
  }
}

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || token !== process.env.ADMIN_SECRET) {
    redirect("/admin/login");
  }

  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { services: true, payment: true },
  });

  if (!customer) notFound();

  const payment = customer.payment;

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
        <Link href="/admin" className="text-xs text-gray-400 hover:text-gray-600 underline flex items-center gap-1">
          <ArrowLeft size={12} /> Back to dashboard
        </Link>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Customer header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h1 className="text-xl font-extrabold text-gray-900 mb-1" style={{ fontFamily: "var(--font-montserrat)" }}>
            {customer.name}
          </h1>
          <div className="text-sm text-gray-500 space-y-1">
            <div>{customer.email}</div>
            <div>{customer.phone}</div>
            <div className="text-xs text-gray-400">
              Joined {new Date(customer.createdAt).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-widest" style={{ fontFamily: "var(--font-montserrat)" }}>
            Payment
          </h2>
          {payment ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{
                    background: payment.status === "paid" ? "#ECFDF3" : payment.status === "scheduled" ? "#FEF3C7" : "#F3F4F6",
                    color: payment.status === "paid" ? "#065F46" : payment.status === "scheduled" ? "#92400E" : "#6B7280",
                  }}
                >
                  {payment.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Type</span>
                <span className="font-medium text-gray-900">{payment.paymentType}</span>
              </div>
              {payment.scheduledDate && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Scheduled for</span>
                  <span className="font-medium text-gray-900">
                    {new Date(payment.scheduledDate).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                </div>
              )}
              {payment.paidAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Paid at</span>
                  <span className="font-medium text-gray-900">
                    {new Date(payment.paidAt).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                </div>
              )}
              {payment.stripePaymentIntentId && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Stripe ID</span>
                  <span className="font-mono text-xs text-gray-400">{payment.stripePaymentIntentId}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No payment record.</p>
          )}
        </div>

        {/* Services + credentials */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest" style={{ fontFamily: "var(--font-montserrat)" }}>
            Services
          </h2>
          {customer.services.length === 0 && (
            <p className="text-sm text-gray-400">No services added.</p>
          )}
          {customer.services.map((svc) => {
            const cred = decryptCred(svc.encryptedCredentials);
            return (
              <div key={svc.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: "#4F4EA5" }}>
                    {svc.serviceType === "internet" ? <Wifi size={16} /> : <Smartphone size={16} />}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{svc.provider}</div>
                    <div className="text-xs text-gray-400">{svc.serviceType === "internet" ? "Internet" : "Cell Phone"}</div>
                  </div>
                  <span
                    className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{
                      background: svc.status === "credentials_received" ? "#ECFDF3" : "#FEF3C7",
                      color: svc.status === "credentials_received" ? "#065F46" : "#92400E",
                    }}
                  >
                    {svc.status === "credentials_received" ? "creds received" : "pending creds"}
                  </span>
                </div>

                {cred ? (
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-3 gap-1 text-xs text-gray-400 font-semibold uppercase tracking-wider border-b border-gray-100 pb-2">
                      <span>Field</span>
                      <span className="col-span-2">Value</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-sm">
                      <span className="text-gray-500">Username</span>
                      <span className="col-span-2 font-mono text-gray-900 break-all">{cred.username || "—"}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-sm">
                      <span className="text-gray-500">Password</span>
                      <span className="col-span-2 font-mono text-gray-900 break-all">{cred.password || "—"}</span>
                    </div>
                    {cred.accountNumber && (
                      <div className="grid grid-cols-3 gap-1 text-sm">
                        <span className="text-gray-500">Account #</span>
                        <span className="col-span-2 font-mono text-gray-900 break-all">{cred.accountNumber}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No credentials submitted yet.</p>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
