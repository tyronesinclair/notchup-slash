import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripe, manageToken } from "@/lib/stripe";

const PUBLIC_BASE = process.env.PUBLIC_BASE_URL ?? "https://notchup.app/slash";
let portalConfigId: string | null = null;

// Self-serve subscription management via the Stripe billing portal: cancel (at period
// end), update card, view invoices. Reached only via the HMAC-tokenized link we email
// to the subscriber — no login needed, no way to guess someone else's link.
export async function GET(req: NextRequest) {
  const email = String(req.nextUrl.searchParams.get("e") ?? "").trim().toLowerCase();
  const token = String(req.nextUrl.searchParams.get("t") ?? "");
  if (!email || token !== manageToken(email)) {
    return new NextResponse("This link is not valid.", { status: 403 });
  }

  const customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer?.stripeCustomerId) {
    return new NextResponse("No subscription found for this address.", { status: 404 });
  }

  try {
    if (!portalConfigId) {
      const existing = await stripe.billingPortal.configurations.list({ limit: 1, active: true });
      if (existing.data.length) {
        portalConfigId = existing.data[0].id;
      } else {
        const cfg = await stripe.billingPortal.configurations.create({
          business_profile: {
            privacy_policy_url: "https://www.notchup.app/privacy-policy",
            terms_of_service_url: "https://www.notchup.app/terms-of-services",
          },
          features: {
            subscription_cancel: { enabled: true, mode: "at_period_end" },
            payment_method_update: { enabled: true },
            invoice_history: { enabled: true },
          },
        });
        portalConfigId = cfg.id;
      }
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.stripeCustomerId,
      configuration: portalConfigId,
      return_url: PUBLIC_BASE,
    });
    return NextResponse.redirect(session.url, 302);
  } catch (err) {
    console.error("billing portal failed:", err);
    return new NextResponse(
      "Could not open your subscription page — email hello@notchup.app and we'll sort it.",
      { status: 500 }
    );
  }
}
