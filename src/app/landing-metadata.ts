import { Metadata } from "next";

export const landingMetadata: Metadata = {
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
