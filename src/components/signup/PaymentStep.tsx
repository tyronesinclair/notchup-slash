"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Calendar, Zap, Loader2, ShieldCheck } from "lucide-react";
import { FormData } from "./SignUpForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type Props = {
  formData: FormData;
  clientSecret: string | null;
  onPaymentTypeChange: (type: "immediate" | "scheduled", date?: string) => void;
  onBack: () => void;
};

const PROVIDER_SAVINGS: Record<string, number> = {
  Rogers: 487,
  Bell: 462,
  Telus: 441,
  Videotron: 390,
  "Freedom Mobile": 320,
  Koodo: 310,
  Fido: 298,
  "Virgin Plus": 305,
};

function SavingsEstimate({ services }: { services: FormData["services"] }) {
  const providers = [...new Set(services.map((s) => s.provider))];
  const maxSavings = providers.reduce((max, p) => {
    const n = PROVIDER_SAVINGS[p] ?? 400;
    return n > max ? n : max;
  }, 400);
  const provider = providers[0] ?? "Canadians";
  const label = providers.length === 1 ? `${provider} customers` : "customers like you";
  return (
    <div className="mb-4 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
      <span className="text-green-600 text-lg shrink-0">💰</span>
      <p className="text-xs text-green-800 leading-snug">
        <strong>{label} save an average of ${maxSavings}/year</strong> — that&apos;s {Math.round(maxSavings / 35)}× your $35 back in the first year alone.
      </p>
    </div>
  );
}

function PaymentForm({
  formData,
  onPaymentTypeChange,
}: {
  formData: FormData;
  onPaymentTypeChange: Props["onPaymentTypeChange"];
}) {
  const stripe = useStripe();
  const elements = useElements();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<"immediate" | "scheduled">(formData.paymentType);
  const [scheduledDate, setScheduledDate] = useState(formData.scheduledDate);

  const handlePaymentTypeChange = (type: "immediate" | "scheduled") => {
    setPaymentType(type);
    onPaymentTypeChange(type, type === "immediate" ? undefined : scheduledDate);
  };

  const handleDateChange = (date: string) => {
    setScheduledDate(date);
    onPaymentTypeChange("scheduled", date);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsLoading(true);
    setError(null);

    const base = typeof window !== "undefined" ? window.location.pathname.replace(pathname, "") : "";
    const billingDetails = { name: formData.name, email: formData.email };

    try {
      if (paymentType === "immediate") {
        const { error } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}${base}/confirmation`,
            payment_method_data: { billing_details: billingDetails },
          },
        });
        if (error) setError(error.message ?? "Payment failed. Please try again.");
      } else {
        const { error } = await stripe.confirmSetup({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}${base}/confirmation?scheduled=true&date=${scheduledDate}`,
            payment_method_data: { billing_details: billingDetails },
          },
        });
        if (error) setError(error.message ?? "Setup failed. Please try again.");
      }
    } catch (err) {
      console.error("Payment submission error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 60);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-lg font-extrabold text-gray-900 mb-1" style={{ fontFamily: "var(--font-montserrat)" }}>
        Activation fee — $35 CAD
      </h2>
      <p className="text-sm text-gray-500 mb-5">
        One-time fee to start your negotiation.
      </p>

      {/* Savings estimate */}
      <SavingsEstimate services={formData.services} />

      {/* Payment type toggle */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-5">
        <button
          type="button"
          onClick={() => handlePaymentTypeChange("scheduled")}
          className="flex flex-col items-center gap-1.5 px-3 py-3.5 rounded-xl border text-sm font-semibold transition-all"
          style={{
            borderColor: paymentType === "scheduled" ? "#7F56D9" : "#EAECF0",
            background: paymentType === "scheduled" ? "#F4EBFF" : "#fff",
            color: paymentType === "scheduled" ? "#6941C6" : "#344054",
          }}
        >
          <Calendar size={18} />
          <span>Pay on Payday</span>
          <span className="text-xs font-normal opacity-70">Save card · charge later</span>
        </button>
        <button
          type="button"
          onClick={() => handlePaymentTypeChange("immediate")}
          className="flex flex-col items-center gap-1.5 px-3 py-3.5 rounded-xl border text-sm font-semibold transition-all"
          style={{
            borderColor: paymentType === "immediate" ? "#7F56D9" : "#EAECF0",
            background: paymentType === "immediate" ? "#F4EBFF" : "#fff",
            color: paymentType === "immediate" ? "#6941C6" : "#344054",
          }}
        >
          <Zap size={18} />
          <span>Pay Now</span>
          <span className="text-xs font-normal opacity-70">Charge immediately</span>
        </button>
      </div>

      {/* Scheduled date picker */}
      {paymentType === "scheduled" && (
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Choose your payday date
          </label>
          <input
            type="date"
            required
            min={minDate}
            max={maxDateStr}
            value={scheduledDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          <p className="text-xs text-gray-400 mt-1.5">
            We save your card today and charge on this date. Up to 60 days out.
          </p>
        </div>
      )}

      {/* Stripe Elements */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-gray-700 mb-2">Card details</label>
        <div className="rounded-lg border border-gray-300 p-3">
          <PaymentElement
            options={{
              layout: "tabs",
              fields: { billingDetails: { name: "never", email: "never" } },
            }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">Apple Pay &amp; Google Pay supported where available.</p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Guarantee — unmissable */}
      <div className="mb-5 rounded-xl border-2 border-green-300 bg-green-50 px-4 py-4 text-center">
        <div className="text-base font-extrabold text-green-800 mb-0.5" style={{ fontFamily: "var(--font-montserrat)" }}>
          You pay nothing if we can&apos;t save you $100+
        </div>
        <div className="text-xs text-green-700">
          Full $35 refunded. No questions asked. Zero risk.
        </div>
      </div>

      {/* Summary */}
      <div className="mb-5 bg-gray-50 rounded-xl p-4 text-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Activation fee</span>
          <span className="font-bold text-gray-900">$35.00 CAD</span>
        </div>
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>Commission (if savings found)</span>
          <span>40% of first-year savings</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || isLoading || (paymentType === "scheduled" && !scheduledDate)}
        className="w-full py-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: "#4F4EA5", fontFamily: "var(--font-montserrat)" }}
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Processing…
          </>
        ) : paymentType === "immediate" ? (
          "Pay $35 & Start Saving →"
        ) : (
          `Schedule $35 for ${scheduledDate || "your payday"} →`
        )}
      </button>

      <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-400">
        <ShieldCheck size={13} />
        <span>Secured by Stripe · Encrypted · Refundable</span>
      </div>
    </form>
  );
}

export default function PaymentStep({ formData, clientSecret, onPaymentTypeChange, onBack }: Props) {
  if (!clientSecret) {
    return (
      <div className="text-center py-12">
        <Loader2 size={24} className="animate-spin text-notch-600 mx-auto mb-3" />
        <p className="text-sm text-gray-500">Preparing your checkout…</p>
        <button onClick={onBack} className="mt-4 text-xs text-gray-400 underline">← Go back</button>
      </div>
    );
  }

  return (
    <Elements
      key={clientSecret}
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#7F56D9",
            colorBackground: "#ffffff",
            colorText: "#101828",
            colorDanger: "#df1b41",
            fontFamily: "Open Sans, sans-serif",
            borderRadius: "8px",
          },
        },
      }}
    >
      <div>
        <div className="mb-4">
          <button onClick={onBack} className="text-xs text-gray-400 hover:text-gray-600 underline">
            ← Back
          </button>
        </div>
        <PaymentForm formData={formData} onPaymentTypeChange={onPaymentTypeChange} />
      </div>
    </Elements>
  );
}
