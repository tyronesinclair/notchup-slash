"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";

type ContactData = { name: string; email: string; phone: string };

type Props = {
  initial: ContactData;
  onSubmit: (data: ContactData) => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
};

export default function ContactStep({ initial, onSubmit, onBack, isLoading }: Props) {
  const [data, setData] = useState<ContactData>(initial);

  const update = (k: keyof ContactData, v: string) => setData((p) => ({ ...p, [k]: v }));
  const canSubmit = data.name.trim() && data.email.trim() && data.phone.trim() && !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-lg font-extrabold text-gray-900 mb-1" style={{ fontFamily: "var(--font-montserrat)" }}>
        Your contact details
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        We'll email you when our AI agents start working on your file and when we have a savings proposal.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full name</label>
          <input
            type="text"
            required
            value={data.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Jane Smith"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email address</label>
          <input
            type="email"
            required
            value={data.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="jane@email.com"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone number</label>
          <input
            type="tel"
            required
            value={data.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="+1 (416) 555-0123"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3.5 rounded-xl font-semibold text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="flex-[2] py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "#4F4EA5", fontFamily: "var(--font-montserrat)" }}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Preparing payment…
            </>
          ) : (
            "Continue to Payment →"
          )}
        </button>
      </div>
    </form>
  );
}
