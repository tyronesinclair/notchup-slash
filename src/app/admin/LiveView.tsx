"use client";
import { useState } from "react";
import { Maximize2, Minimize2, ExternalLink, AlertTriangle } from "lucide-react";

// The remote-browser viewport. Inline by default; Expand fills the screen so the
// operator can actually see and drive the telco login (the in-column view is small).
export default function LiveView({ url, mock, height = 560 }: { url: string; mock?: boolean; height?: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={expanded ? "fixed inset-0 z-50 bg-black/85 p-4 flex flex-col" : ""}>
      {mock && !expanded && (
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-2">
          <AlertTriangle size={13} /> MOCK — no Browserbase key. Placeholder browser.
        </div>
      )}
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-xs font-semibold ${expanded ? "text-white" : "text-gray-500"}`}>
          Remote browser{mock ? " (mock)" : ""}
        </span>
        <div className="flex items-center gap-3">
          <a href={url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1 text-xs ${expanded ? "text-gray-200 hover:text-white" : "text-gray-500 hover:text-violet-600"}`}>
            New tab <ExternalLink size={11} />
          </a>
          <button onClick={() => setExpanded((e) => !e)} className={`flex items-center gap-1 text-xs font-semibold ${expanded ? "text-white" : "text-violet-600 hover:underline"}`}>
            {expanded ? <>Minimize <Minimize2 size={12} /></> : <>Expand <Maximize2 size={12} /></>}
          </button>
        </div>
      </div>
      <iframe
        src={url}
        title="Live View"
        allow="clipboard-read; clipboard-write"
        className="w-full rounded-lg border border-gray-300 bg-gray-900"
        style={expanded ? { flex: 1 } : { height }}
      />
    </div>
  );
}
