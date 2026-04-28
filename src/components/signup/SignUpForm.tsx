"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import StepIndicator from "./StepIndicator";
import ServicesStep from "./ServicesStep";
import ContactStep from "./ContactStep";
import PaymentStep from "./PaymentStep";

export type ServiceEntry = {
  id: string;
  serviceType: "internet" | "cell_phone";
  provider: string;
};

export type FormData = {
  services: ServiceEntry[];
  name: string;
  email: string;
  phone: string;
  paymentType: "immediate" | "scheduled";
  scheduledDate: string;
};

const STEPS = ["Your Info", "Services", "Activate"];

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

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const updateFormData = (patch: Partial<FormData>) =>
    setFormData((prev) => ({ ...prev, ...patch }));

  const handleContactNext = (contact: { name: string; email: string; phone: string }) => {
    updateFormData(contact);
    next();
  };

  const handleServicesSubmit = async (services: ServiceEntry[]) => {
    const updated = { ...formData, services };
    setFormData(updated);
    setIsSubmitting(true);

    try {
      sessionStorage.setItem("notchup_slash_form", JSON.stringify(updated));

      const base = typeof window !== "undefined" ? window.location.pathname.replace(pathname, "") : "";
      const res = await fetch(`${base}/api/stripe/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: updated.email,
          paymentType: updated.paymentType,
          scheduledDate: updated.scheduledDate,
        }),
      });
      const data = await res.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
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
            onPaymentTypeChange={(type, date) =>
              updateFormData({ paymentType: type, scheduledDate: date ?? "" })
            }
            onBack={back}
          />
        )}
      </div>
    </div>
  );
}
