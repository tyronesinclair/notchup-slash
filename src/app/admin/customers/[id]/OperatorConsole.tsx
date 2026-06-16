"use client";
import { useState } from "react";
import { Phone, Pencil, Check, X, Monitor, Loader2, MessageSquare, AlertTriangle, HelpCircle, ExternalLink, StickyNote } from "lucide-react";
import { formatDisplay } from "@/lib/phone";
import LiveView from "../../LiveView";
import SmsChat from "./SmsChat";

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
  const [startUrl, setStartUrl] = useState(loginUrl ?? "");

  const startActivation = async () => {
    setStarting(true);
    setStartErr(null);
    try {
      const res = await fetch("/slash/api/admin/browser-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, startUrl }),
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

  const [resetting, setResetting] = useState(false);
  const resetBrowser = async () => {
    if (!confirm("Reset this customer's browser? Clears stored cookies/login state and starts fresh. Use this if you're stuck on an error like Rogers RC01.")) return;
    setResetting(true);
    try {
      await fetch("/slash/api/admin/reset-browser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      });
      setLiveUrl(null); // force a fresh Start
    } catch { /* ignore */ } finally { setResetting(false); }
  };

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

      {/* How it works */}
      <details className="group rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
        <summary className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-600 select-none">
          <HelpCircle size={13} /> How to activate this account
        </summary>
        <ol className="mt-3 space-y-1.5 text-xs text-gray-600 list-decimal list-inside">
          <li>Make sure a <strong>mobile number</strong> is on file (add it below if missing).</li>
          <li>Click <strong>Start activation</strong> — the remote browser opens on the {provider} login page automatically.</li>
          <li>Enter the credentials shown below (use the copy buttons).</li>
          <li>When {provider} asks for a code, click <strong>Request verification code</strong> in Step 2 (and message the customer if needed).</li>
          <li>Their reply and the parsed code appear in the conversation. Copy it into the browser, finish login, and check <em>&ldquo;trust this device.&rdquo;</em></li>
          <li>Set status to <strong>Activated</strong>. The session is saved for future negotiations.</li>
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

        {/* Where the browser opens — editable, defaults to the provider login page */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-500">Opens at ({provider} login)</span>
            {startUrl && (
              <a href={startUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:underline">
                Open in tab <ExternalLink size={11} />
              </a>
            )}
          </div>
          <input
            type="url"
            value={startUrl}
            onChange={(e) => setStartUrl(e.target.value)}
            placeholder="https://…  (provider login URL)"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          {!loginUrl && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 mt-1">
              <AlertTriangle size={12} /> No login URL on file for &ldquo;{provider}&rdquo; — paste one above or navigate in the browser.
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
            <div className="flex justify-end gap-3">
              <button onClick={resetBrowser} disabled={resetting} className="text-xs text-gray-400 hover:text-red-600 disabled:opacity-50">
                {resetting ? "Resetting…" : "Reset browser (clears cookies)"}
              </button>
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

      {/* Step 2 — verification code + two-way messaging */}
      <div className="border-t border-gray-100 pt-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-3">
          <MessageSquare size={13} /> Step 2 — Verification code &amp; messaging
        </div>
        <SmsChat customerId={customerId} hasPhone={hasPhone} />
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
