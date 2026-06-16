"use client";
import { useState, useEffect, useRef } from "react";
import { Phone, Pencil, Check, X, Monitor, Loader2, MessageSquare, Copy, CheckCircle2, AlertTriangle, HelpCircle, ExternalLink, StickyNote } from "lucide-react";
import { formatDisplay } from "@/lib/phone";
import LiveView from "../../LiveView";

type Props = {
  customerId: string;
  phone: string;
  activationStatus: string;
  provider: string;
  loginUrl: string | null;
  loginNotes: string | null;
  notes: string;
};

const ACTIVATION_STATES: { key: string; label: string }[] = [
  { key: "not_started", label: "Not started" },
  { key: "in_progress", label: "In progress" },
  { key: "activated", label: "Activated" },
  { key: "failed", label: "Failed" },
];

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  not_started: { bg: "#F3F4F6", color: "#6B7280", label: "Not started" },
  in_progress: { bg: "#FEF3C7", color: "#92400E", label: "In progress" },
  activated:   { bg: "#ECFDF3", color: "#065F46", label: "Activated" },
  failed:      { bg: "#FEF2F2", color: "#991B1B", label: "Failed" },
};

export default function OperatorConsole({ customerId, phone, activationStatus, provider, loginUrl, loginNotes, notes }: Props) {
  // ── shared copy helper ──
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1500);
    });
  };

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
  const [sentBody, setSentBody] = useState<string | null>(null);
  const [otpErr, setOtpErr] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<string[]>([]);
  const [replyBody, setReplyBody] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [pollTimedOut, setPollTimedOut] = useState(false);
  const baselineRef = useRef<string | null>(null);
  const pollCountRef = useRef(0);

  // ── Notes ──
  const [notesVal, setNotesVal] = useState(notes);
  const [notesDirty, setNotesDirty] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  const saveNotes = async () => {
    setSavingNotes(true);
    setNotesSaved(false);
    try {
      await fetch("/slash/api/admin/update-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, notes: notesVal }),
      });
      setNotesDirty(false);
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    } catch { /* leave dirty so they can retry */ }
    finally { setSavingNotes(false); }
  };

  const requestCode = async () => {
    setRequesting(true);
    setOtpErr(null);
    setCode(null);
    setCandidates([]);
    setReplyBody(null);
    try {
      // Note the latest inbound BEFORE we ask, so we only surface a fresh reply.
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
      setSentBody(data.body ?? null);
      setPollTimedOut(false);
      pollCountRef.current = 0;
      setPolling(true);
    } catch {
      setOtpErr("Network error");
    } finally {
      setRequesting(false);
    }
  };

  // Poll for the customer's reply while waiting. Auto-stops after ~5 min so an
  // unanswered request doesn't poll the API forever.
  useEffect(() => {
    if (!polling) return;
    const iv = setInterval(async () => {
      pollCountRef.current += 1;
      if (pollCountRef.current > 100) {
        setPolling(false);
        setPollTimedOut(true);
        return;
      }
      try {
        const data = await fetch(`/slash/api/admin/latest-otp?customerId=${customerId}`).then((r) => r.json());
        const msg = data?.message;
        if (msg && msg.receivedAt !== baselineRef.current) {
          setReplyBody(msg.body);
          setCandidates(msg.candidates ?? []);
          if (msg.code) {
            setCode(msg.code);
            setPolling(false);
          }
        }
      } catch { /* keep polling */ }
    }, 3000);
    return () => clearInterval(iv);
  }, [polling, customerId]);

  const st = STATUS_STYLES[status] ?? STATUS_STYLES.not_started;
  const hasPhone = !!formatDisplay(phoneVal);
  const extraCandidates = candidates.filter((c) => c !== code);

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

      {/* How it works */}
      <details className="group rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
        <summary className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-600 select-none">
          <HelpCircle size={13} /> How to activate this account
        </summary>
        <ol className="mt-3 space-y-1.5 text-xs text-gray-600 list-decimal list-inside">
          <li>Make sure a <strong>mobile number</strong> is on file (add it below if missing).</li>
          <li>Click <strong>Start activation</strong> to open the customer&apos;s remote browser.</li>
          <li>Go to the {provider} login and enter the credentials shown further down this page (use the copy buttons).</li>
          <li>When {provider} asks for a verification code, click <strong>Request code</strong> — the customer gets a text.</li>
          <li>Their reply appears here. Copy the code into the browser, finish login, and check <em>&ldquo;trust this device.&rdquo;</em></li>
          <li>Click <strong>Mark activated</strong>. The session is saved for future negotiations.</li>
        </ol>
      </details>

      {/* Phone */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-2">
          <Phone size={13} /> Mobile number <span className="font-normal text-gray-400">(where we text the code)</span>
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
            <button onClick={savePhone} disabled={savingPhone} className="p-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50" title="Save">
              {savingPhone ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            </button>
            <button onClick={() => { setEditingPhone(false); setPhoneDraft(phoneVal); setPhoneErr(null); }} className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50" title="Cancel">
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
              <Pencil size={11} /> {hasPhone ? "Edit" : "Add number"}
            </button>
          </div>
        )}
        {phoneErr && <p className="text-xs text-red-500 mt-1">{phoneErr}</p>}
      </div>

      {/* Activation / Live View */}
      <div className="border-t border-gray-100 pt-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-3">
          <Monitor size={13} /> Step 1 — Remote browser
        </div>

        {/* Provider login page */}
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
          <div className="text-xs font-semibold text-gray-500 mb-1">{provider} login page</div>
          {loginUrl ? (
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-gray-800 break-all">{loginUrl}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => copy(loginUrl, "url")} className="flex items-center gap-1 text-xs text-gray-500 hover:text-violet-600" title="Copy URL">
                  {copiedId === "url" ? <CheckCircle2 size={13} className="text-green-600" /> : <Copy size={13} />}
                </button>
                <a href={loginUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:underline" title="Open in new tab">
                  Open <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-amber-600">
              <AlertTriangle size={12} /> No login URL on file for &ldquo;{provider}&rdquo; — navigate manually, or add it in src/lib/providers.ts
            </div>
          )}
          {loginNotes && <div className="text-xs text-gray-400 mt-1">{loginNotes}</div>}
        </div>

        {!liveUrl ? (
          <button onClick={startActivation} disabled={starting} className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50" style={{ background: "#4F4EA5" }}>
            {starting ? <><Loader2 size={15} className="animate-spin" /> Opening browser…</> : <><Monitor size={15} /> Start activation</>}
          </button>
        ) : (
          <div className="space-y-2">
            <LiveView url={liveUrl} mock={mockBrowser} height={560} />
            <div className="flex justify-end">
              <button onClick={startActivation} disabled={starting} className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-50">
                {starting ? "Reconnecting…" : "Reconnect"}
              </button>
            </div>
          </div>
        )}
        {startErr && <p className="text-xs text-red-500 mt-2">{startErr}</p>}

        {/* Activation status control (always available — reset a stuck one without a browser) */}
        <div className="mt-4">
          <div className="text-xs font-semibold text-gray-500 mb-2">Set activation status</div>
          <div className="flex gap-1.5 flex-wrap">
            {ACTIVATION_STATES.map((s) => {
              const active = status === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => setActivation(s.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    active
                      ? "border-violet-500 bg-violet-50 text-violet-700"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {active && "✓ "}{s.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* OTP relay */}
      <div className="border-t border-gray-100 pt-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-3">
          <MessageSquare size={13} /> Step 2 — Get the verification code
        </div>
        <button onClick={requestCode} disabled={requesting || !hasPhone} className="w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border border-violet-300 text-violet-700 bg-violet-50 hover:bg-violet-100 disabled:opacity-50">
          {requesting ? <><Loader2 size={14} className="animate-spin" /> Texting customer…</> : <><MessageSquare size={14} /> Request code from customer</>}
        </button>
        {!hasPhone && <p className="text-xs text-amber-600 mt-2">Add a phone number above before requesting a code.</p>}

        {otpSent && (
          <div className="mt-3 space-y-2">
            {mockSms && (
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <AlertTriangle size={13} /> MOCK — no Twilio key set. No real text was sent.
              </div>
            )}

            {/* The exact message the customer received */}
            {sentBody && (
              <div className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-2">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-blue-500 mb-0.5">
                  {mockSms ? "Would text customer" : "Texted customer"}
                </div>
                <div className="text-xs text-gray-700 italic">&ldquo;{sentBody}&rdquo;</div>
              </div>
            )}

            {/* Detected code */}
            {code && (
              <div className="flex items-center justify-between bg-green-50 border-2 border-green-300 rounded-lg px-4 py-3">
                <div>
                  <div className="text-xs text-green-700 font-semibold">Code received</div>
                  <div className="text-2xl font-extrabold tracking-widest text-green-900 font-mono">{code}</div>
                </div>
                <button onClick={() => copy(code, "code")} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-green-300 text-green-700 text-xs font-semibold hover:bg-green-100">
                  {copiedId === "code" ? <><CheckCircle2 size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
                </button>
              </div>
            )}

            {/* Alternate candidates (ambiguous parse) */}
            {extraCandidates.length > 0 && (
              <div className="text-xs text-gray-500">
                <span className="mr-1">{code ? "Other numbers we saw:" : "Possible codes — pick one:"}</span>
                {extraCandidates.map((c) => (
                  <button key={c} onClick={() => copy(c, `cand-${c}`)} className="inline-flex items-center gap-1 mr-1.5 mb-1 px-2 py-1 rounded-md border border-gray-300 bg-white font-mono text-gray-800 hover:bg-gray-50">
                    {c} {copiedId === `cand-${c}` ? <CheckCircle2 size={11} className="text-green-600" /> : <Copy size={11} className="text-gray-400" />}
                  </button>
                ))}
              </div>
            )}

            {/* Waiting */}
            {!code && !replyBody && polling && (
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-3">
                <Loader2 size={14} className="animate-spin" /> Waiting for the customer&apos;s reply…
              </div>
            )}

            {/* Timed out waiting */}
            {!code && !replyBody && pollTimedOut && (
              <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-3">
                No reply yet. The customer may be away — try <button onClick={requestCode} className="text-violet-600 font-semibold hover:underline">resending the request</button>.
              </div>
            )}

            {/* Reply with no auto-detected code */}
            {!code && replyBody && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 mb-1.5">
                  <AlertTriangle size={12} /> Customer replied — couldn&apos;t auto-detect a code
                </div>
                <div className="flex items-center justify-between gap-2 bg-white border border-amber-200 rounded-md px-3 py-2">
                  <span className="text-sm text-gray-800 break-words">{replyBody}</span>
                  <button onClick={() => copy(replyBody, "raw")} className="shrink-0 flex items-center gap-1 text-xs text-amber-700 font-semibold hover:underline">
                    {copiedId === "raw" ? <CheckCircle2 size={12} /> : <Copy size={12} />} Copy
                  </button>
                </div>
                <p className="text-xs text-amber-600 mt-1.5">We&apos;ve asked them to resend just the digits. It&apos;ll update here automatically.</p>
              </div>
            )}

            {/* Always-available raw reply (when a code WAS detected, for verification) */}
            {code && replyBody && (
              <p className="text-xs text-gray-400">Full reply: &ldquo;{replyBody}&rdquo;</p>
            )}
          </div>
        )}
        {otpErr && <p className="text-xs text-red-500 mt-2">{otpErr}</p>}
      </div>

      {/* Case notes */}
      <div className="border-t border-gray-100 pt-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <StickyNote size={13} /> Case notes
          </div>
          {notesSaved && <span className="text-xs text-green-600 font-semibold">Saved ✓</span>}
        </div>
        <textarea
          value={notesVal}
          onChange={(e) => { setNotesVal(e.target.value); setNotesDirty(true); }}
          rows={3}
          placeholder="e.g. Left voicemail · wrong password, emailed them · awaiting callback…"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-y"
        />
        {notesDirty && (
          <button
            onClick={saveNotes}
            disabled={savingNotes}
            className="mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 flex items-center gap-1.5"
          >
            {savingNotes ? <><Loader2 size={12} className="animate-spin" /> Saving…</> : "Save notes"}
          </button>
        )}
      </div>
    </div>
  );
}
