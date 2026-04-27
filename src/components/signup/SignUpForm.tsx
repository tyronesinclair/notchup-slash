"use client";
import { useState } from "react";
import StepIndicator from "./StepIndicator";
import ServicesStep from "./ServicesStep";
import CredentialsStep from "./CredentialsStep";
import ContactStep from "./ContactStep";
import PaymentStep from "./PaymentStep";

export type ServiceEntry = {
  id: string;
  serviceType: "internet" | "cell_phone";
  provider: string;
  username: string;
  password: string;
  accountNumber: string;
};

export type FormData = {
  services: ServiceEntry[];
  name: string;
  email: string;
  phone: string;
  paymentType: "immediate" | "scheduled";
  scheduledDate: string;
};

const STEPS = ["Services", "Credentials", "Contact", "Payment"];

export default function SignUpForm() {
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

  const handleServicesSubmit = (services: ServiceEntry[]) => {
    updateFormData({ services });
    next();
  };

  const handleCredentialsSubmit = (services: ServiceEntry[]) => {
    updateFormData({ services });
    next();
  };

  const handleContactSubmit = async (contact: { name: string; email: string; phone: string }) => {
    const updatedForm = { ...formData, ...contact };
    setFormData(updatedForm);
    setIsSubmitting(true);
    try {
      // Persist to sessionStorage so the confirmation page can call /api/submit after Stripe redirects
      sessionStorage.setItem("notchup_slash_form", JSON.stringify(updatedForm));

      const base = typeof window !== "undefined" ? (window as any).__NEXT_DATA__?.basePath ?? "" : "";
      const res = await fetch(`${base}/api/stripe/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: contact.email,
          paymentType: updatedForm.paymentType,
          scheduledDate: updatedForm.scheduledDate,
        }),
      });
      const data = await res.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        next();
      } else {
        alert("Payment setup failed. Please try again.");
      }
    } catch (e) {
      console.error(e);
      alert("Payment setup failed. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <StepIndicator steps={STEPS} current={step} />
      <div className="p-6 md:p-8">
        {step === 0 && (
          <ServicesStep
            initialServices={formData.services}
            onSubmit={handleServicesSubmit}
          />
        )}
        {step === 1 && (
          <CredentialsStep
            services={formData.services}
            onSubmit={handleCredentialsSubmit}
            onBack={back}
          />
        )}
        {step === 2 && (
          <ContactStep
            initial={{ name: formData.name, email: formData.email, phone: formData.phone }}
            onSubmit={handleContactSubmit}
            onBack={back}
            isLoading={isSubmitting}
          />
        )}
        {step === 3 && (
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
