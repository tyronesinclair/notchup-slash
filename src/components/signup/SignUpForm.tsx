"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import StepIndicator from "./StepIndicator";
import ServicesStep from "./ServicesStep";
import ContactStep from "./ContactStep";
import PaymentStep from "./PaymentStep";

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
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  stripePriceId?: string;
  chargeConsent: boolean; // optional add-on card consent; never required to subscribe
};

const STEPS = ["Your Info", "Your Bills", "Subscribe"];
const STORAGE_KEY = "notchup_slash_form";

export default function SignUpForm() {
  const pathname = usePathname();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    services: [],
    name: "",
    email: "",
    paymentType: "subscription",
    chargeConsent: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  // Email the current clientSecret was issued for — lets Back → Continue reuse the same
  // incomplete subscription instead of minting a duplicate on the Stripe customer.
  const [secretEmail, setSecretEmail] = useState<string | null>(null);

  const base = typeof window !== "undefined" ? window.location.pathname.replace(pathname, "") : "";

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  // Everything the confirmation page needs survives the Stripe redirect via sessionStorage.
  const persist = (data: FormData) => {
    setFormData(data);
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
  };

  const handleContactNext = (contact: { name: string; email: string }) => {
    persist({ ...formData, ...contact });
    next();
  };

  const handleServicesSubmit = async (services: ServiceEntry[]) => {
    const updated = { ...formData, services };
    persist(updated);

    // Same email, subscription already created → just go to checkout.
    if (clientSecret && secretEmail === updated.email) {
      next();
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`${base}/api/stripe/create-subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: updated.email, name: updated.name, services: updated.services }),
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
        setSecretEmail(updated.email);
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

  const handleConsentChange = (chargeConsent: boolean) => {
    persist({ ...formData, chargeConsent });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <StepIndicator steps={STEPS} current={step} />
      <div className="p-6 md:p-8">
        {step === 0 && (
          <ContactStep
            initial={{ name: formData.name, email: formData.email }}
            onNext={handleContactNext}
          />
        )}
        {step === 1 && (
          <ServicesStep
            initialServices={formData.services}
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
            onConsentChange={handleConsentChange}
            onBack={back}
          />
        )}
      </div>
    </div>
  );
}
