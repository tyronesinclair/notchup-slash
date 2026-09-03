"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe-client";
import { Loader2, ShieldCheck, RotateCcw } from "lucide-react";
import { FormData } from "./SignUpForm";

type Props = {
  formData: FormData;
  clientSecret: string | null;
  onConsentChange: (consent: boolean) => void;
  onBack: () => void;
};

function PaymentForm({ formData, onConsentChange }: { formData: FormData; onConsentChange: Props["onConsentChange"] }) {
  const stripe = useStripe();
  const elements = useElements();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Optional: keep the card on file for other NotchUp services. NOT required to subscribe.
  const [addOnConsent, setAddOnConsent] = useState(formData.chargeConsent);

  const toggleAddOn = (v: boolean) => {
    setAddOnConsent(v);
    onConsentChange(v);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsLoading(true);
    setError(null);
    const base = typeof window !== "undefined" ? window.location.pathname.replace(pathname, "") : "";
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}${base}/confirmation?sub=true`,
          payment_method_data: { billing_details: { name: formData.name, email: formData.email } },
        },
      });
      if (error) setError(error.message ?? "Payment failed. Please try again.");
    } catch (err) {
      console.error("Subscription confirm error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-lg font-extrabold text-gray-900 mb-1" style={{ fontFamily: "var(--font-montserrat)" }}>
        Slash — $15/month
      </h2>
      <p className="text-sm text-gray-500 mb-5">
        Keep 100% of what we save you. Cancel anytime. 30-day money-back guarantee, no questions asked.
      </p>

      {/* One disclaimed estimate — no invented per-provider figures. */}
      <div className="mb-4 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <span className="text-green-600 text-lg shrink-0">💰</span>
        <p className="text-xs text-green-800 leading-snug">
          <strong>Typical Canadian households save an estimated $487/year</strong> on phone, internet and TV — and every dollar is yours. Slash is $15/mo, 0% of your savings.
        </p>
      </div>

      {/* Plan summary */}
      <div className="mb-5 bg-gray-50 rounded-xl p-4 text-sm">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-gray-700 font-medium">Slash monthly subscription</span>
          <span className="font-bold text-gray-900">$15.00 CAD</span>
        </div>
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>Renews monthly until you cancel</span>
          <span>Charged today</span>
        </div>
        <div className="flex justify-between items-center text-xs text-green-700 font-semibold mt-2 pt-2 border-t border-gray-200">
          <span>Our share of your savings</span>
          <span>$0 — you keep 100%</span>
        </div>
      </div>

      {/* Card */}
      <div className="mb-4">
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

      {/* Optional, separate, unchecked by default — not bundled with the subscription. */}
      <label className="mb-4 flex items-start gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 cursor-pointer">
        <input
          type="checkbox"
          checked={addOnConsent}
          onChange={(e) => toggleAddOn(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-violet-600 shrink-0"
        />
        <span className="text-xs text-gray-600 leading-snug">
          <span className="font-semibold text-gray-700">Optional:</span> also keep my card on file for other NotchUp services I choose to add later. I&apos;ll always be asked before anything else is charged, and I can remove it anytime.
        </span>
      </label>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{error}</div>
      )}

      {/* Guarantee */}
      <div className="mb-5 rounded-xl border-2 border-green-300 bg-green-50 px-4 py-4 text-center">
        <div className="flex items-center justify-center gap-2 text-base font-extrabold text-green-800 mb-0.5" style={{ fontFamily: "var(--font-montserrat)" }}>
          <RotateCcw size={16} /> 30-day money-back guarantee
        </div>
        <div className="text-xs text-green-700">Not for you? Full refund within 30 days. No questions asked.</div>
      </div>

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full py-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: "#4F4EA5", fontFamily: "var(--font-montserrat)" }}
      >
        {isLoading ? (<><Loader2 size={16} className="animate-spin" /> Processing…</>) : "Start Slash — $15/mo →"}
      </button>

      {/* Required disclosure: auto-renewal + terms, right where the card is entered. */}
      <p className="text-[11px] text-gray-400 text-center mt-3 leading-snug">
        By subscribing you agree to NotchUp&apos;s{" "}
        <a href="https://www.notchup.app/terms-of-services" target="_blank" rel="noopener noreferrer" className="underline">Terms</a> and{" "}
        <a href="https://www.notchup.app/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline">Privacy Policy</a>.
        $15.00 CAD renews monthly until you cancel. Cancel anytime from your billing page.
      </p>
      <p className="text-[11px] text-gray-400 text-center mt-2 leading-snug">
        <strong className="text-gray-500">Next:</strong> you&apos;ll add your provider login and mobile number. Providers text a one-time sign-in code — we&apos;ll ask you to pass it along.
      </p>

      <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-400">
        <ShieldCheck size={13} />
        <span>Secured by Stripe · Encrypted · Cancel anytime</span>
      </div>
    </form>
  );
}

export default function PaymentStep({ formData, clientSecret, onConsentChange, onBack }: Props) {
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
      stripe={getStripe()}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#7F56D9", colorBackground: "#ffffff", colorText: "#101828",
            colorDanger: "#df1b41", fontFamily: "Open Sans, sans-serif", borderRadius: "8px",
          },
        },
      }}
    >
      <div>
        <div className="mb-4">
          <button onClick={onBack} className="text-xs text-gray-400 hover:text-gray-600 underline">← Back</button>
        </div>
        <PaymentForm formData={formData} onConsentChange={onConsentChange} />
      </div>
    </Elements>
  );
}
