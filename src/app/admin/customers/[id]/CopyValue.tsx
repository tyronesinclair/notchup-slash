"use client";
import { useState } from "react";
import { Copy, CheckCircle2 } from "lucide-react";

// One-click copy for a credential value, so the operator can paste it into the Live View.
export default function CopyValue({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  if (!value) return <span className="col-span-2 text-gray-400">—</span>;
  const copy = () =>
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  return (
    <span className="col-span-2 flex items-center gap-2">
      <span className="font-mono text-gray-900 break-all">{value}</span>
      <button onClick={copy} className="shrink-0 text-gray-400 hover:text-violet-600" title="Copy to clipboard">
        {copied ? <CheckCircle2 size={13} className="text-green-600" /> : <Copy size={13} />}
      </button>
    </span>
  );
}
