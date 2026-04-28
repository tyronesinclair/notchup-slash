"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import StepIndicator from "./StepIndicator";
import ServicesStep from "./ServicesStep";
import ContactStep from "./ContactStep";
import PaymentStep from "./PaymentStep";

export type ServiceEntry = {
  id: string;
  serviceType: "internet" | "cell_phone";
  provider: string;
  providerOther?: string;
};

export type FormData = {
  services: ServiceEntry[];
  name: string;
  email: string;
  phone: string;
  paymentType: "immediate" | "scheduled";
  scheduledDate: string;
};

const STEPS = ["Your Info", "Services", "Payment"];

export default function SignUpForm() {
  const pathname = usePathname();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    services: [],
    name: "",
    email: "",
    phone: "",
    paymentType: "immediate",
    scheduledDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  // track what intent type the current clientSecret was created for
  const [intentType, setIntentType] = useState<"immediate" | "scheduled">("immediate");

  const base = typeof window !== "undefined" ? window.location.pathname.replace(pathname, "") : "";

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const updateFormData = (patch: Partial<FormData>) =>
    setFormData((prev) => ({ ...prev, ...patch }));

  const handleContactNext = (contact: { name: string; email: string; phone: string }) => {
    updateFormData(contact);
    next();
  };

  const fetchIntent = async (email: string, type: "immediate" | "scheduled", date?: string) => {
    const res = await fetch(`${base}/api/stripe/create-payment-intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, paymentType: type, scheduledDate: date }),
    });
    return res.json();
  };

  const handleServicesSubmit = async (services: ServiceEntry[]) => {
    const updated = { ...formData, services };
    setFormData(updated);
    setIsSubmitting(true);

    try {
      sessionStorage.setItem("notchup_slash_form", JSON.stringify(updated));

      const data = await fetchIntent(updated.email, updated.paymentType, updated.scheduledDate);
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setIntentType(updated.paymentType);
        next();
      } else {
        alert("Payment setup failed. Please try again.");
      }
    } catch {
      alert("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentTypeChange = async (type: "immediate" | "scheduled", date?: string) => {
    updateFormData({ paymentType: type, scheduledDate: date ?? "" });

    // Re-create the Stripe intent if the type changed — mixing up intent types causes
    // confirmSetup vs confirmPayment to fail silently with an infinite spinner.
    if (type !== intentType) {
      setClientSecret(null); // show loading state in PaymentStep while re-fetching
      try {
        const data = await fetchIntent(formData.email, type, date);
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
          setIntentType(type);
        }
      } catch {
        // fall through — PaymentStep will show loading; user can go back
      }
    }
  };

  // Keep sessionStorage in sync when paymentType/date changes on the payment step
  useEffect(() => {
    if (step === 2) {
      const raw = sessionStorage.getItem("notchup_slash_form");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          sessionStorage.setItem(
            "notchup_slash_form",
            JSON.stringify({ ...parsed, paymentType: formData.paymentType, scheduledDate: formData.scheduledDate })
          );
        } catch {}
      }
    }
  }, [formData.paymentType, formData.scheduledDate, step]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <StepIndicator steps={STEPS} current={step} />
      <div className="p-6 md:p-8">
        {step === 0 && (
          <ContactStep
            initial={{ name: formData.name, email: formData.email, phone: formData.phone }}
            onNext={handleContactNext}
          />
        )}
        {step === 1 && (
          <ServicesStep
            initialServices={formData.services}
            onSubmit={handleServicesSubmit}
            onBack={back}
            isLoading={isSubmitting}
          />
        )}
        {step === 2 && (
          <PaymentStep
            formData={formData}
            clientSecret={clientSecret}
            onPaymentTypeChange={handlePaymentTypeChange}
            onBack={back}
          />
        )}
      </div>
    </div>
  );
}
