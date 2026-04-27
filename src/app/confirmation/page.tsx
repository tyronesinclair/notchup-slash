"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Clock, Mail, ArrowRight } from "lucide-react";

function ConfirmationContent() {
  const params = useSearchParams();
  const scheduled = params.get("scheduled") === "true";
  const scheduledDate = params.get("date");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // After Stripe redirects back, call submit API to save to DB
    const paymentIntent = params.get("payment_intent");
    const setupIntent = params.get("setup_intent");
    const raw = sessionStorage.getItem("notchup_slash_form");
    if (!raw || submitted) return;

    try {
      const formData = JSON.parse(raw);
      setSubmitted(true);
      fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          stripePaymentIntentId: paymentIntent ?? setupIntent,
        }),
      }).catch(console.error);
      sessionStorage.removeItem("notchup_slash_form");
    } catch (e) {
      console.error(e);
    }
  }, [params, submitted]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ background: "linear-gradient(135deg, #F9F5FF 0%, #EDE9FE 100%)" }}>
      {/* Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12 max-w-lg w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: scheduled ? "#FEF3C7" : "#ECFDF3" }}>
          {scheduled
            ? <Clock size={36} className="text-amber-500" />
            : <CheckCircle size={36} className="text-green-500" />}
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900 mb-3"
          style={{ fontFamily: "var(--font-montserrat)" }}>
          {scheduled ? "You're on the list!" : "You're in! 🎉"}
        </h1>

        <p className="text-gray-500 mb-6 leading-relaxed">
          {scheduled
            ? `Your $35 activation fee is scheduled for ${scheduledDate ? new Date(scheduledDate + "T00:00:00").toLocaleDateString("en-CA", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "your chosen date"}. Your account is active and we'll start working on your file.`
            : "Your $35 activation fee was received. We've added you to our negotiation queue."}
        </p>

        {/* What happens next */}
        <div className="bg-gray-50 rounded-xl p-5 text-left mb-6 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">What happens next</p>
          {[
            { icon: <Mail size={16} />, text: "You'll get a confirmation email shortly" },
            { icon: <Clock size={16} />, text: "Our AI agents begin working in 3–5 weeks" },
            { icon: <CheckCircle size={16} />, text: "We email you a savings proposal to approve" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-sm text-gray-600">
              <div className="text-notch-600 shrink-0" style={{ color: "#7F56D9" }}>{icon}</div>
              {text}
            </div>
          ))}
        </div>

        {/* Guarantee reminder */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-xs text-green-800">
          <strong>Reminder:</strong> If we can't save you $100+/year or you reject our offer, your $35 is fully refunded.
        </div>

        <Link
          href="https://notchup.app"
          className="inline-flex items-center gap-2 text-sm font-bold hover:opacity-80 transition-opacity"
          style={{ color: "#4F4EA5" }}
        >
          Back to NotchUp <ArrowRight size={14} />
        </Link>
      </div>

      {/* NotchUp branding */}
      <div className="mt-8 text-center">
        <span className="text-base font-extrabold" style={{ fontFamily: "var(--font-montserrat)", color: "#4F4EA5" }}>
          NotchUp
        </span>
        <span className="text-base font-extrabold px-2 py-0.5 rounded ml-1"
          style={{ background: "#4F4EA5", color: "#fff", fontFamily: "var(--font-montserrat)" }}>
          Slash
        </span>
        <p className="text-xs text-gray-400 mt-1">AI-powered bill negotiation for Canadians 🇨🇦</p>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
