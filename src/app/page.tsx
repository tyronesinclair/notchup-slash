import type { Metadata } from "next";
import Nav from "@/components/Nav";
import PageTracker from "@/components/PageTracker";
import JsonLd from "@/components/JsonLd";
import Hero from "@/components/landing/Hero";
import Providers from "@/components/landing/Providers";
import Problem from "@/components/landing/Problem";
import Bills from "@/components/landing/Bills";
import HowItWorks from "@/components/landing/HowItWorks";
import Calculator from "@/components/landing/Calculator";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import TrustSafety from "@/components/landing/TrustSafety";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  // `absolute` skips the layout's " | NotchUp Slash" template so the tag stays ~60 chars.
  title: { absolute: "Lower Your Rogers, Bell & Telus Bills — Slash AI Agent · $15/mo" },
  description:
    "Slash logs into your Canadian provider account, finds overcharges and negotiates your internet, mobile and TV bills down. $15/mo, keep 100%, 30-day refund.",
  keywords: [
    "lower Rogers bill", "negotiate Bell bill", "lower Telus bill", "bill negotiation Canada",
    "AI bill negotiation", "reduce internet bill Canada", "lower cell phone bill Canada",
    "Rogers retention offer", "Bell loyalty discount", "Telus retention deal",
  ],
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://notchup.app"}/slash`,
  },
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <JsonLd />
      <PageTracker event="page_view" assignVariant />
      <Nav />
      <main className="flex-1">
        <Hero />
        <Providers />
        <Problem />
        <Bills />
        <HowItWorks />
        <Calculator />
        <Testimonials />
        <Pricing />
        <TrustSafety />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
