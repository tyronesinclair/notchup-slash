"use client";
import { useState, useEffect } from "react";
import { Bell, ArrowRight, KeyRound } from "lucide-react";

type Msg = { id: string; customerId: string; name: string; body: string; code: string | null; at: string };

const SEEN_KEY = "notchup_inbox_last_seen";

export default function AlertInbox() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [lastSeen, setLastSeen] = useState<number>(() =>
    typeof window === "undefined" ? 0 : Number(localStorage.getItem(SEEN_KEY) || 0)
  );
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState(0); // captured from polls, so render stays pure

  // Live-poll inbound replies.
  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const data = await fetch("/slash/api/admin/inbox").then((r) => r.json());
        if (active && Array.isArray(data.messages)) {
          setMessages(data.messages);
          setLoaded(true);
          setNow(new Date().getTime());
        }
      } catch { /* keep last */ }
    };
    poll();
    const iv = setInterval(poll, 5000);
    return () => { active = false; clearInterval(iv); };
  }, []);

  const newCount = messages.filter((m) => new Date(m.at).getTime() > lastSeen).length;

  const markAllSeen = () => {
    const newest = messages.length ? new Date(messages[0].at).getTime() : now;
    localStorage.setItem(SEEN_KEY, String(newest));
    setLastSeen(newest);
  };

  const fmt = (at: string) => {
    const d = new Date(at);
    const mins = Math.round((now - d.getTime()) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
    return d.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
  };

  return (
    <div className="bg-white rounded-xl border-2 overflow-hidden" style={{ borderColor: newCount > 0 ? "#7F56D9" : "#E5E7EB" }}>
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold text-gray-700" style={{ fontFamily: "var(--font-montserrat)" }}>
          <Bell size={15} className={newCount > 0 ? "text-violet-600" : "text-gray-400"} />
          Replies inbox
          {newCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-violet-600 text-white text-xs font-bold">
              {newCount}
            </span>
          )}
        </h2>
        {newCount > 0 && (
          <button onClick={markAllSeen} className="text-xs text-gray-400 hover:text-gray-600 font-semibold">
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
        {!loaded ? (
          <p className="px-6 py-6 text-center text-xs text-gray-400">Loading…</p>
        ) : messages.length === 0 ? (
          <p className="px-6 py-6 text-center text-xs text-gray-400">No customer replies yet. Inbound texts show up here live.</p>
        ) : (
          messages.map((m) => {
            const isNew = new Date(m.at).getTime() > lastSeen;
            return (
              <a
                key={m.id}
                href={`/slash/admin/customers/${m.customerId}`}
                className={`flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors ${isNew ? "bg-violet-50/60" : ""}`}
              >
                {isNew && <span className="w-2 h-2 rounded-full bg-violet-600 shrink-0" />}
                <div className={`flex-1 min-w-0 ${isNew ? "" : "pl-5"}`}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-900 truncate">{m.name}</span>
                    {m.code && (
                      <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-green-700 bg-green-50 border border-green-200 rounded px-1.5 py-0.5">
                        <KeyRound size={10} /> {m.code}
                      </span>
                    )}
                    <span className="text-xs text-gray-400 ml-auto shrink-0">{fmt(m.at)}</span>
                  </div>
                  <div className="text-xs text-gray-500 truncate">{m.body}</div>
                </div>
                <ArrowRight size={14} className="text-gray-300 shrink-0" />
              </a>
            );
          })
        )}
      </div>
    </div>
  );
}
