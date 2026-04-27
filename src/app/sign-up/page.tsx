import { Metadata } from "next";
import SignUpForm from "@/components/signup/SignUpForm";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Sign Up — NotchUp Slash",
  description: "Start saving on your Rogers, Bell & Telus bills. Takes 5 minutes.",
};

export default function SignUpPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Nav />
      <main className="flex-1 flex items-start justify-center py-12 px-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1
              className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              Start slashing your bills
            </h1>
            <p className="text-gray-500 text-sm">
              Takes about 5 minutes. We handle everything from here.
            </p>
          </div>
          <SignUpForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
