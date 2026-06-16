"use client";
import { useState, useEffect, useRef } from "react";
import { Monitor, Loader2, MessageSquare, Copy, CheckCircle2, ExternalLink, Phone } from "lucide-react";
import LiveView from "../LiveView";

type Cred = { username: string; password: string; accountNumber: string } | null;
type Props = {
  customerId: string;
  name: string;
  email: string;
  provider: string;
  loginUrl: string | null;
  phoneDisplay: string;
  cred: Cred;
  activationStatus: string;
};

function CopyBtn({ value, id, copiedId, setCopiedId }: { value: string; id: string; copiedId: string | null; setCopiedId: (s: string | null) => void }) {
  if (!value) return <span className="text-gray-300">—</span>;
  return (
    <span className="flex items-center gap-1.5">
      <span className="font-mono text-gray-800 break-all">{value}</span>
      <button
        onClick={() => navigator.clipboard.writeText(value).then(() => { setCopiedId(id); setTimeout(() => setCopiedId(null), 1500); })}
        className="shrink-0 text-gray-400 hover:text-violet-600"
        title="Copy"
      >
        {copiedId === id ? <CheckCircle2 size={12} className="text-green-600" /> : <Copy size={12} />}
      </button>
    </span>
  );
}

export default function BatchActivationCard({ customerId, name, email, provider, loginUrl, phoneDisplay, cred, activationStatus }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [status, setStatus] = useState(activationStatus);

  const [liveUrl, setLiveUrl] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [mockBrowser, setMockBrowser] = useState(false);

  const [requesting, setRequesting] = useState(false);
  const [sentBody, setSentBody] = useState<string | null>(null);
  const [mockSms, setMockSms] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const baselineRef = useRef<string | null>(null);
  const pollCountRef = useRef(0);

  const hasPhone = !!phoneDisplay;

  const start = async () => {
    setStarting(true); setErr(null);
    try {
      const res = await fetch("/slash/api/admin/browser-session", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "Failed to start"); return; }
      setLiveUrl(data.liveViewUrl); setMockBrowser(!!data.mock); setStatus("in_progress");
    } catch { setErr("Network error"); } finally { setStarting(false); }
  };

  const requestCode = async () => {
    setRequesting(true); setErr(null); setCode(null); setReplyBody(null);
    try {
      const cur = await fetch(`/slash/api/admin/latest-otp?customerId=${customerId}`).then((r) => r.json());
      baselineRef.current = cur?.message?.receivedAt ?? null;
      const res = await fetch("/slash/api/admin/request-otp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "Failed to send"); return; }
      setSentBody(data.body ?? null); setMockSms(!!data.mock);
      pollCountRef.current = 0; setPolling(true);
    } catch { setErr("Network error"); } finally { setRequesting(false); }
  };

  useEffect(() => {
    if (!polling) return;
    const iv = setInterval(async () => {
      pollCountRef.current += 1;
      if (pollCountRef.current > 100) { setPolling(false); return; }
      try {
        const data = await fetch(`/slash/api/admin/latest-otp?customerId=${customerId}`).then((r) => r.json());
        const msg = data?.message;
        if (msg && msg.receivedAt !== baselineRef.current) {
          setReplyBody(msg.body);
          if (msg.code) { setCode(msg.code); setPolling(false); }
        }
      } catch { /* keep polling */ }
    }, 3000);
    return () => clearInterval(iv);
  }, [polling, customerId]);

  const setActivation = async (next: string) => {
    setStatus(next);
    await fetch("/slash/api/admin/activation-status", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId, status: next }),
    }).catch(() => {});
  };

  const statusColor = status === "activated" ? "text-green-700 bg-green-50 border-green-200"
    : status === "failed" ? "text-red-700 bg-red-50 border-red-200"
    : status === "in_progress" ? "text-amber-700 bg-amber-50 border-amber-200"
    : "text-gray-500 bg-gray-50 border-gray-200";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <a href={`/slash/admin/customers/${customerId}`} className="font-bold text-gray-900 hover:text-violet-600">{name}</a>
          <div className="text-xs text-gray-400">{email}</div>
        </div>
        <span className={`shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusColor}`}>
          {status.replace("_", " ")}
        </span>
      </div>

      {/* Provider + login + phone */}
      <div className="text-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-gray-500">{provider}</span>
          {loginUrl && (
            <a href={loginUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-violet-600 font-semibold hover:underline">
              Login <ExternalLink size={11} />
            </a>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-gray-500">
          <Phone size={11} /> {hasPhone ? phoneDisplay : <span className="text-amber-600 font-semibold">no phone</span>}
        </div>
      </div>

      {/* Credentials */}
      {cred ? (
        <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-xs space-y-1">
          <div className="flex justify-between gap-2"><span className="text-gray-500">User</span><CopyBtn value={cred.username} id="u" copiedId={copiedId} setCopiedId={setCopiedId} /></div>
          <div className="flex justify-between gap-2"><span className="text-gray-500">Pass</span><CopyBtn value={cred.password} id="p" copiedId={copiedId} setCopiedId={setCopiedId} /></div>
          {cred.accountNumber && <div className="flex justify-between gap-2"><span className="text-gray-500">Acct</span><CopyBtn value={cred.accountNumber} id="a" copiedId={copiedId} setCopiedId={setCopiedId} /></div>}
        </div>
      ) : (
        <div className="text-xs text-gray-400 italic">No credentials on file.</div>
      )}

      {/* Browser */}
      {!liveUrl ? (
        <button onClick={start} disabled={starting} className="w-full py-2 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-1.5 hover:opacity-90 disabled:opacity-50" style={{ background: "#4F4EA5" }}>
          {starting ? <><Loader2 size={13} className="animate-spin" /> Opening…</> : <><Monitor size={13} /> Start browser</>}
        </button>
      ) : (
        <LiveView url={liveUrl} mock={mockBrowser} height={300} />
      )}

      {/* OTP relay */}
      <button onClick={requestCode} disabled={requesting || !hasPhone} className="w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border border-violet-300 text-violet-700 bg-violet-50 hover:bg-violet-100 disabled:opacity-50">
        {requesting ? <><Loader2 size={12} className="animate-spin" /> Texting…</> : <><MessageSquare size={12} /> Request code</>}
      </button>

      {sentBody && (
        <div className="rounded-lg bg-blue-50 border border-blue-100 px-2.5 py-1.5 text-[11px] text-gray-600 italic">
          {mockSms ? "Would text" : "Texted"}: &ldquo;{sentBody}&rdquo;
        </div>
      )}

      {code ? (
        <div className="flex items-center justify-between bg-green-50 border-2 border-green-300 rounded-lg px-3 py-2">
          <span className="text-xl font-extrabold tracking-widest text-green-900 font-mono">{code}</span>
          <button onClick={() => navigator.clipboard.writeText(code).then(() => { setCopiedId("code"); setTimeout(() => setCopiedId(null), 1500); })} className="flex items-center gap-1 text-xs font-semibold text-green-700">
            {copiedId === "code" ? <CheckCircle2 size={13} /> : <Copy size={13} />} Copy
          </button>
        </div>
      ) : polling ? (
        <div className="flex items-center gap-2 text-xs text-gray-500"><Loader2 size={12} className="animate-spin" /> Waiting for reply…</div>
      ) : replyBody ? (
        <div className="text-[11px] text-amber-600">Replied &ldquo;{replyBody}&rdquo; — no code detected.</div>
      ) : null}

      {/* Mark done */}
      <div className="flex gap-2 pt-1">
        <button onClick={() => setActivation("activated")} className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 hover:bg-green-100">✓ Activated</button>
        <button onClick={() => setActivation("failed")} className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100">Failed</button>
      </div>

      {err && <p className="text-xs text-red-500">{err}</p>}
    </div>
  );
}
