import { Metadata } from "next";
import { Suspense } from "react";
import SignUpForm from "@/components/signup/SignUpForm";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageTracker from "@/components/PageTracker";
import { ShieldCheck, Clock } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://notchup.app";

export const metadata: Metadata = {
  title: "Start Slash — $0 Today, Keep 100% of Your Savings",
  description:
    "Takes 2 minutes. Slash logs into your Rogers, Bell or Telus account and negotiates your internet, mobile and TV bills down. $0 today, then $15/month from your next payday. 0% of your savings, 30-day money-back guarantee.",
  alternates: {
    canonical: `${SITE_URL}/slash/sign-up`,
  },
  robots: { index: false, follow: true },
};

export default function SignUpPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <link rel="preconnect" href="https://js.stripe.com" />
      <PageTracker event="form_start" />
      <Nav hideSignUpCta />
      <main className="flex-1 flex items-start justify-center py-10 px-4">
        <div className="w-full max-w-2xl">

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold mb-4 text-violet-700 bg-violet-50 border border-violet-200">
              <Clock size={12} />
              About 5 minutes · Slash handles the rest
            </div>
            <h1
              className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              Put Slash on your bills
            </h1>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Add your bills, pick your next payday, and Slash negotiates with Rogers, Bell &amp; Telus on your behalf. $0 today, $15/mo from payday, and you keep 100% of the savings.
            </p>
          </div>

          <Suspense fallback={<div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-sm text-gray-400">Loading…</div>}>
            <SignUpForm />
          </Suspense>

          {/* Reassurance strip */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-green-500" />
              Keep 100% of your savings
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-green-500" />
              30-day money back, no questions asked
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-green-500" />
              Secured by Stripe
            </span>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
