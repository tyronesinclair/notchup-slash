import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { getProviderLogin } from "@/lib/providers";
import { formatDisplay } from "@/lib/phone";
import { ArrowLeft } from "lucide-react";
import BatchActivationCard from "./BatchActivationCard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

function decryptCred(encrypted: string) {
  if (!encrypted) return null;
  try {
    return JSON.parse(decrypt(encrypted)) as { username: string; password: string; accountNumber: string };
  } catch {
    return null;
  }
}

export default async function BatchPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string | string[] }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || token !== process.env.ADMIN_SECRET) {
    redirect("/admin/login");
  }

  const sp = await searchParams;
  const ids = Array.isArray(sp.id) ? sp.id : sp.id ? [sp.id] : [];

  const customers = ids.length
    ? await prisma.customer.findMany({
        where: { id: { in: ids } },
        include: { services: true, payment: true },
      })
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://cdn.prod.website-files.com/663d33e48a497e68ec23fc06/66427492c358294cac47f56b_NU%201B.png" alt="NotchUp" style={{ height: 20, width: "auto" }} />
          <span className="text-sm font-semibold text-gray-400">/ Batch activation</span>
        </div>
        <Link href="/admin" className="text-xs text-gray-400 hover:text-gray-600 underline flex items-center gap-1">
          <ArrowLeft size={12} /> Dashboard
        </Link>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-5">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1" style={{ fontFamily: "var(--font-montserrat)" }}>
            Batch activation
          </h1>
          <p className="text-sm text-gray-400">
            {customers.length > 0
              ? `Working ${customers.length} account${customers.length > 1 ? "s" : ""} in parallel. Start each browser, request codes, and pick up replies as they land.`
              : "No accounts selected. Go back and tick customers in the activation queue, then click Start batch."}
          </p>
          {customers.length > 0 && (
            <p className="text-xs text-amber-600 mt-1">
              Tip: Browserbase runs up to 3 live browsers at once on the current plan — start them in waves if you selected more.
            </p>
          )}
        </div>

        {customers.length === 0 ? (
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:underline">
            ← Back to the activation queue
          </Link>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {customers.map((c) => {
              const provider = c.services[0]?.provider ?? "your provider";
              const login = getProviderLogin(provider);
              const cred = decryptCred(c.services[0]?.encryptedCredentials ?? "");
              return (
                <BatchActivationCard
                  key={c.id}
                  customerId={c.id}
                  name={c.name}
                  email={c.email}
                  provider={provider}
                  loginUrl={login?.loginUrl ?? null}
                  phoneDisplay={formatDisplay(c.phone)}
                  cred={cred}
                  activationStatus={c.activationStatus}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
