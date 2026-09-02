import type { Metadata } from "next";
import { Inter_Tight, Instrument_Serif, JetBrains_Mono, Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

// Keep legacy vars for signup form components
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://notchup.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "NotchUp Slash — AI Bill Negotiation for Canadians",
    template: "%s | NotchUp Slash",
  },
  description:
    "Slash is an AI agent that logs into your Rogers, Bell or Telus account and negotiates your internet, mobile and TV bills down. $15/month, you keep 100% of the savings. 30-day money-back guarantee.",
  keywords: [
    "lower Rogers bill",
    "lower Bell bill",
    "lower Telus bill",
    "bill negotiation Canada",
    "reduce phone bill Canada",
    "reduce internet bill Canada",
    "negotiate Rogers bill",
    "Canadian bill negotiation",
    "AI bill negotiation",
    "save money on phone bill Canada",
  ],
  authors: [{ name: "NotchUp", url: "https://notchup.app" }],
  creator: "NotchUp",
  publisher: "NotchUp",
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: `${SITE_URL}/slash`,
    title: "Slash — the AI agent that lowers your bills",
    description: "Logs into your Rogers, Bell or Telus account, finds the overcharges, negotiates them down. $15/mo, you keep 100% of the savings. 30-day money back. Canada only.",
    siteName: "NotchUp Slash",
    images: [
      {
        url: "https://cdn.prod.website-files.com/663d33e48a497e68ec23fc06/6668a60722e01a019563454e_Open%20graph%20image.jpg",
        width: 1200,
        height: 630,
        alt: "NotchUp Slash — AI Bill Negotiation for Canadians",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Slash — the AI agent that lowers your bills",
    description: "Logs into your Rogers, Bell or Telus account, finds the overcharges, negotiates them down. $15/mo, you keep 100% of the savings. 30-day money back. Canada only.",
    images: ["https://cdn.prod.website-files.com/663d33e48a497e68ec23fc06/6668a60722e01a019563454e_Open%20graph%20image.jpg"],
    site: "@NotchUp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: `${SITE_URL}/slash`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-CA" className={`${interTight.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} ${montserrat.variable} ${openSans.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
