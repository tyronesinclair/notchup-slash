import type { Variant } from "@/lib/experiment";
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

export default function Landing({ variant = "a" }: { variant?: Variant }) {
  return (
    <div className="flex flex-col min-h-screen">
      <JsonLd />
      <PageTracker event="page_view" assignVariant />
      <Nav />
      <main className="flex-1">
        <Hero variant={variant} />
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
