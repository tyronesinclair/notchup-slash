"use client";
import { useState } from "react";
import { Plus, Trash2, Wifi, Smartphone } from "lucide-react";
import { ServiceEntry } from "./SignUpForm";
import { nanoid } from "nanoid";

const PROVIDERS: Record<"internet" | "cell_phone", string[]> = {
  internet: ["Rogers", "Bell", "Telus", "Shaw", "Videotron", "Freedom Mobile", "Other"],
  cell_phone: ["Rogers", "Bell", "Telus", "Freedom Mobile", "Videotron", "Koodo", "Fido", "Virgin Plus", "Other"],
};

type Props = {
  initialServices: ServiceEntry[];
  onSubmit: (services: ServiceEntry[]) => void;
};

export default function ServicesStep({ initialServices, onSubmit }: Props) {
  const [services, setServices] = useState<ServiceEntry[]>(
    initialServices.length > 0
      ? initialServices
      : [{ id: nanoid(), serviceType: "internet", provider: "", username: "", password: "", accountNumber: "" }]
  );

  const addService = () =>
    setServices((prev) => [
      ...prev,
      { id: nanoid(), serviceType: "cell_phone", provider: "", username: "", password: "", accountNumber: "" },
    ]);

  const remove = (id: string) =>
    setServices((prev) => prev.filter((s) => s.id !== id));

  const update = (id: string, patch: Partial<ServiceEntry>) =>
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );

  const canSubmit = services.every((s) => s.serviceType && s.provider);

  return (
    <div>
      <h2 className="text-lg font-extrabold text-gray-900 mb-1" style={{ fontFamily: "var(--font-montserrat)" }}>
        Which services do you want to slash?
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Add each internet or cell phone plan you want us to negotiate. One $35 fee covers all of them.
      </p>

      <div className="space-y-4">
        {services.map((svc, idx) => (
          <div key={svc.id} className="rounded-xl border border-gray-200 p-5 relative">
            {/* Remove button */}
            {services.length > 1 && (
              <button
                onClick={() => remove(svc.id)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            )}

            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Service {idx + 1}
            </div>

            {/* Service type */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-2">Service type</label>
              <div className="grid grid-cols-2 gap-3">
                {(["internet", "cell_phone"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => update(svc.id, { serviceType: type, provider: "" })}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-semibold transition-all"
                    style={{
                      borderColor: svc.serviceType === type ? "#7F56D9" : "#EAECF0",
                      background: svc.serviceType === type ? "#F4EBFF" : "#fff",
                      color: svc.serviceType === type ? "#6941C6" : "#344054",
                    }}
                  >
                    {type === "internet" ? <Wifi size={16} /> : <Smartphone size={16} />}
                    {type === "internet" ? "Internet" : "Cell Phone"}
                  </button>
                ))}
              </div>
            </div>

            {/* Provider */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Provider</label>
              <select
                value={svc.provider}
                onChange={(e) => update(svc.id, { provider: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-notch-600"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <option value="">Select your provider…</option>
                {PROVIDERS[svc.serviceType].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
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

      <button
        disabled={!canSubmit}
        onClick={() => onSubmit(services)}
        className="mt-6 w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: "#4F4EA5", fontFamily: "var(--font-montserrat)" }}
      >
        Continue →
      </button>
    </div>
  );
}
