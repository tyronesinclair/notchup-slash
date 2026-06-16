"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Loader2, Copy, CheckCircle2, KeyRound, AlertTriangle } from "lucide-react";

type Msg = { id: string; direction: string; body: string; code: string | null; at: string };

export default function SmsChat({ customerId, hasPhone }: { customerId: string; hasPhone: boolean }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [mock, setMock] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const data = await fetch(`/slash/api/admin/sms-thread?customerId=${customerId}`).then((r) => r.json());
      if (Array.isArray(data.messages)) setMessages(data.messages);
    } catch { /* keep last */ }
  }, [customerId]);

  // Live-poll the thread so inbound replies appear without a refresh. Inline async
  // fetch (setState only fires after the await, never synchronously in the effect).
  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const data = await fetch(`/slash/api/admin/sms-thread?customerId=${customerId}`).then((r) => r.json());
        if (active && Array.isArray(data.messages)) setMessages(data.messages);
      } catch { /* keep last */ }
    };
    poll();
    const iv = setInterval(poll, 4000);
    return () => { active = false; clearInterval(iv); };
  }, [customerId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length]);

  const latestCode = [...messages].reverse().find((m) => m.direction === "inbound" && m.code)?.code ?? null;

  const send = async () => {
    if (!draft.trim()) return;
    setSending(true); setErr(null);
    try {
      const res = await fetch("/slash/api/admin/send-sms", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, body: draft }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "Send failed"); return; }
      setMock(!!data.mock); setDraft(""); load();
    } catch { setErr("Network error"); } finally { setSending(false); }
  };

  const requestCode = async () => {
    setRequesting(true); setErr(null);
    try {
      const res = await fetch("/slash/api/admin/request-otp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "Failed"); return; }
      setMock(!!data.mock); load();
    } catch { setErr("Network error"); } finally { setRequesting(false); }
  };

  const copyCode = () => {
    if (!latestCode) return;
    navigator.clipboard.writeText(latestCode).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  };

  const fmt = (at: string) => new Date(at).toLocaleString("en-CA", { timeZone: "America/Vancouver", hour: "numeric", minute: "2-digit" });

  return (
    <div>
      {mock && (
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-2">
          <AlertTriangle size={13} /> MOCK — no Twilio key. Messages are logged but not actually sent.
        </div>
      )}

      {/* Latest detected code — quick grab */}
      {latestCode && (
        <div className="flex items-center justify-between bg-green-50 border-2 border-green-300 rounded-lg px-4 py-2.5 mb-3">
          <div>
            <div className="text-xs text-green-700 font-semibold">Latest code received</div>
            <div className="text-2xl font-extrabold tracking-widest text-green-900 font-mono">{latestCode}</div>
          </div>
          <button onClick={copyCode} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-green-300 text-green-700 text-xs font-semibold hover:bg-green-100">
            {copied ? <><CheckCircle2 size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
          </button>
        </div>
      )}

      {/* Conversation */}
      <div ref={scrollRef} className="rounded-lg border border-gray-200 bg-gray-50 p-3 max-h-72 overflow-y-auto space-y-2">
        {messages.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">No messages yet. Request a code or send a message below.</p>
        ) : (
          messages.map((m) => {
            const out = m.direction === "outbound";
            return (
              <div key={m.id} className={`flex ${out ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-1.5 ${out ? "bg-violet-100" : "bg-white border border-gray-200"}`}>
                  <div className="text-sm text-gray-800 break-words">
                    {m.body}
                    {m.code && <span className="ml-1.5 font-mono font-bold text-green-700">[{m.code}]</span>}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{out ? "NotchUp" : "Customer"} · {fmt(m.at)}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Actions */}
      <div className="mt-3 space-y-2">
        <button
          onClick={requestCode}
          disabled={requesting || !hasPhone}
          className="w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border border-violet-300 text-violet-700 bg-violet-50 hover:bg-violet-100 disabled:opacity-50"
        >
          {requesting ? <><Loader2 size={13} className="animate-spin" /> Sending request…</> : <><KeyRound size={13} /> Request verification code</>}
        </button>

        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send(); }}
            rows={2}
            placeholder={hasPhone ? "Message the customer… (e.g. that code expired, sending a fresh one)" : "Add a phone number first"}
            disabled={!hasPhone}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-y disabled:bg-gray-50"
          />
          <button
            onClick={send}
            disabled={sending || !draft.trim() || !hasPhone}
            className="shrink-0 px-3 py-2.5 rounded-lg text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-40"
            title="Send (⌘/Ctrl+Enter)"
          >
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
        {!hasPhone && <p className="text-xs text-amber-600">Add a phone number above to message this customer.</p>}
        {err && <p className="text-xs text-red-500">{err}</p>}
      </div>
    </div>
  );
}
