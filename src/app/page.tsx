import type { Metadata } from "next";
import Nav from "@/components/Nav";
import PageTracker from "@/components/PageTracker";
import JsonLd from "@/components/JsonLd";
import Hero from "@/components/landing/Hero";

export const metadata: Metadata = {
  title: "Lower Your Rogers, Bell & Telus Bills by $487/yr — AI Negotiation",
  description:
    "NotchUp Slash uses AI to negotiate lower rates on your Rogers, Bell & Telus internet and phone bills. Average savings $487/yr. $35 flat fee — free if we can't save you $100+.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://notchup-slash-production.up.railway.app"}/slash`,
  },
};
import Providers from "@/components/landing/Providers";
import Problem from "@/components/landing/Problem";
import HowItWorks from "@/components/landing/HowItWorks";
import Calculator from "@/components/landing/Calculator";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <JsonLd />
      <PageTracker event="page_view" />
      <Nav />
      <main className="flex-1">
        <Hero />
        <Providers />
        <Problem />
        <HowItWorks />
        <Calculator />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
