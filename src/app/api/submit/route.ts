import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripe, SUB_AMOUNT, manageUrl } from "@/lib/stripe";
import { sendConfirmationEmail } from "@/lib/email";
import { normalizeE164 } from "@/lib/phone";
import { cancelScheduled } from "@/lib/slash-emails";
import { trialEndToPayday } from "@/lib/payday";

export async function POST(req: NextRequest) {
  try {
    const {
      name,
      email: rawEmail,
      phone = "",
      services,
      paymentType,
      scheduledDate,
      stripePaymentIntentId,
      stripeSubscriptionId,
      stripeCustomerId: bodyStripeCustomerId,
      stripePriceId,
      chargeConsent,
      variant,
      utm,
    } = await req.json();
    // Stripe and /api/lead lowercase emails; the form may not. One canonical form everywhere.
    const email = String(rawEmail ?? "").trim().toLowerCase();

    if (!name || !email || !services?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const isSubscription = paymentType === "subscription";

    // Legacy scheduled flow: pull the saved payment method from the SetupIntent now,
    // because the webhook can fire before this page loads.
    let stripePaymentMethodId: string | null = null;
    let stripeCustomerId: string | null = bodyStripeCustomerId ?? null;
    if (!isSubscription && paymentType === "scheduled" && stripePaymentIntentId) {
      try {
        const si = await stripe.setupIntents.retrieve(stripePaymentIntentId);
        stripePaymentMethodId = (si.payment_method as string) ?? null;
        stripeCustomerId = (si.customer as string) ?? null;
      } catch (e) {
        console.error("Could not retrieve setup intent:", e);
      }
    }

    // Subscription flow: check Stripe right now in case invoice.paid already fired
    // before this row existed (closes the webhook race).
    let subscriptionStatus: string | null = null;
    let payday: string | null = null; // YYYY-MM-DD — the trial end = first $15
    if (isSubscription && stripeSubscriptionId) {
      try {
        const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        subscriptionStatus = sub.status; // trialing | active | incomplete | past_due | ...
        if (sub.trial_end) payday = trialEndToPayday(sub.trial_end);
        if (!stripeCustomerId) stripeCustomerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      } catch (e) {
        console.error("Could not retrieve subscription:", e);
        subscriptionStatus = "incomplete";
      }
    }
    const subActive = subscriptionStatus === "active";
    const subTrialing = subscriptionStatus === "trialing";

    const normalizedPhone = normalizeE164(phone);
    const consent = !!chargeConsent;
    // A/B arm + first-touch UTMs (email-blast attribution). Strings only, capped.
    const s = (v: unknown, n = 120) => (typeof v === "string" && v ? v.slice(0, n) : null);
    const attribution = {
      ...(s(variant, 8) && { variant: s(variant, 8) }),
      ...(s(utm?.utm_source) && { utmSource: s(utm?.utm_source) }),
      ...(s(utm?.utm_medium) && { utmMedium: s(utm?.utm_medium) }),
      ...(s(utm?.utm_campaign) && { utmCampaign: s(utm?.utm_campaign) }),
    };

    const customer = await prisma.customer.upsert({
      where: { email },
      update: {
        name,
        ...(normalizedPhone && { phone: normalizedPhone }),
        ...(stripeCustomerId && { stripeCustomerId }),
        ...attribution,
        ...(consent && { chargeConsent: true, chargeConsentAt: new Date() }),
      },
      create: {
        name,
        email,
        phone: normalizedPhone ?? "",
        stripeCustomerId: stripeCustomerId ?? undefined,
        chargeConsent: consent,
        chargeConsentAt: consent ? new Date() : undefined,
        ...attribution,
      },
    });

    // Service records — credentials are collected post-payment via /api/credentials.
    for (const svc of services) {
      const existing = await prisma.service.findFirst({
        where: { customerId: customer.id, provider: svc.provider, serviceType: svc.serviceType },
      });
      if (!existing) {
        await prisma.service.create({
          data: {
            customerId: customer.id,
            serviceType: svc.serviceType,
            provider: svc.provider,
            encryptedCredentials: "",
          },
        });
      }
    }

    const paymentData = isSubscription
      ? {
          paymentType: "subscription",
          amount: SUB_AMOUNT,
          stripeSubscriptionId: stripeSubscriptionId ?? null,
          stripePriceId: stripePriceId ?? null,
          subscriptionStatus: subActive ? "active" : (subscriptionStatus ?? "incomplete"),
          // trialing = card saved, $0 today, first $15 on payday → "scheduled" so the admin
          // payday queue and the cron pick it up; invoice.paid flips it to paid/active.
          status: subActive ? "paid" : subTrialing ? "scheduled" : "pending",
          paidAt: subActive ? new Date() : null,
          scheduledDate: payday ? new Date(payday + "T14:00:00Z") : null,
          stripePaymentIntentId: null,
          stripePaymentMethodId: null,
        }
      : {
          paymentType,
          scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
          stripePaymentIntentId: stripePaymentIntentId ?? null,
          stripePaymentMethodId,
          status: paymentType === "scheduled" ? "scheduled" : "paid",
          paidAt: paymentType === "immediate" ? new Date() : null,
        };

    await prisma.payment.upsert({
      where: { customerId: customer.id },
      update: paymentData,
      create: { customerId: customer.id, ...paymentData },
    });

    // Lead → converted: cancel the scheduled abandonment + nurture emails.
    if (isSubscription && (subActive || subTrialing)) {
      try {
        const lead = await prisma.lead.findUnique({ where: { email } });
        if (lead && !lead.convertedAt) {
          await Promise.all([cancelScheduled(lead.abandonEmailId), cancelScheduled(lead.nurtureEmailId)]);
          await prisma.lead.update({ where: { id: lead.id }, data: { convertedAt: new Date(), stage: "converted", abandonEmailId: null, nurtureEmailId: null } });
        }
      } catch (e) { console.error("lead conversion failed:", e); }
    }

    await sendConfirmationEmail({ name, email, services, paymentType, scheduledDate, payday: payday ?? undefined });

    return NextResponse.json({
      success: true,
      customerId: customer.id,
      manageUrl: isSubscription ? manageUrl(email) : null,
    });
  } catch (err) {
    console.error("Submit error:", err);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
