import { Metadata } from "next";
import SignUpForm from "@/components/signup/SignUpForm";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { ShieldCheck, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Get Started — NotchUp Slash",
  description: "Start saving on your Rogers, Bell & Telus bills. Takes 5 minutes.",
};

export default function SignUpPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Nav />
      <main className="flex-1 flex items-start justify-center py-10 px-4">
        <div className="w-full max-w-2xl">

          {/* Header */}
          <div className="text-center mb-6">
            {/* Urgency badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold mb-4 text-amber-800 bg-amber-50 border border-amber-200">
              <Clock size={12} />
              Currently 3–5 week queue · Join now to secure your spot
            </div>
            <h1
              className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              Slash your Rogers, Bell & Telus bills
            </h1>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Takes about 5 minutes. Our AI handles everything from there.
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
