"use client";
import { useState } from "react";
import { Zap, Loader2 } from "lucide-react";

type Result = { email: string; status: string; chargeId?: string; error?: string };

export default function RunChargesButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ found: number; processed: number; cutoff: string; results: Result[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (!confirm("Charge all scheduled payments due today (PST)? This will bill customers' saved cards.")) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/slash/api/admin/run-charges", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={run}
        disabled={loading}
        className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border border-violet-300 text-violet-700 bg-violet-50 hover:bg-violet-100 disabled:opacity-50 transition-colors"
      >
        {loading ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
        {loading ? "Running…" : "Run today's charges"}
      </button>

      {error && (
        <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          Error: {error}
        </div>
      )}

      {result && (
        <div className="mt-2 text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <div className="font-semibold text-gray-700 mb-1">
            Found {result.found} due · Processed {result.processed}
          </div>
          {result.results.map((r, i) => (
            <div key={i} className={`flex gap-2 ${r.status === "succeeded" ? "text-green-700" : r.status === "error" ? "text-red-600" : "text-gray-500"}`}>
              <span>{r.email}</span>
              <span className="font-medium">{r.status}</span>
              {r.chargeId && <span className="text-gray-400">{r.chargeId}</span>}
              {r.error && <span className="text-red-500">{r.error}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
