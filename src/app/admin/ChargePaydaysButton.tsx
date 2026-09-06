"use client";
import { useState } from "react";
import { CalendarCheck, Loader2 } from "lucide-react";

type Result = { email: string; action: string; status: string; error?: string };

export default function ChargePaydaysButton({ dueCount }: { dueCount: number }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ found: number; results: Result[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (!confirm(`Charge the ${dueCount} subscriber${dueCount === 1 ? "" : "s"} whose payday has arrived? Stripe will bill their saved card $15 now.`)) return;
    setLoading(true); setResult(null); setError(null);
    try {
      const res = await fetch("/slash/api/admin/charge-paydays", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setResult(data);
    } catch (e) { setError(e instanceof Error ? e.message : "Unknown error"); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <button onClick={run} disabled={loading || dueCount === 0}
        className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border border-violet-300 text-violet-700 bg-violet-50 hover:bg-violet-100 disabled:opacity-50 transition-colors">
        {loading ? <Loader2 size={13} className="animate-spin" /> : <CalendarCheck size={13} />}
        {loading ? "Charging…" : `Charge due paydays (${dueCount})`}
      </button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {result && (
        <div className="mt-2 text-xs text-gray-600 space-y-0.5">
          <p className="font-semibold">{result.found} processed</p>
          {result.results.map((r) => (
            <p key={r.email + r.action}><span className="font-mono">{r.email}</span> · {r.action} → <span className={r.status === "active" || r.status === "paid" ? "text-green-700 font-semibold" : "text-amber-700"}>{r.status}</span>{r.error ? ` (${r.error})` : ""}</p>
          ))}
        </div>
      )}
    </div>
  );
}
