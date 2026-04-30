import { Metadata } from "next";
import SignUpForm from "@/components/signup/SignUpForm";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageTracker from "@/components/PageTracker";
import { ShieldCheck, Clock } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://notchup.app";

export const metadata: Metadata = {
  title: "Get Started — Lower Your Rogers, Bell & Telus Bills",
  description:
    "Takes 2 minutes. Our AI negotiates with Rogers, Bell & Telus to cut your internet and phone bills. $35 activation — fully refunded if we can't save you $100+/year.",
  alternates: {
    canonical: `${SITE_URL}/slash/sign-up`,
  },
  robots: { index: false, follow: true },
};

export default function SignUpPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <PageTracker event="form_start" />
      <Nav hideSignUpCta />
      <main className="flex-1 flex items-start justify-center py-10 px-4">
        <div className="w-full max-w-2xl">

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold mb-4 text-violet-700 bg-violet-50 border border-violet-200">
              <Clock size={12} />
              Takes 2 minutes · We handle the rest
            </div>
            <h1
              className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              Start saving on your bills
            </h1>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Tell us your provider and add your card. Our AI negotiates with Rogers, Bell &amp; Telus on your behalf.
            </p>
          </div>

          <SignUpForm />

          {/* Reassurance strip */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-green-500" />
              You pay nothing if we can&apos;t save $100+
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-green-500" />
              $35 back if you reject the offer
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
