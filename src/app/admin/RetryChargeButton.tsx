"use client";
import { useState } from "react";
import { RefreshCw, Loader2, CheckCircle, XCircle } from "lucide-react";

export default function RetryChargeButton({ paymentId }: { paymentId: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const retry = async () => {
    setLoading(true);
    setResult(null);
    setMessage(null);
    try {
      const res = await fetch("/slash/api/admin/retry-charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult("error");
        setMessage(data.error ?? "Failed");
      } else if (data.status === "succeeded") {
        setResult("success");
        setMessage("Charged!");
      } else {
        setResult("error");
        setMessage(data.status ?? "Unknown");
      }
    } catch {
      setResult("error");
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (result === "success") {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-green-700">
        <CheckCircle size={13} /> {message}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {result === "error" && message && (
        <span className="flex items-center gap-1 text-xs text-red-600">
          <XCircle size={12} /> {message}
        </span>
      )}
      <button
        onClick={retry}
        disabled={loading}
        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
        {loading ? "Retrying…" : "Retry"}
      </button>
    </div>
  );
}
