"use client";
import { useState } from "react";
import { Plus, Trash2, Wifi, Smartphone, Loader2 } from "lucide-react";
import { ServiceEntry } from "./SignUpForm";
import { nanoid } from "nanoid";

const PROVIDERS: Record<"internet" | "cell_phone", string[]> = {
  internet: ["Rogers", "Bell", "Telus", "Videotron", "Freedom Mobile", "Other"],
  cell_phone: ["Rogers", "Bell", "Telus", "Freedom Mobile", "Videotron", "Koodo", "Fido", "Virgin Plus", "Other"],
};

type Props = {
  initialServices: ServiceEntry[];
  onSubmit: (services: ServiceEntry[]) => void;
  onBack: () => void;
  isLoading?: boolean;
};

export default function ServicesStep({ initialServices, onSubmit, onBack, isLoading }: Props) {
  const [services, setServices] = useState<ServiceEntry[]>(
    initialServices.length > 0
      ? initialServices
      : [{ id: nanoid(), serviceType: "internet", provider: "" }]
  );

  const addService = () =>
    setServices((prev) => [
      ...prev,
      { id: nanoid(), serviceType: "cell_phone", provider: "" },
    ]);

  const remove = (id: string) =>
    setServices((prev) => prev.filter((s) => s.id !== id));

  const update = (id: string, patch: Partial<ServiceEntry>) =>
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const canSubmit = services.every(
    (s) => s.serviceType && s.provider && (s.provider !== "Other" || !!s.providerOther?.trim())
  ) && !isLoading;
  const hasIncomplete = services.some((s) => !s.provider);

  return (
    <div>
      <h2 className="text-lg font-extrabold text-gray-900 mb-1" style={{ fontFamily: "var(--font-montserrat)" }}>
        Which services do you want to slash?
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Add each internet or cell phone plan. One $35 fee covers all of them.
      </p>

      <div className="space-y-4">
        {services.map((svc, idx) => (
          <div key={svc.id} className="rounded-xl border border-gray-200 p-5 relative">
            {services.length > 1 && (
              <button
                onClick={() => remove(svc.id)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                type="button"
                aria-label="Remove service"
              >
                <Trash2 size={16} />
              </button>
            )}

            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Service {idx + 1}
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-2">Service type</label>
              <div className="grid grid-cols-2 gap-3">
                {(["internet", "cell_phone"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => update(svc.id, { serviceType: type, provider: "" })}
                    className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg border text-sm font-semibold transition-all"
                    style={{
                      borderColor: svc.serviceType === type ? "#7F56D9" : "#EAECF0",
                      background: svc.serviceType === type ? "#F4EBFF" : "#fff",
                      color: svc.serviceType === type ? "#6941C6" : "#344054",
                    }}
                  >
                    {type === "internet" ? <Wifi size={16} className="shrink-0" /> : <Smartphone size={16} className="shrink-0" />}
                    {type === "internet" ? "Internet" : "Cell Phone"}
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
                {PROVIDERS[svc.serviceType].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
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

      <button
        type="button"
        onClick={addService}
        className="mt-4 flex items-center gap-2 text-sm font-semibold hover:opacity-80 transition-opacity"
        style={{ color: "#7F56D9" }}
      >
        <Plus size={16} /> Add another service
      </button>

      {hasIncomplete && (
        <p className="mt-3 text-xs text-amber-600">
          Please select a provider for each service to continue.
        </p>
      )}

      <div className="flex gap-3 mt-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3.5 rounded-xl font-semibold text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => onSubmit(services.map((s) =>
            s.provider === "Other" && s.providerOther?.trim()
              ? { ...s, provider: s.providerOther.trim() }
              : s
          ))}
          className="flex-[2] py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "#4F4EA5", fontFamily: "var(--font-montserrat)" }}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Preparing…
            </>
          ) : (
            "Continue to Payment →"
          )}
        </button>
      </div>
    </div>
  );
}
