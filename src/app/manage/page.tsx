"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2, Mail } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

// Self-serve entry to the Stripe billing portal (cancel, update card, invoices).
// We email a tokenized link rather than show account data, so there is no login and
// no way to probe whether an address is subscribed.
export default function ManagePage() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const base = typeof window !== "undefined" ? window.location.pathname.replace(pathname, "") : "";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      const res = await fetch(`${base}/api/billing/request-link`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch {
      setErr("Something went wrong. Email help@notchup.app and we'll sort it.");
    } finally { setBusy(false); }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Nav hideSignUpCta />
      <main className="flex-1 flex items-start justify-center py-12 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: "#4F4EA5" }}>
            <Mail size={18} className="text-white" />
          </div>
          <h1 className="text-xl font-extrabold text-gray-900 mb-1" style={{ fontFamily: "var(--font-montserrat)" }}>
            Manage your Slash subscription
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Cancel, update your card, or see invoices. Enter the email you signed up with and we&apos;ll send your secure billing link.
          </p>

          {sent ? (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-800">
              <strong>Check your inbox.</strong> If that address has a Slash subscription, your billing link is on its way. Not there in a few minutes? Check spam, or email{" "}
              <a href="mailto:help@notchup.app" className="underline font-semibold">help@notchup.app</a>.
            </div>
          ) : (
            <form onSubmit={submit}>
              <label htmlFor="manage-email" className="block text-xs font-semibold text-gray-700 mb-1.5">Email address</label>
              <input
                id="manage-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com" autoComplete="email"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
              {err && <p className="mt-2 text-xs text-red-600">{err}</p>}
              <button type="submit" disabled={busy || !email}
                className="mt-4 w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40"
                style={{ background: "#4F4EA5", fontFamily: "var(--font-montserrat)" }}>
                {busy ? <><Loader2 size={15} className="animate-spin" /> Sending…</> : "Email me my billing link →"}
              </button>
            </form>
          )}

          <p className="mt-6 text-xs text-gray-400 leading-relaxed">
            Want a refund? In your first 30 days it&apos;s no questions asked — just email{" "}
            <a href="mailto:help@notchup.app?subject=Slash%20refund" className="underline">help@notchup.app</a>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
