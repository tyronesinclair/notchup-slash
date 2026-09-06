"use client";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import StepIndicator from "./StepIndicator";
import ServicesStep from "./ServicesStep";
import ContactStep from "./ContactStep";
import { getStripe } from "@/lib/stripe-client";
import { getVariant, getAttribution, type Attribution } from "@/lib/experiment";

// Code-split: Stripe Elements + Stripe.js only load once the user is heading to checkout.
const PaymentStep = dynamic(() => import("./PaymentStep"), {
  ssr: false,
  loading: () => <div className="py-16 text-center text-sm text-gray-400">Loading secure checkout…</div>,
});

export type ServiceEntry = {
  id: string;
  serviceType: "internet" | "cell_phone" | "tv" | "home_phone";
  provider: string;
  providerOther?: string;
};

export type FormData = {
  services: ServiceEntry[];
  name: string;
  email: string;
  paymentType: "subscription";
  payday?: string;            // YYYY-MM-DD — first $15 comes out that day ($0 today)
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  stripePriceId?: string;
  chargeConsent: boolean;     // card-on-file consent — disclosed at checkout, applies to every subscriber
  variant?: string | null;    // hero A/B arm the visitor saw (null if they never saw the landing)
  utm?: Attribution;          // first-touch UTMs (email blast attribution)
  leadId?: string;            // lead row created at the contact step (lifecycle emails)
};

const STEPS = ["Your Info", "Your Bills", "$0 today"];
const STORAGE_KEY = "notchup_slash_form";

export default function SignUpForm() {
  const pathname = usePathname();
  const params = useSearchParams();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    services: [],
    name: "",
    email: "",
    paymentType: "subscription",
    chargeConsent: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  // Email + payday the current clientSecret was issued for — lets Back → Continue reuse the
  // same trialing subscription instead of minting a duplicate on the Stripe customer.
  const [secretKey, setSecretKey] = useState<string | null>(null);

  const base = typeof window !== "undefined" ? window.location.pathname.replace(pathname, "") : "";

  // Resume link from a lifecycle email: prefill name + email from the lead row.
  useEffect(() => {
    const leadId = params.get("lead");
    if (!leadId) return;
    fetch(`${base}/api/lead/${encodeURIComponent(leadId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((lead: { name: string; email: string } | null) => {
        if (lead?.email) setFormData((f) => ({ ...f, name: f.name || lead.name, email: f.email || lead.email, leadId }));
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  // Everything the confirmation page needs survives the Stripe redirect via sessionStorage.
  const persist = (data: FormData) => {
    setFormData(data);
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
  };

  const handleContactNext = (contact: { name: string; email: string }) => {
    // Warm up checkout while they pick bills so step 3 is instant.
    import("./PaymentStep");
    getStripe();
    const variant = getVariant();
    const utm = getAttribution();
    persist({ ...formData, ...contact, variant, utm });
    // Lead capture → schedules the 30-min reminder + day-3 nurture (cancelled if they finish).
    fetch(`${base}/api/lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...contact, variant, utm }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { id?: string } | null) => { if (d?.id) persist({ ...formData, ...contact, variant, utm, leadId: d.id }); })
      .catch(() => {});
    next();
  };

  const handleServicesSubmit = async (services: ServiceEntry[], payday: string) => {
    const updated = { ...formData, services, payday };
    persist(updated);

    // Same email + payday, subscription already created → just go to checkout.
    const key = `${updated.email}|${payday}`;
    if (clientSecret && secretKey === key) {
      next();
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`${base}/api/stripe/create-subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: updated.email, name: updated.name, services: updated.services, payday }),
      });
      const data = await res.json();
      if (res.ok && data.clientSecret) {
        persist({
          ...updated,
          stripeSubscriptionId: data.subscriptionId,
          stripeCustomerId: data.customerId,
          stripePriceId: data.priceId,
        });
        setClientSecret(data.clientSecret);
        setSecretKey(key);
        next();
      } else {
        setSubmitError(data.error ?? "Checkout setup failed. Please try again.");
      }
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <StepIndicator steps={STEPS} current={step} />
      <div className="p-6 md:p-8">
        {step === 0 && (
          <ContactStep
            key={formData.email || "blank"}
            initial={{ name: formData.name, email: formData.email }}
            onNext={handleContactNext}
          />
        )}
        {step === 1 && (
          <ServicesStep
            initialServices={formData.services}
            initialPayday={formData.payday}
            onSubmit={handleServicesSubmit}
            onBack={back}
            isLoading={isSubmitting}
            error={submitError}
          />
        )}
        {step === 2 && (
          <PaymentStep
            formData={formData}
            clientSecret={clientSecret}
            onBack={back}
          />
        )}
      </div>
    </div>
  );
}
