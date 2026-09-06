"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe-client";
import { Loader2, ShieldCheck, CalendarCheck } from "lucide-react";
import { FormData } from "./SignUpForm";
import { paydayLong } from "@/lib/payday";

type Props = {
  formData: FormData;
  clientSecret: string | null;
  onBack: () => void;
};

function PaymentForm({ formData, onBack }: { formData: FormData; onBack: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const payday = formData.payday ? paydayLong(formData.payday) : "your next payday";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsLoading(true);
    setError(null);
    const base = typeof window !== "undefined" ? window.location.pathname.replace(pathname, "") : "";
    try {
      // Setup mode: saves the card against the trialing subscription. Nothing is charged now.
      const { error } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}${base}/confirmation?sub=true&payday=${encodeURIComponent(formData.payday ?? "")}`,
          payment_method_data: { billing_details: { name: formData.name, email: formData.email } },
        },
      });
      if (error) setError(error.message ?? "We couldn't save that card. Please try another.");
    } catch (err) {
      console.error("Subscription setup error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-lg font-extrabold text-gray-900 mb-1" style={{ fontFamily: "var(--font-montserrat)" }}>
        $0 today. $15 on your payday.
      </h2>
      <p className="text-sm text-gray-500 mb-5">
        Nothing is charged now. Your first $15 comes out on <strong className="text-gray-700">{payday}</strong>, then monthly. Cancel before then and you&apos;re never charged.
      </p>

      {/* Plan summary */}
      <div className="mb-5 bg-gray-50 rounded-xl p-4 text-sm">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-gray-700 font-medium">Due today</span>
          <span className="font-extrabold text-green-700">$0.00</span>
        </div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-gray-700 font-medium flex items-center gap-1.5 flex-wrap"><CalendarCheck size={14} className="text-violet-500" /> First payment · {payday} <button type="button" onClick={onBack} className="text-xs text-violet-600 underline font-semibold">change</button></span>
          <span className="font-bold text-gray-900">$15.00 CAD</span>
        </div>
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>Then $15/mo on the same day · cancel anytime</span>
        </div>
        <div className="flex justify-between items-center text-xs text-green-700 font-semibold mt-2 pt-2 border-t border-gray-200">
          <span>Our share of your savings</span>
          <span>$0 — you keep 100%</span>
        </div>
      </div>

      {/* Card */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-700 mb-2">Card to use on payday</label>
        <div className="rounded-lg border border-gray-300 p-3">
          <PaymentElement
            options={{
              layout: "tabs",
              fields: { billingDetails: { name: "never", email: "never" } },
              terms: { card: "never" }, // we render the mandate sentence ourselves, below
            }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">Apple Pay &amp; Google Pay supported where available. Debit cards work too.</p>
      </div>

      {/* Card-on-file consent — shown in full, applies to everyone. */}
      <p className="mb-4 text-xs text-gray-600 leading-snug">
        By providing your card information, you allow NotchUp to charge your card for future payments in accordance with their terms.
      </p>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{error}</div>
      )}

      {/* Guarantee */}
      <div className="mb-5 rounded-xl border-2 border-green-300 bg-green-50 px-4 py-4 text-center">
        <div className="text-base font-extrabold text-green-800 mb-0.5" style={{ fontFamily: "var(--font-montserrat)" }}>
          Not charged until {payday}
        </div>
        <div className="text-xs text-green-700">Cancel before then and you pay nothing. After that, 30-day money back, no questions asked.</div>
      </div>

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full py-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: "#4F4EA5", fontFamily: "var(--font-montserrat)" }}
      >
        {isLoading ? (<><Loader2 size={16} className="animate-spin" /> Saving your card…</>) : "Start Slash — $0 today →"}
      </button>

      {/* Required disclosure: auto-renewal + terms, right where the card is entered. */}
      <p className="text-[11px] text-gray-400 text-center mt-3 leading-snug">
        By subscribing you agree to NotchUp&apos;s{" "}
        <a href="https://www.notchup.app/terms-of-services" target="_blank" rel="noopener noreferrer" className="underline">Terms</a> and{" "}
        <a href="https://www.notchup.app/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline">Privacy Policy</a>.
        $0 today. $15.00 CAD on {payday}, then monthly until you cancel. Cancel anytime from your billing page.
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

export default function PaymentStep({ formData, clientSecret, onBack }: Props) {
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
        <PaymentForm formData={formData} onBack={onBack} />
      </div>
    </Elements>
  );
}
