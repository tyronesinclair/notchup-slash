"use client";
import { useState } from "react";
import { Eye, EyeOff, ShieldCheck, Wifi, Smartphone } from "lucide-react";
import { ServiceEntry } from "./SignUpForm";

type Props = {
  services: ServiceEntry[];
  onSubmit: (services: ServiceEntry[]) => void;
  onBack: () => void;
};

export default function CredentialsStep({ services, onSubmit, onBack }: Props) {
  const [entries, setEntries] = useState<ServiceEntry[]>(services);
  const [showPass, setShowPass] = useState<Record<string, boolean>>({});

  const update = (id: string, patch: Partial<ServiceEntry>) =>
    setEntries((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const canSubmit = entries.every((s) => s.username && s.password);

  return (
    <div>
      <h2 className="text-lg font-extrabold text-gray-900 mb-1" style={{ fontFamily: "var(--font-montserrat)" }}>
        Enter your account credentials
      </h2>
      <p className="text-sm text-gray-500 mb-3">
        We use these to log in to your provider portal and negotiate on your behalf. Your credentials are encrypted with AES-256.
      </p>

      {/* Security note */}
      <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
        <ShieldCheck size={18} className="text-green-600 shrink-0 mt-0.5" />
        <div className="text-xs text-green-800 leading-relaxed">
          <strong>Bank-grade encryption.</strong> Your credentials are encrypted before storage and only decrypted by our AI agents when actively negotiating. They are never visible to any human on our team or shared with third parties.
        </div>
      </div>

      <div className="space-y-6">
        {entries.map((svc) => (
          <div key={svc.id} className="rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                style={{ background: "#4F4EA5" }}>
                {svc.serviceType === "internet" ? <Wifi size={14} /> : <Smartphone size={14} />}
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900" style={{ fontFamily: "var(--font-montserrat)" }}>
                  {svc.provider}
                </div>
                <div className="text-xs text-gray-400">
                  {svc.serviceType === "internet" ? "Internet" : "Cell Phone"}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Online account username / email
                </label>
                <input
                  type="text"
                  autoComplete="off"
                  value={svc.username}
                  onChange={(e) => update(svc.id, { username: e.target.value })}
                  placeholder={`Your ${svc.provider} account username`}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2"
                  style={{ focusRingColor: "#7F56D9" } as React.CSSProperties}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPass[svc.id] ? "text" : "password"}
                    autoComplete="new-password"
                    value={svc.password}
                    onChange={(e) => update(svc.id, { password: e.target.value })}
                    placeholder="Your account password"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPass((p) => ({ ...p, [svc.id]: !p[svc.id] }))}
                  >
                    {showPass[svc.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Account number <span className="text-gray-400 font-normal">(optional, helps speed things up)</span>
                </label>
                <input
                  type="text"
                  value={svc.accountNumber}
                  onChange={(e) => update(svc.id, { accountNumber: e.target.value })}
                  placeholder="Found on your bill or in your account"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 rounded-xl font-semibold text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          disabled={!canSubmit}
          onClick={() => onSubmit(entries)}
          className="flex-[2] py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "#4F4EA5", fontFamily: "var(--font-montserrat)" }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
