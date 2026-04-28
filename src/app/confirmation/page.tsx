"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Clock, ArrowRight, XCircle, ShieldCheck, Eye, EyeOff, Loader2, Wifi, Smartphone, Sparkles } from "lucide-react";

type ServiceEntry = { id: string; serviceType: string; provider: string };
type CredEntry = { serviceId: string; provider: string; serviceType: string; username: string; password: string; accountNumber: string; showPass: boolean };

function ConfirmationContent() {
  const params = useSearchParams();
  const pathname = usePathname();
  const scheduled = params.get("scheduled") === "true";
  const scheduledDate = params.get("date");
  const redirectStatus = params.get("redirect_status");
  const failed = redirectStatus === "failed" || redirectStatus === "canceled";

  const [phase, setPhase] = useState<"success" | "credentials" | "done">("success");
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceEntry[]>([]);
  const [creds, setCreds] = useState<CredEntry[]>([]);
  const [savingCreds, setSavingCreds] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const base = typeof window !== "undefined" ? window.location.pathname.replace(pathname, "") : "";

  useEffect(() => {
    if (failed || submitted) return;
    const paymentIntent = params.get("payment_intent");
    const setupIntent = params.get("setup_intent");
    const raw = sessionStorage.getItem("notchup_slash_form");
    if (!raw) return;

    try {
      const formData = JSON.parse(raw);
      setSubmitted(true);
      setServices(formData.services ?? []);

      fetch(`${base}/api/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, stripePaymentIntentId: paymentIntent ?? setupIntent }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.customerId) {
            setCustomerId(data.customerId);
            setCreds(
              (formData.services ?? []).map((s: ServiceEntry) => ({
                serviceId: s.id,
                provider: s.provider,
                serviceType: s.serviceType,
                username: "",
                password: "",
                accountNumber: "",
                showPass: false,
              }))
            );
          }
        })
        .catch(console.error);

      sessionStorage.removeItem("notchup_slash_form");

      fetch(`${base}/api/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "payment_success", meta: { scheduled } }),
      }).catch(() => {});
    } catch (e) {
      console.error(e);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!failed) return;
    fetch(`${base}/api/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "payment_fail", meta: { redirectStatus } }),
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [failed]);

  const updateCred = (idx: number, patch: Partial<CredEntry>) =>
    setCreds((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return;
    setSavingCreds(true);
    try {
      const payload = creds.map((c) => ({
        serviceId: c.serviceId,
        username: c.username,
        password: c.password,
        accountNumber: c.accountNumber,
      }));
      await fetch(`${base}/api/credentials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, services: payload }),
      });
      fetch(`${base}/api/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "credentials_submit" }),
      }).catch(() => {});
      setPhase("done");
    } catch {
      alert("Failed to save. Please try again.");
    } finally {
      setSavingCreds(false);
    }
  };

  // ─── FAILURE ───
  if (failed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16" style={{ background: "var(--bg)" }}>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "#FEF2F2" }}>
            <XCircle size={30} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-3" style={{ fontFamily: "var(--font-montserrat)" }}>
            Payment not completed
          </h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Your payment was {redirectStatus === "canceled" ? "cancelled" : "declined"}. No charge was made to your card.
          </p>
          <Link href="/sign-up" className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-bold text-white hover:opacity-90 mb-3" style={{ background: "#4F4EA5" }}>
            Try again <ArrowRight size={14} />
          </Link>
          <Link href="https://notchup.app" className="text-sm text-gray-400 hover:text-gray-600 underline">
            Back to NotchUp
          </Link>
        </div>
      </div>
    );
  }

  // ─── ALL DONE ───
  if (phase === "done") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16" style={{ background: "var(--bg)" }}>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "#ECFDF3" }}>
            <Sparkles size={28} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-3" style={{ fontFamily: "var(--font-montserrat)" }}>
            You&apos;re all set!
          </h1>
          <p className="text-gray-500 mb-6 leading-relaxed">
            We&apos;ve got everything we need. Our AI agents will start working on your file and email you a savings proposal within 3–5 weeks.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-xs text-green-800 text-left">
            <strong>Reminder:</strong> If we can&apos;t save you $100+/year or you reject our offer, your $35 is fully refunded.
          </div>
          <Link href="https://notchup.app" className="inline-flex items-center gap-2 text-sm font-bold hover:opacity-80 transition-opacity" style={{ color: "#4F4EA5" }}>
            Back to NotchUp <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  // ─── CREDENTIALS ───
  if (phase === "credentials" && creds.length > 0) {
    const canSubmit = creds.every((c) => c.username && c.password);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16" style={{ background: "var(--bg)" }}>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12 max-w-lg w-full">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: "#4F4EA5" }}>
            <ShieldCheck size={20} className="text-white" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-1" style={{ fontFamily: "var(--font-montserrat)" }}>
            Add your account login
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            We need this to log in to your provider portal and negotiate on your behalf.
          </p>
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6">
            <ShieldCheck size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 leading-relaxed">
              <strong>AES-256 encrypted.</strong> Stored securely. Only used by our AI agents — never visible to humans or shared with third parties.
            </p>
          </div>
          <form onSubmit={handleCredentialsSubmit}>
            <div className="space-y-5">
              {creds.map((cred, idx) => (
                <div key={idx} className="rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: "#4F4EA5" }}>
                      {cred.serviceType === "internet" ? <Wifi size={14} /> : <Smartphone size={14} />}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{cred.provider}</div>
                      <div className="text-xs text-gray-400">{cred.serviceType === "internet" ? "Internet" : "Cell Phone"}</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Account username / email</label>
                      <input
                        type="text"
                        autoComplete="off"
                        value={cred.username}
                        onChange={(e) => updateCred(idx, { username: e.target.value })}
                        placeholder={`Your ${cred.provider} account username`}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
                      <div className="relative">
                        <input
                          type={cred.showPass ? "text" : "password"}
                          autoComplete="new-password"
                          value={cred.password}
                          onChange={(e) => updateCred(idx, { password: e.target.value })}
                          placeholder="Your account password"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400"
                        />
                        <button type="button" onClick={() => updateCred(idx, { showPass: !cred.showPass })} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {cred.showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Account number <span className="text-gray-400 font-normal">(optional)</span></label>
                      <input
                        type="text"
                        value={cred.accountNumber}
                        onChange={(e) => updateCred(idx, { accountNumber: e.target.value })}
                        placeholder="Found on your bill"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button type="submit" disabled={!canSubmit || savingCreds} className="mt-6 w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: "#4F4EA5", fontFamily: "var(--font-montserrat)" }}>
              {savingCreds ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : "Submit & finish →"}
            </button>
            <button type="button" onClick={() => setPhase("done")} className="mt-3 w-full text-xs text-gray-400 hover:text-gray-600 underline py-1">
              I&apos;ll do this later (we&apos;ll send a reminder)
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── SUCCESS ───
  const formattedDate = scheduledDate
    ? new Date(scheduledDate + "T00:00:00").toLocaleDateString("en-CA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16" style={{ background: "var(--bg)" }}>
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12 max-w-md w-full">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: scheduled ? "#FEF3C7" : "#ECFDF3" }}>
          {scheduled ? <Clock size={28} className="text-amber-500" /> : <CheckCircle size={28} className="text-green-500" />}
        </div>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2" style={{ fontFamily: "var(--font-montserrat)" }}>
            {scheduled ? "You're on the list!" : "Payment received!"}
          </h1>
          <p className="text-gray-500 leading-relaxed">
            {scheduled
              ? `Your $35 activation fee is scheduled for ${formattedDate ?? "your chosen date"}. We'll start working on your file right away.`
              : "Your $35 activation fee is confirmed. You're in our negotiation queue."}
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-5 mb-6 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">What happens next</p>
          {[
            { icon: "✉️", text: "Confirmation email within 24 hours" },
            { icon: "🤖", text: "AI agents begin working in 3–5 weeks" },
            { icon: "✅", text: "We email you a savings proposal to approve or reject" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-sm text-gray-600">
              <span className="shrink-0 text-base">{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-xs text-green-800">
          <strong>Guarantee:</strong> If we can&apos;t save you $100+/year or you reject our offer, your $35 is fully refunded.
        </div>

        <button
          onClick={() => setPhase("credentials")}
          className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 mb-2"
          style={{ background: "#4F4EA5", fontFamily: "var(--font-montserrat)" }}
        >
          <ShieldCheck size={15} />
          Add account login to get started →
        </button>
        <p className="text-xs text-gray-400 text-center">
          We need your provider login to negotiate on your behalf.
        </p>
      </div>

      <div className="mt-6 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://cdn.prod.website-files.com/663d33e48a497e68ec23fc06/66427492c358294cac47f56b_NU%201B.png" alt="NotchUp" style={{ height: 18, width: "auto", margin: "0 auto 6px" }} />
        <p className="text-xs text-gray-400">AI-powered bill negotiation for Canadians 🇨🇦</p>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 size={24} className="animate-spin text-gray-300" /></div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
