import { faqItems } from "@/components/landing/FAQ";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://notchup.app";

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "NotchUp Slash",
  alternateName: "Slash by NotchUp",
  serviceType: "AI bill negotiation",
  description:
    "Slash is an AI agent that logs into your Canadian provider account, finds overcharges, and negotiates your internet, mobile, TV and home phone bills down with Rogers, Bell, Telus and other carriers. Flat $15/month, customers keep 100% of the savings.",
  url: `${SITE_URL}/slash`,
  provider: {
    "@type": "Organization",
    name: "NotchUp",
    url: "https://notchup.app",
    logo: "https://cdn.prod.website-files.com/663d33e48a497e68ec23fc06/66427492c358294cac47f56b_NU%201B.png",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-778-400-5126",
      contactType: "customer service",
      email: "hello@notchup.app",
      areaServed: "CA",
      availableLanguage: "English",
    },
  },
  areaServed: { "@type": "Country", name: "Canada" },
  offers: {
    "@type": "Offer",
    price: "15",
    priceCurrency: "CAD",
    description: "$15/month subscription. Unlimited bills, 0% of savings kept, cancel anytime. 30-day money-back guarantee.",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: "15",
      priceCurrency: "CAD",
      billingIncrement: 1,
      unitCode: "MON",
    },
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((it) => ({
    "@type": "Question",
    name: it.q,
    acceptedAnswer: { "@type": "Answer", text: it.a },
  })),
};

export default function JsonLd() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </>
  );
}
