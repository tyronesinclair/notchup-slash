const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://notchup.app";

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "NotchUp Slash",
  alternateName: "Slash by NotchUp",
  description:
    "AI-powered bill negotiation service for Canadians. We negotiate with Rogers, Bell, Telus, and other carriers to lower your internet and cell phone bills.",
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
  areaServed: {
    "@type": "Country",
    name: "Canada",
  },
  offers: {
    "@type": "Offer",
    price: "35",
    priceCurrency: "CAD",
    description: "One-time activation fee. Fully refunded if we can't save you $100+/year.",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is my login information actually safe?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Credentials are encrypted with bank-grade AES-256 in transit and at rest, scoped to a single negotiation, and rotated automatically when we're done. We never store unmasked credentials and we never share them with third parties.",
      },
    },
    {
      "@type": "Question",
      name: "What if you can't save me money?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "If we can't find at least $100/yr in savings within six months, the service is completely free — your $35 activation is refunded in full.",
      },
    },
    {
      "@type": "Question",
      name: "What if I don't like the savings offer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Reject it for any reason. Your $35 is refunded, no follow-ups.",
      },
    },
    {
      "@type": "Question",
      name: "How long does the process take?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most negotiations close in 3–5 weeks. Some are faster depending on the carrier's queue. You'll see status updates the whole way through.",
      },
    },
    {
      "@type": "Question",
      name: "Which providers do you negotiate?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Rogers, Bell, Telus, Freedom Mobile, Videotron, Fido, Koodo, Virgin Plus, and most regional Canadian carriers. We support both internet and mobile lines.",
      },
    },
    {
      "@type": "Question",
      name: "Can I add multiple services?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — add as many lines and services as you want under one $35 activation. We negotiate them in parallel.",
      },
    },
    {
      "@type": "Question",
      name: "Is this available across Canada?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, we serve every province and territory. NotchUp Slash is exclusive to NotchUp members.",
      },
    },
    {
      "@type": "Question",
      name: "What's the 40% success fee based on?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It's 40% of the savings we secure for the first 12 months only. Every dollar saved after month 12 is 100% yours, forever.",
      },
    },
  ],
};

export default function JsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
