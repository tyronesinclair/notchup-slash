"use client";
import { useState } from "react";
import { Plus, Trash2, Wifi, Smartphone, Tv, Phone, Loader2, CalendarDays } from "lucide-react";
import { paydayBounds, paydayChips, paydayShort } from "@/lib/payday";
import { ServiceEntry } from "./SignUpForm";
import { nanoid } from "nanoid";

type BillType = ServiceEntry["serviceType"];

const TYPES: { key: BillType; label: string; Icon: typeof Wifi }[] = [
  { key: "internet", label: "Internet", Icon: Wifi },
  { key: "cell_phone", label: "Mobile", Icon: Smartphone },
  { key: "tv", label: "TV / Cable", Icon: Tv },
  { key: "home_phone", label: "Home phone", Icon: Phone },
];

const PROVIDERS: Record<BillType, string[]> = {
  internet: ["Rogers", "Bell", "Telus", "Shaw", "Videotron", "Cogeco", "Eastlink", "Freedom Mobile", "Other"],
  cell_phone: ["Rogers", "Bell", "Telus", "Freedom Mobile", "Videotron", "Koodo", "Fido", "Virgin Plus", "Other"],
  tv: ["Rogers", "Bell", "Telus", "Shaw", "Videotron", "Cogeco", "Eastlink", "Other"],
  home_phone: ["Rogers", "Bell", "Telus", "Shaw", "Videotron", "Cogeco", "Eastlink", "Other"],
};

type Props = {
  initialServices: ServiceEntry[];
  initialPayday?: string;
  onSubmit: (services: ServiceEntry[], payday: string) => void;
  onBack: () => void;
  isLoading?: boolean;
  error?: string | null;
};

export default function ServicesStep({ initialServices, initialPayday, onSubmit, onBack, isLoading, error }: Props) {
  const bounds = paydayBounds();
  const chips = paydayChips();
  // Pre-select the soonest common payday so the button is never blocked; one tap changes it.
  const [payday, setPayday] = useState<string>(initialPayday ?? chips[0]?.iso ?? "");
  const [services, setServices] = useState<ServiceEntry[]>(
    initialServices.length > 0 ? initialServices : [{ id: nanoid(), serviceType: "internet", provider: "" }]
  );
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const paydayMissing = submitAttempted && !payday;

  const addService = () =>
    setServices((prev) => [...prev, { id: nanoid(), serviceType: "cell_phone", provider: "" }]);
  const remove = (id: string) => setServices((prev) => prev.filter((s) => s.id !== id));
  const update = (id: string, patch: Partial<ServiceEntry>) =>
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const canSubmit =
    services.every((s) => s.serviceType && s.provider && (s.provider !== "Other" || !!s.providerOther?.trim())) && !isLoading;
  const hasIncomplete = submitAttempted && services.some((s) => !s.provider);

  return (
    <div>
      <h2 className="text-lg font-extrabold text-gray-900 mb-1" style={{ fontFamily: "var(--font-montserrat)" }}>
        Which bills should Slash work on?
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Add every bill you want lowered. We negotiate them one at a time so each gets our full attention — all included. $0 today — your first $15 comes out on the payday you pick below.
      </p>

      <div className="space-y-4">
        {services.map((svc, idx) => (
          <div key={svc.id} className="rounded-xl border border-gray-200 p-5 relative">
            {services.length > 1 && (
              <button onClick={() => remove(svc.id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors" type="button" aria-label="Remove bill">
                <Trash2 size={16} />
              </button>
            )}
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Bill {idx + 1}{idx === 0 && services.length > 1 ? " · we start here" : ""}
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-2">Type of bill</label>
              <div className="grid grid-cols-2 gap-2.5">
                {TYPES.map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => update(svc.id, { serviceType: key, provider: "", providerOther: "" })}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-semibold transition-all"
                    style={{
                      borderColor: svc.serviceType === key ? "#7F56D9" : "#EAECF0",
                      background: svc.serviceType === key ? "#F4EBFF" : "#fff",
                      color: svc.serviceType === key ? "#6941C6" : "#344054",
                    }}
                  >
                    <Icon size={15} className="shrink-0" /> {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Provider</label>
              <select
                value={svc.provider}
                onChange={(e) => update(svc.id, { provider: e.target.value, providerOther: "" })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                <option value="">Select your provider…</option>
                {PROVIDERS[svc.serviceType].map((p) => (<option key={p} value={p}>{p}</option>))}
              </select>
              {svc.provider === "Other" && (
                <input
                  type="text"
                  value={svc.providerOther ?? ""}
                  onChange={(e) => update(svc.id, { providerOther: e.target.value })}
                  placeholder="Enter your provider name"
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={addService} className="mt-4 flex items-center gap-2 text-sm font-semibold hover:opacity-80 transition-opacity" style={{ color: "#7F56D9" }}>
        <Plus size={16} /> Add another bill
      </button>
      {services.length === 1 && (
        <p className="mt-2 text-xs text-gray-400">Internet, mobile, TV, home phone — add them all. One subscription covers every bill.</p>
      )}

      {hasIncomplete && <p className="mt-3 text-xs text-amber-600">Please select a provider for each bill to continue.</p>}
      {/* Payday: nothing is charged today; the first $15 lands on this date. */}
      <div className={`mt-6 rounded-xl border p-5 ${paydayMissing ? "border-red-300 bg-red-50/40" : "border-violet-200 bg-violet-50/40"}`}>
        <div className="flex items-center gap-2 mb-1">
          <CalendarDays size={16} className="text-violet-600" />
          <h3 className="text-sm font-extrabold text-gray-900" style={{ fontFamily: "var(--font-montserrat)" }}>When&apos;s your next payday?</h3>
        </div>
        <p className="text-xs text-gray-500 mb-3">$0 today. Your first $15 comes out on this date, then monthly on the same day. Cancel before then and you&apos;re never charged.</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {chips.map((c) => (
            <button key={c.iso} type="button" onClick={() => setPayday(c.iso)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${payday === c.iso ? "bg-violet-600 text-white border-violet-600" : "bg-white text-gray-700 border-gray-300 hover:border-violet-400"}`}>
              {c.label} <span className={payday === c.iso ? "text-violet-100" : "text-gray-400"}>· {paydayShort(c.iso)}</span>
            </button>
          ))}
        </div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Or pick the exact date</label>
        <input type="date" value={payday} min={bounds.min} max={bounds.max} onChange={(e) => setPayday(e.target.value)}
          className="w-full sm:w-auto rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400" />
        {paydayMissing && <p className="text-xs text-red-500 mt-2">Pick your next payday so we know when to start.</p>}
        {payday && <p className="text-xs text-green-700 font-semibold mt-2">✓ First $15 on {paydayShort(payday)}. Nothing today.</p>}
      </div>

      {error && <div className="mt-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{error}</div>}

      <div className="flex gap-3 mt-3">
        <button type="button" onClick={onBack} className="flex-1 py-3.5 rounded-xl font-semibold text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
          ← Back
        </button>
        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => {
            setSubmitAttempted(true);
            if (!canSubmit) return;
            if (!payday) return;
            onSubmit(services.map((s) => (s.provider === "Other" && s.providerOther?.trim() ? { ...s, provider: s.providerOther.trim() } : s)), payday);
          }}
          className="flex-[2] py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "#4F4EA5", fontFamily: "var(--font-montserrat)" }}
        >
          {isLoading ? (<><Loader2 size={16} className="animate-spin" /> Preparing…</>) : "Continue to checkout →"}
        </button>
      </div>
    </div>
  );
}
