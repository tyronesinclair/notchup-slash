"use client";
import { useState } from "react";
import { Zap, Loader2, CheckCircle, XCircle } from "lucide-react";

// Per-subscriber: end the trial and bill $15 right now, regardless of the chosen payday.
export default function ChargeNowButton({ paymentId, name }: { paymentId: string; name: string }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const run = async () => {
    if (!confirm(`Charge ${name} $15 now? This ends their $0 period today and bills the saved card.`)) return;
    setLoading(true); setMsg(null);
    try {
      const res = await fetch("/slash/api/admin/charge-paydays", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentId }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      const r = data.results?.[0];
      const ok = r && (r.status === "active" || r.status === "paid");
      setMsg({ ok, text: r ? `${r.action} → ${r.status}${r.error ? ` (${r.error})` : ""}` : "no matching subscriber" });
      if (ok) setTimeout(() => window.location.reload(), 1200);
    } catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : "Unknown error" }); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex items-center gap-2">
      <button onClick={run} disabled={loading} className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border border-gray-300 text-gray-700 bg-white hover:border-violet-400 hover:text-violet-700 disabled:opacity-50">
        {loading ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />} Charge now
      </button>
      {msg && <span className={`text-xs flex items-center gap-1 ${msg.ok ? "text-green-700" : "text-red-600"}`}>{msg.ok ? <CheckCircle size={12} /> : <XCircle size={12} />}{msg.text}</span>}
    </div>
  );
}
