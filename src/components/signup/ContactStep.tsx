"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";

type ContactData = { name: string; email: string };
type FieldError = { name?: string; email?: string };

type Props = {
  initial: ContactData;
  onNext: (data: ContactData) => void;
};

function validate(data: ContactData): FieldError {
  const errors: FieldError = {};
  if (!data.name.trim() || data.name.trim().length < 2) errors.name = "Please enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) errors.email = "Please enter a valid email address.";
  return errors;
}

export default function ContactStep({ initial, onNext }: Props) {
  const pathname = usePathname();
  const [data, setData] = useState<ContactData>(initial);
  const [errors, setErrors] = useState<FieldError>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const update = (k: keyof ContactData, v: string) => {
    const next = { ...data, [k]: v };
    setData(next);
    if (touched[k]) {
      const errs = validate(next);
      setErrors((prev) => ({ ...prev, [k]: errs[k] }));
    }
  };

  const blur = (k: keyof ContactData) => {
    setTouched((prev) => ({ ...prev, [k]: true }));
    const errs = validate(data);
    setErrors((prev) => ({ ...prev, [k]: errs[k] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(data);
    if (Object.keys(errs).length) {
      setErrors(errs);
      setTouched({ name: true, email: true });
      return;
    }
    const base = typeof window !== "undefined" ? window.location.pathname.replace(pathname, "") : "";
    fetch(`${base}/api/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "contact_submit" }),
    }).catch(() => {});
    onNext(data);
  };

  const fieldClass = (k: keyof ContactData) =>
    `w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400 transition-colors ${errors[k] && touched[k] ? "border-red-400 bg-red-50" : "border-gray-300"}`;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2 className="text-lg font-extrabold text-gray-900 mb-1" style={{ fontFamily: "var(--font-montserrat)" }}>
        Where should we send your savings?
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        We negotiate, you approve or reject. No calls, no hold music.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full name</label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => update("name", e.target.value)}
            onBlur={() => blur("name")}
            placeholder="Jane Smith"
            autoComplete="name"
            autoFocus
            className={fieldClass("name")}
          />
          {errors.name && touched.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email address</label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => update("email", e.target.value)}
            onBlur={() => blur("email")}
            placeholder="jane@email.com"
            autoComplete="email"
            className={fieldClass("email")}
          />
          {errors.email && touched.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>
      </div>

      <button
        type="submit"
        className="mt-6 w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
        style={{ background: "#4F4EA5", fontFamily: "var(--font-montserrat)" }}
      >
        Start Saving →
      </button>
    </form>
  );
}
