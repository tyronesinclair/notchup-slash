"use client";
import { useState, useEffect, useRef } from "react";
import { Phone, Pencil, Check, X, Monitor, Loader2, MessageSquare, Copy, CheckCircle2, AlertTriangle } from "lucide-react";
import { formatDisplay } from "@/lib/phone";

type Props = {
  customerId: string;
  phone: string;
  activationStatus: string;
  provider: string;
};

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  not_started: { bg: "#F3F4F6", color: "#6B7280", label: "Not started" },
  in_progress: { bg: "#FEF3C7", color: "#92400E", label: "In progress" },
  activated:   { bg: "#ECFDF3", color: "#065F46", label: "Activated" },
  failed:      { bg: "#FEF2F2", color: "#991B1B", label: "Failed" },
};

export default function OperatorConsole({ customerId, phone, activationStatus, provider }: Props) {
  // ── Phone ──
  const [phoneVal, setPhoneVal] = useState(phone);
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneDraft, setPhoneDraft] = useState(phone);
  const [phoneErr, setPhoneErr] = useState<string | null>(null);
  const [savingPhone, setSavingPhone] = useState(false);

  const savePhone = async () => {
    setSavingPhone(true);
    setPhoneErr(null);
    try {
      const res = await fetch("/slash/api/admin/update-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, phone: phoneDraft }),
      });
      const data = await res.json();
      if (!res.ok) { setPhoneErr(data.error ?? "Failed"); return; }
      setPhoneVal(data.phone);
      setEditingPhone(false);
    } catch {
      setPhoneErr("Network error");
    } finally {
      setSavingPhone(false);
    }
  };

  // ── Activation / Live View ──
  const [status, setStatus] = useState(activationStatus);
  const [liveUrl, setLiveUrl] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [mockBrowser, setMockBrowser] = useState(false);
  const [startErr, setStartErr] = useState<string | null>(null);

  const startActivation = async () => {
    setStarting(true);
    setStartErr(null);
    try {
      const res = await fetch("/slash/api/admin/browser-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      });
      const data = await res.json();
      if (!res.ok) { setStartErr(data.error ?? "Failed to start"); return; }
      setLiveUrl(data.liveViewUrl);
      setMockBrowser(!!data.mock);
      setStatus("in_progress");
    } catch {
      setStartErr("Network error");
    } finally {
      setStarting(false);
    }
  };

  const setActivation = async (next: string) => {
    setStatus(next);
    await fetch("/slash/api/admin/activation-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId, status: next }),
    }).catch(() => {});
  };

  // ── OTP relay ──
  const [requesting, setRequesting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [mockSms, setMockSms] = useState(false);
  const [otpErr, setOtpErr] = useState<string | null>(null);
  const [latestCode, setLatestCode] = useState<string | null>(null);
  const [latestBody, setLatestBody] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [copied, setCopied] = useState(false);
  const baselineRef = useRef<string | null>(null);

  const requestCode = async () => {
    setRequesting(true);
    setOtpErr(null);
    setLatestCode(null);
    setLatestBody(null);
    try {
      // Record what the latest inbound was BEFORE we ask, so we only surface a fresh reply.
      const cur = await fetch(`/slash/api/admin/latest-otp?customerId=${customerId}`).then((r) => r.json());
      baselineRef.current = cur?.message?.receivedAt ?? null;

      const res = await fetch("/slash/api/admin/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      });
      const data = await res.json();
      if (!res.ok) { setOtpErr(data.error ?? "Failed to send"); return; }
      setOtpSent(true);
      setMockSms(!!data.mock);
      setPolling(true);
    } catch {
      setOtpErr("Network error");
    } finally {
      setRequesting(false);
    }
  };

  // Poll for the customer's reply while waiting.
  useEffect(() => {
    if (!polling) return;
    const iv = setInterval(async () => {
      try {
        const data = await fetch(`/slash/api/admin/latest-otp?customerId=${customerId}`).then((r) => r.json());
        const msg = data?.message;
        if (msg && msg.receivedAt !== baselineRef.current) {
          setLatestBody(msg.body);
          if (msg.code) {
            setLatestCode(msg.code);
            setPolling(false);
          }
        }
      } catch { /* keep polling */ }
    }, 3000);
    return () => clearInterval(iv);
  }, [polling, customerId]);

  const copyCode = () => {
    if (!latestCode) return;
    navigator.clipboard.writeText(latestCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const st = STATUS_STYLES[status] ?? STATUS_STYLES.not_started;
  const hasPhone = !!formatDisplay(phoneVal);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest" style={{ fontFamily: "var(--font-montserrat)" }}>
          Activation console
        </h2>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: st.bg, color: st.color }}>
          {st.label}
        </span>
      </div>

      {/* Phone */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-2">
          <Phone size={13} /> Mobile (for OTP relay)
        </div>
        {editingPhone ? (
          <div className="flex items-center gap-2">
            <input
              type="tel"
              value={phoneDraft}
              onChange={(e) => setPhoneDraft(e.target.value)}
              placeholder="(604) 555-0123"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
            <button onClick={savePhone} disabled={savingPhone} className="p-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50">
              {savingPhone ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            </button>
            <button onClick={() => { setEditingPhone(false); setPhoneDraft(phoneVal); setPhoneErr(null); }} className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50">
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            {hasPhone ? (
              <span className="text-sm font-medium text-gray-900">{formatDisplay(phoneVal)}</span>
            ) : (
              <span className="flex items-center gap-1.5 text-sm font-semibold text-amber-600">
                <AlertTriangle size={14} /> No phone on file — add one to text the code
              </span>
            )}
            <button onClick={() => { setEditingPhone(true); setPhoneDraft(phoneVal); }} className="flex items-center gap-1 text-xs text-violet-600 hover:underline font-semibold">
              <Pencil size={11} /> {hasPhone ? "Edit" : "Add"}
            </button>
          </div>
        )}
        {phoneErr && <p className="text-xs text-red-500 mt-1">{phoneErr}</p>}
      </div>

      {/* Activation / Live View */}
      <div className="border-t border-gray-100 pt-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-3">
          <Monitor size={13} /> Remote browser
        </div>
        {!liveUrl ? (
          <button onClick={startActivation} disabled={starting} className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50" style={{ background: "#4F4EA5" }}>
            {starting ? <><Loader2 size={15} className="animate-spin" /> Starting…</> : <><Monitor size={15} /> Start activation</>}
          </button>
        ) : (
          <div className="space-y-3">
            {mockBrowser && (
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <AlertTriangle size={13} /> MOCK — no Browserbase key set. This is a placeholder browser.
              </div>
            )}
            <iframe src={liveUrl} className="w-full rounded-lg border border-gray-300" style={{ height: 460 }} title="Live View" sandbox="allow-same-origin allow-scripts allow-forms" />
            <div className="flex gap-2">
              <button onClick={() => setActivation("activated")} className="flex-1 py-2 rounded-lg text-xs font-semibold text-green-700 bg-green-50 border border-green-200 hover:bg-green-100">
                Mark activated
              </button>
              <button onClick={() => setActivation("failed")} className="flex-1 py-2 rounded-lg text-xs font-semibold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100">
                Mark failed
              </button>
            </div>
          </div>
        )}
        {startErr && <p className="text-xs text-red-500 mt-2">{startErr}</p>}
      </div>

      {/* OTP relay */}
      <div className="border-t border-gray-100 pt-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-3">
          <MessageSquare size={13} /> Verification code relay
        </div>
        <button onClick={requestCode} disabled={requesting || !hasPhone} className="w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border border-violet-300 text-violet-700 bg-violet-50 hover:bg-violet-100 disabled:opacity-50">
          {requesting ? <><Loader2 size={14} className="animate-spin" /> Texting…</> : <><MessageSquare size={14} /> Request code from {provider}</>}
        </button>
        {!hasPhone && <p className="text-xs text-amber-600 mt-2">Add a phone number above before requesting a code.</p>}

        {otpSent && (
          <div className="mt-3 space-y-2">
            {mockSms && (
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <AlertTriangle size={13} /> MOCK — no Twilio key set. No real text sent.
              </div>
            )}
            {!latestCode ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-3">
                <Loader2 size={14} className="animate-spin" /> Waiting for the customer&apos;s reply…
              </div>
            ) : (
              <div className="flex items-center justify-between bg-green-50 border-2 border-green-300 rounded-lg px-4 py-3">
                <div>
                  <div className="text-xs text-green-700 font-semibold">Code received</div>
                  <div className="text-2xl font-extrabold tracking-widest text-green-900 font-mono">{latestCode}</div>
                </div>
                <button onClick={copyCode} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-green-300 text-green-700 text-xs font-semibold hover:bg-green-100">
                  {copied ? <><CheckCircle2 size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
                </button>
              </div>
            )}
            {latestBody && !latestCode && (
              <p className="text-xs text-gray-400">Last reply: &ldquo;{latestBody}&rdquo; (no code detected — ask them to resend just the digits)</p>
            )}
          </div>
        )}
        {otpErr && <p className="text-xs text-red-500 mt-2">{otpErr}</p>}
      </div>
    </div>
  );
}
