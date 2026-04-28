import { Metadata } from "next";
import SignUpForm from "@/components/signup/SignUpForm";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageTracker from "@/components/PageTracker";
import { ShieldCheck, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Get Started — Lower Your Rogers, Bell & Telus Bills",
  description:
    "Takes 5 minutes. Our AI negotiates with Rogers, Bell & Telus to cut your internet and phone bills. $35 activation — fully refunded if we can't save you $100+/year.",
  robots: { index: true, follow: false },
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold mb-4 text-amber-800 bg-amber-50 border border-amber-200">
              <Clock size={12} />
              3–5 week queue · Secure your spot now
            </div>
            <h1
              className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              Get started in 5 minutes
            </h1>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Tell us your provider, add your card. We handle the rest — or you pay nothing.
            </p>
          </div>

          <SignUpForm />

          {/* Reassurance strip */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-green-500" />
              AES-256 encrypted credentials
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-green-500" />
              Free if we can't save $100+/year
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-green-500" />
              $35 back if you reject the offer
            </span>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
