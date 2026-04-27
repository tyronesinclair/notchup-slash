import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "NotchUp Slash — Stop Overpaying on Rogers, Bell & Telus",
  description:
    "Canada's first AI-powered bill negotiation service. We fight for better rates on your internet and cell phone bills — or your money back.",
  openGraph: {
    title: "NotchUp Slash",
    description: "Save $100+ per year on your Canadian phone and internet bills. AI-powered negotiation. $35 to start.",
    siteName: "NotchUp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${openSans.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
